// auth.ts
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface UserPayload extends JWTPayload {
  authId: string;
  role: string;
  status: string;
}

// Create a key Uint8Array
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function generateToken(payload: UserPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, getSecretKey());
    
    // Type guard to ensure the payload has the required properties
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'authId' in payload &&
      'role' in payload &&
      'status' in payload
    ) {
      return payload as UserPayload;
    }
    return null;
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}


// // auth.ts
// import { SignJWT, jwtVerify } from "jose"
// import bcrypt from "bcryptjs"

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// // Create a key Uint8Array
// function getSecretKey() {
//   return new TextEncoder().encode(JWT_SECRET)
// }

// export async function generateToken(authId: string): Promise<string> {
//   return await new SignJWT({ authId })
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("7d")
//     .sign(getSecretKey())
// }

// export async function verifyToken(token: string): Promise<{ authId: string } | null> {
//   try {
//     const { payload } = await jwtVerify(token, getSecretKey())
//     return payload as { authId: string }
//   } catch (err) {
//     console.error("JWT verify error:", err)
//     return null
//   }
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//   return bcrypt.compare(password, hashedPassword)
// }
