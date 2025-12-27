import express from "express"
import OpenAI from "openai"

const router = express.Router()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AnalyzeFoodRequest {
  image: string // base64 encoded image
}

interface AnalyzeFoodResponse {
  food: string
  calories: number
  confidence: number
}

router.post("/analyze-food", async (req, res) => {
  try {
    const { image } = req.body as AnalyzeFoodRequest

    if (!image) {
      return res.status(400).json({ error: "Image is required" })
    }

    // Ensure image has proper data URI format
    const imageData = image.startsWith("data:image") ? image : `data:image/jpeg;base64,${image}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide:
1. The name of the food (be specific)
2. Estimated total calories (as a number)
3. Your confidence level (0.0 to 1.0)

Respond ONLY with valid JSON in this exact format:
{"food": "food name", "calories": 123, "confidence": 0.85}

If you cannot identify the food with reasonable confidence, respond with:
{"food": "unknown food", "calories": 0, "confidence": 0.0}`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from OpenAI")
    }

    // Parse the JSON response
    const result: AnalyzeFoodResponse = JSON.parse(content)

    // Validate the response
    if (!result.food || typeof result.calories !== "number" || typeof result.confidence !== "number") {
      throw new Error("Invalid response format from AI")
    }

    // Ensure confidence is between 0 and 1
    result.confidence = Math.max(0, Math.min(1, result.confidence))

    res.json(result)
  } catch (error) {
    console.error("Error analyzing food:", error)
    res.status(500).json({
      error: "Failed to analyze food",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export { router as analyzeFoodRouter }
