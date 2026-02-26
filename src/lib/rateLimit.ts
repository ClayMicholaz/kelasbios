// Simple in-memory rate limiter
// For production, use Redis or a proper rate limiting service

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed per window
   * @default 100
   */
  maxRequests?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Custom key generator (defaults to IP address)
   */
  keyGenerator?: (request: Request) => string;
}

/**
 * Rate limit middleware for API routes
 *
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const rateLimitResult = await rateLimit(request, {
 *     maxRequests: 10,
 *     windowMs: 60000 // 10 requests per minute
 *   });
 *
 *   if (!rateLimitResult.allowed) {
 *     return NextResponse.json(
 *       { error: "Too many requests" },
 *       { status: 429 }
 *     );
 *   }
 *
 *   // Continue with API logic...
 * }
 * ```
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig = {},
) {
  const {
    maxRequests = 100,
    windowMs = 60000,
    keyGenerator = defaultKeyGenerator,
  } = config;

  const key = keyGenerator(request);
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment the count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000), // seconds
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Default key generator using IP address and User-Agent
 */
function defaultKeyGenerator(request: Request): string {
  // Get IP from various headers (considering proxy/CDN)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  // Include user agent for better uniqueness
  const userAgent = request.headers.get("user-agent") || "unknown";

  return `${ip}:${userAgent}`;
}

/**
 * Rate limit specifically for authenticated users
 */
export function rateLimitByUser(userId: string, config: RateLimitConfig = {}) {
  const key = `user:${userId}`;
  const now = Date.now();
  const { maxRequests = 100, windowMs = 60000 } = config;

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Example: Different rate limits for different endpoints
 */
export const RATE_LIMITS = {
  // Strict: Login attempts
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
  },

  // Moderate: Profile updates
  PROFILE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },

  // Lenient: Read operations
  READ: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },

  // Very strict: Admin operations
  ADMIN: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
} as const;
