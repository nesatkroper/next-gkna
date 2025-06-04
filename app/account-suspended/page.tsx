"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Ban, Mail, Home, ArrowLeft, AlertTriangle, Clock } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const banIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.8,
    },
  },
}

interface AccountSuspendedPageProps {
  reason?: string
  suspensionDate?: string
  contactEmail?: string
  appealUrl?: string
}

export default function AccountSuspendedPage({
  reason = "violation of our terms of service",
  suspensionDate = new Date().toLocaleDateString(),
  contactEmail = "support@example.com",
  appealUrl = "/appeal",
}: AccountSuspendedPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-3xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div className="text-center space-y-6" variants={itemVariants}>
          <div className="flex justify-center">
            <motion.div className="relative" variants={banIconVariants}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-2xl">
                <Ban className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-30 animate-pulse"></div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Account Suspended</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Your account access has been temporarily restricted
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Suspension Notice */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Suspension Notice:</strong> Your account was suspended on {suspensionDate} due to {reason}.
            </AlertDescription>
          </Alert>

          {/* Information Card */}
          <Card className="p-6 md:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  What does this mean?
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your account has been temporarily suspended while we review recent activity. During this time, you
                  won't be able to access certain features or services.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    Review our terms of service and community guidelines
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    Contact our support team if you believe this is an error
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    Submit an appeal if you'd like to request a review
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={appealUrl} className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Submit Appeal
              </Link>
            </Button>
          </motion.div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <Link href={`mailto:${contactEmail}`} className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Support
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
          </Button>
        </motion.div>

        {/* Back Link */}
        <motion.div className="text-center pt-4" variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="text-center text-xs text-slate-400 dark:text-slate-500 space-y-1"
          variants={itemVariants}
        >
          <p>Account suspensions are typically reviewed within 24-48 hours.</p>
          <p>For urgent matters, please contact our support team directly.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
