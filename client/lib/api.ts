const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"

export interface AnalyzeFoodResponse {
  food: string
  calories: number
  confidence: number
}

export async function analyzeFood(imageBase64: string): Promise<AnalyzeFoodResponse> {
  const response = await fetch(`${API_URL}/api/analyze-food`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageBase64,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to analyze food")
  }

  return response.json()
}
