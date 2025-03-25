import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  REACT_APP_BASE_URL: z.string().url().default("http://localhost:3000")
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL
})
