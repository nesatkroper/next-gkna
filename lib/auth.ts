import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(authId: string): string {
  return jwt.sign({ authId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { authId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { authId: string }
  } catch {
    return null
  }
}

export async function getCurrentUser(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const auth = await prisma.auth.findUnique({
    where: { authId: decoded.authId },
    include: {
      role: true,
      employee: {
        include: {
          department: true,
          position: true,
          info: true,
        },
      },
    },
  })

  return auth
}
