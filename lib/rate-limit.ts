interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitData {
  count: number
  resetTime: number
}

const cache = new Map<string, RateLimitData>()

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (limit: number, token: string): Promise<void> => {
      const now = Date.now()
      const data = cache.get(token)

      if (!data || now > data.resetTime) {
        cache.set(token, {
          count: 1,
          resetTime: now + config.interval,
        })
        return
      }

      if (data.count >= limit) {
        throw new Error("Rate limit exceeded")
      }

      data.count++
    },
  }
}


setInterval(() => {
  const now = Date.now()
  for (const [key, data] of cache.entries()) {
    if (now > data.resetTime) {
      cache.delete(key)
    }
  }
}, 60000) // Clean every minute
