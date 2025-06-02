import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"
const JWT_EXPIRES_IN = "8h"

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // High salt rounds for security
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(authId: string): string {
  const payload = {
    authId,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(), // Unique token ID
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "fertilizer-ms",
    audience: "fertilizer-ms-users",
  })
}

export function verifyToken(token: string): { authId: string; jti: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "fertilizer-ms",
      audience: "fertilizer-ms-users",
    }) as any

    return {
      authId: decoded.authId,
      jti: decoded.jti,
    }
  } catch (error) {
    return null
  }
}

export function generateSecureRandomString(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

export function generateMFASecret(): string {
  return crypto.randomBytes(20).toString("base32")
}



// import bcrypt from "bcryptjs"
// import jwt from "jsonwebtoken"
// import { prisma } from "./prisma"

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// export async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 12)
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//   return bcrypt.compare(password, hashedPassword)
// }

// export function generateToken(authId: string): string {
//   return jwt.sign({ authId }, JWT_SECRET, { expiresIn: "7d" })
// }

// export function verifyToken(token: string): { authId: string } | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as { authId: string }
//   } catch {
//     return null
//   }
// }

// export async function getCurrentUser(token: string) {
//   const decoded = verifyToken(token)
//   if (!decoded) return null

//   const auth = await prisma.auth.findUnique({
//     where: { authId: decoded.authId },
//     include: {
//       Role: true,
//       Employee: {
//         include: {
//           Department: true,
//           Position: true,
//           Employeeinfo: true,
//         },
//       },
//     },
//   })

//   return auth
// }
