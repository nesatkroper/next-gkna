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

