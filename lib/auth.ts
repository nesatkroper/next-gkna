// auth.ts
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"

import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Create a key Uint8Array
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function generateToken(authId: string): Promise<string> {
  return await new SignJWT({ authId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecretKey())
}

export async function verifyToken(token: string): Promise<{ authId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload as { authId: string }
  } catch (err) {
    console.error("JWT verify error:", err)
    return null
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
