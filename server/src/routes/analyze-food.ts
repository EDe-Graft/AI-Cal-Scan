import express from "express"
import OpenAI from "openai"
import dotenv from "dotenv"
import { resolve } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Load environment variables (defensive - in case server.ts hasn't loaded them yet)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") })

const router = express.Router()

// Validate API key is present
const apiKey = process.env.OPEN_ROUTER_KEY || process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error("ERROR: OPEN_ROUTER_KEY or OPENAI_API_KEY environment variable is required")
  console.error("Please set it in your .env file or environment variables")
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPEN_ROUTER_REFERRER,
    "X-Title": process.env.OPEN_ROUTER_APP_NAME,
  },
})

interface AnalyzeFoodRequest {
  image: string // base64 encoded image
}

interface AnalyzeFoodResponse {
  food: string
  calories: number
  confidence: number
}

async function analyzeFoodImage(image: string): Promise<AnalyzeFoodResponse> {
  // Ensure image has proper data URI format
  const imageData = image.startsWith("data:image") ? image : `data:image/jpeg;base64,${image}`

  const completion = await openai.chat.completions.create({
    model: "x-ai/grok-code-fast-1",
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

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error("No response from AI")
  }

  // Parse the JSON response
  const result: AnalyzeFoodResponse = JSON.parse(content)

  // Validate the response
  if (!result.food || typeof result.calories !== "number" || typeof result.confidence !== "number") {
    throw new Error("Invalid response format from AI")
  }

  // Ensure confidence is between 0 and 1
  result.confidence = Math.max(0, Math.min(1, result.confidence))

  return result
}

router.post("/analyze-food", async (req, res) => {
  try {
    console.log("API hit")
    // Check if API key is configured
    if (!apiKey) {
      return res.status(500).json({
        error: "Server configuration error",
        message: "OPEN_ROUTER_KEY or OPENAI_API_KEY environment variable is not set",
      })
    }

    const { image } = req.body as AnalyzeFoodRequest

    if (!image) {
      return res.status(400).json({ error: "Image is required" })
    }

    const result = await analyzeFoodImage(image)
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
