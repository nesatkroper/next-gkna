import { prisma } from "@/lib/prisma"

interface SecurityEvent {
  type: string
  ip: string
  userAgent: string
  email?: string
  userId?: string
  details: string
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    console.log("Security Event:", {
      timestamp: new Date().toISOString(),
      ...event,
    })

    if (event.userId) {
      await prisma.authLog.create({
        data: {
          authId: event.userId,
          method: "SECURITY_EVENT",
          url: event.type,
          status: event.type.includes("FAILED") || event.type.includes("VIOLATION") ? 401 : 200,
          responseTime: 0,
          ip: event.ip,
          userAgent: event.userAgent,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      })
    }
    if (isCriticalEvent(event.type)) {
      await sendSecurityAlert(event)
    }
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}

function isCriticalEvent(eventType: string): boolean {
  const criticalEvents = ["RATE_LIMIT_EXCEEDED", "CSRF_VIOLATION", "REPLAY_ATTACK", "ACCOUNT_LOCKED", "SYSTEM_ERROR"]
  return criticalEvents.includes(eventType)
}

async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  // Implement your alerting mechanism here
  // Examples:
  // - Send email to security team
  // - Post to Slack channel
  // - Send to monitoring service

  console.warn("CRITICAL SECURITY EVENT:", event)

  // Example email alert (you'd need to implement email service)
  // await sendEmail({
  //   to: "security@yourcompany.com",
  //   subject: `Security Alert: ${event.type}`,
  //   body: `Security event detected: ${JSON.stringify(event, null, 2)}`
  // })
}
