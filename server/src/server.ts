// Load environment variables FIRST, before any other imports
import dotenv from "dotenv"
import { resolve } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Get the directory of the current file and resolve .env path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from the server root directory (one level up from src/)
dotenv.config({ path: resolve(__dirname, "..", ".env") })

import express from "express"
import cors from "cors"
import { analyzeFoodRouter } from "./routes/analyze-food"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api", analyzeFoodRouter)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

