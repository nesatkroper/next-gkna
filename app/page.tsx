"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // 👈 ensures cookie is sent
        })

        if (res.ok) {
          router.replace("/dashboard")
        } else {
          router.replace("/login")
        }
      } catch (err) {
        console.error("Auth check failed", err)
        router.replace("/login")
      }
    }

    checkToken()
  }, [router])

  return null // optional loading spinner
}
