import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Auto-generate unique codes
export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${random}`.toUpperCase()
}

export function generateProductCode(): string {
  return generateCode("PRD")
}

export function generateCategoryCode(): string {
  return generateCode("CAT")
}

export function generateEmployeeCode(): string {
  return generateCode("EMP")
}

export function generateCustomerCode(): string {
  return generateCode("CUS")
}

export function generateSupplierCode(): string {
  return generateCode("SUP")
}

export function generatePositionCode(): string {
  return generateCode("POS")
}

export function generateDepartmentCode(): string {
  return generateCode("DEP")
}



// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// export function formatCurrency(amount: number): string {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   }).format(amount)
// }

// export function formatDate(date: Date | string): string {
//   return new Intl.DateTimeFormat("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   }).format(new Date(date))
// }

// export function formatDateTime(date: Date | string): string {
//   return new Intl.DateTimeFormat("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(new Date(date))
// }
