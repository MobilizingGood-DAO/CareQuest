import { z } from "zod"

// Base validation schemas
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format")
  .transform(val => val.toLowerCase())

export const userIdSchema = z
  .string()
  .uuid("Invalid user ID format")

export const timestampSchema = z
  .string()
  .regex(/^\d{10,13}$/, "Invalid timestamp format")
  .transform(val => parseInt(val))

// Mood tracking validation
export const moodScoreSchema = z
  .number()
  .int()
  .min(1, "Mood score must be at least 1")
  .max(10, "Mood score must be at most 10")

export const moodEntrySchema = z.object({
  user_id: userIdSchema.optional(),
  wallet_address: walletAddressSchema.optional(),
  mood_score: moodScoreSchema,
  notes: z.string().max(1000, "Notes too long").optional(),
}).refine(data => data.user_id || data.wallet_address, {
  message: "Either user_id or wallet_address is required",
  path: ["user_id"]
})

// Journal entry validation
export const journalEntrySchema = z.object({
  user_id: userIdSchema.optional(),
  wallet_address: walletAddressSchema.optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  is_public: z.boolean().default(false),
}).refine(data => data.user_id || data.wallet_address, {
  message: "Either user_id or wallet_address is required",
  path: ["user_id"]
})

// Community post validation
export const communityPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000, "Content too long"),
  type: z.enum(["gratitude", "reflection", "support", "general"]).default("general"),
})

// User profile validation
export const userProfileSchema = z.object({
  wallet_address: walletAddressSchema.optional(),
  twitter_username: z.string().max(50, "Username too long").optional(),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
})

// Authentication validation
export const authSchema = z.object({
  wallet_address: walletAddressSchema,
  signature: z.string().min(1, "Signature is required"),
  timestamp: timestampSchema,
  message: z.string().optional(),
})

// Points and rewards validation
export const pointsAwardSchema = z.object({
  user_id: userIdSchema,
  activity_type: z.enum(["mood", "journal", "checkin", "community"]),
  points: z.number().int().min(0, "Points must be non-negative"),
  bonus_points: z.number().int().min(0, "Bonus points must be non-negative").optional(),
})

// Blockchain transaction validation
export const blockchainTransactionSchema = z.object({
  userId: userIdSchema,
  content: z.string().min(1, "Content is required").max(1000, "Content too long"),
  emotionalTag: z.string().max(50, "Emotional tag too long"),
})

// Rate limiting validation
export const rateLimitSchema = z.object({
  client_ip: z.string().ip("Invalid IP address"),
  endpoint: z.string().min(1, "Endpoint is required"),
  timestamp: timestampSchema,
})

// Data sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
}

// Validation helper functions
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validatedData = await schema.parseAsync(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(", ")
      return { success: false, error: errorMessage }
    }
    return { success: false, error: "Validation failed" }
  }
}

export function validateWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    // This would need to be implemented with proper wallet signature verification
    // For now, we'll do basic format validation
    if (!signature.startsWith("0x") || signature.length !== 132) {
      return false
    }
    
    // In production, use proper signature verification
    // const recoveredAddress = ethers.verifyMessage(message, signature)
    // return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
    
    return true // Placeholder
  } catch {
    return false
  }
}

// Content filtering for mental health safety
export const contentFilterSchema = z.object({
  content: z.string().refine(
    (content) => {
      const lowerContent = content.toLowerCase()
      
      // Check for potentially harmful content
      const harmfulPatterns = [
        /\b(suicide|kill myself|end it all)\b/i,
        /\b(harm|hurt|cut)\s+(myself|self)\b/i,
        /\b(drugs?|overdose|pills?)\b/i,
      ]
      
      return !harmfulPatterns.some(pattern => pattern.test(lowerContent))
    },
    {
      message: "Content contains potentially harmful language. Please seek professional help if you're in crisis."
    }
  ),
  requiresReview: z.boolean().default(false),
})

// Privacy level validation
export const privacyLevelSchema = z.enum([
  "private",    // Only visible to user
  "anonymous",  // Visible to community but anonymous
  "public"      // Visible to community with user info
])

// Data retention validation
export const retentionSchema = z.object({
  retention_days: z.number().int().min(1).max(3650), // Max 10 years
  auto_delete: z.boolean().default(false),
  anonymize_after_days: z.number().int().min(30).max(365).optional(),
})

// Export all schemas
export const schemas = {
  walletAddress: walletAddressSchema,
  userId: userIdSchema,
  moodEntry: moodEntrySchema,
  journalEntry: journalEntrySchema,
  communityPost: communityPostSchema,
  userProfile: userProfileSchema,
  auth: authSchema,
  pointsAward: pointsAwardSchema,
  blockchainTransaction: blockchainTransactionSchema,
  rateLimit: rateLimitSchema,
  contentFilter: contentFilterSchema,
  privacyLevel: privacyLevelSchema,
  retention: retentionSchema,
}
