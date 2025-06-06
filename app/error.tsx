"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Rocket, RefreshCw } from "lucide-react"
import { useEffect } from "react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to the console for debugging (optional)
    console.error("Client-side error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-md w-full"
      >
        {/* Starry background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-twinkle" style={{ top: "10%", left: "20%" }} />
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle-delay-1" style={{ top: "30%", left: "60%" }} />
          <div className="absolute w-3 h-3 bg-white rounded-full opacity-15 animate-twinkle-delay-2" style={{ top: "50%", left: "30%" }} />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-25 animate-twinkle-delay-3" style={{ top: "70%", left: "80%" }} />
        </div>

        <Card className="relative bg-gray-800/80 backdrop-blur-sm border border-purple-500/30 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-bold text-white flex items-center justify-center gap-2">
              <Rocket className="h-10 w-10 text-purple-400" />
              Oops!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <motion.h2
              className="text-2xl font-semibold text-purple-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Cosmic Malfunction
            </motion.h2>
            <p className="text-gray-300">
              Something went wrong in the universe. Our engineers are working to fix the wormhole!
            </p>
            <div className="flex justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => reset()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <a href="/">Back to Home</a>
                </Button>
              </motion.div>
            </div>
            {process.env.NODE_ENV === "development" && (
              <p className="text-sm text-gray-400 mt-4">
                Error: {error.message}
                {error.digest && <span> (Digest: {error.digest})</span>}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CSS for twinkling stars animation */}
      <style jsx>{`
        .animate-twinkle {
          animation: twinkle 3s infinite;
        }
        .animate-twinkle-delay-1 {
          animation: twinkle 3s infinite 1s;
        }
        .animate-twinkle-delay-2 {
          animation: twinkle 3s infinite 2s;
        }
        .animate-twinkle-delay-3 {
          animation: twinkle 3s infinite 1.5s;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}