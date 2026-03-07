import { NextRequest, NextResponse } from "next/server"
import { supabase } from "./supabase"
import { ethers } from "ethers"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    wallet_address: string
    name?: string
  }
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function authenticateRequest(
  request: NextRequest,
  requireWallet = true
): Promise<{ success: boolean; user?: any; error?: string; response?: NextResponse }> {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || request.ip || "unknown"
    const rateLimitResult = checkRateLimit(clientIp)
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: "Rate limit exceeded",
        response: NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": rateLimitResult.retryAfter.toString() } }
        )
      }
    }

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    const walletAddress = request.headers.get("x-wallet-address")
    const signature = request.headers.get("x-signature")
    const timestamp = request.headers.get("x-timestamp")

    if (!authHeader && !walletAddress) {
      return {
        success: false,
        error: "Authentication required",
        response: NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
    }

    let user = null

    // JWT Authentication (if auth header present)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(token)
      
      if (jwtError || !jwtUser) {
        return {
          success: false,
          error: "Invalid JWT token",
          response: NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
      }
      
      // Get user from database
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("id", jwtUser.id)
        .single()
      
      if (dbError || !dbUser) {
        return {
          success: false,
          error: "User not found",
          response: NextResponse.json({ error: "User not found" }, { status: 404 })
        }
      }
      
      user = dbUser
    }

    // Wallet Authentication (if wallet address present)
    if (walletAddress && signature && timestamp) {
      // Verify timestamp (prevent replay attacks)
      const now = Math.floor(Date.now() / 1000)
      const requestTime = parseInt(timestamp)
      if (Math.abs(now - requestTime) > 300) { // 5 minutes tolerance
        return {
          success: false,
          error: "Request expired",
          response: NextResponse.json({ error: "Request expired" }, { status: 401 })
        }
      }

      // Verify signature
      const message = `Authenticate to GOOD CARE Network\nTimestamp: ${timestamp}`
      const expectedAddress = ethers.verifyMessage(message, signature)
      
      if (expectedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return {
          success: false,
          error: "Invalid signature",
          response: NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }
      }

      // Get user from database
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single()
      
      if (dbError && dbError.code !== "PGRST116") {
        return {
          success: false,
          error: "Database error",
          response: NextResponse.json({ error: "Database error" }, { status: 500 })
        }
      }
      
      user = dbUser
    }

    if (requireWallet && !user) {
      return {
        success: false,
        error: "User not found",
        response: NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      success: false,
      error: "Authentication failed",
      response: NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
  }
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100 // Max requests per window

  const key = `rate_limit:${clientIp}`
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) }
  }

  record.count++
  return { allowed: true, retryAfter: 0 }
}

// Clean up old rate limit records
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute
