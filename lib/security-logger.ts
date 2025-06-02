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
    // Log to console for development
    console.log("Security Event:", {
      timestamp: new Date().toISOString(),
      ...event,
    })

    // Store in AuthLog table with security event format
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
        },
      })
    }

    // In production, you might want to:
    // 1. Send to external security monitoring service (e.g., Datadog, Splunk)
    // 2. Send alerts for critical events via email/Slack
    // 3. Store in a dedicated security events table

    // Example: Send critical alerts
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
