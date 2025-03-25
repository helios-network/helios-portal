import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  runtimeEnv: {
    VITE_NODE_ENV: z.enum(["development", "production", "test"]),
    VITE_BASE_URL: z.string().url().default("http://localhost:3000")
  }
})
