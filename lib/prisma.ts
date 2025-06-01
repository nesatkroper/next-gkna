import { PrismaClient } from "@/lib/generated/prisma";

// Declare globally to avoid hot-reload issues in Next.js
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize only once
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;