import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authenticateRequest } from "@/lib/auth-middleware"
import { validateInput, moodEntrySchema, sanitizeString } from "@/lib/input-validation"
import { privacyUtils, PrivacyLevel } from "@/lib/data-privacy"
import { awardPoints } from "@/lib/points-system"

export async function POST(request: NextRequest) {
  try {
    console.log("🔒 Secure Mood API called")
    
    // Step 1: Authenticate the request
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      console.error("❌ Authentication failed:", authResult.error)
      return authResult.response || NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      )
    }

    const user = authResult.user
    console.log("✅ User authenticated:", user.id)

    // Step 2: Validate and sanitize input
    const body = await request.json()
    const validationResult = await validateInput(moodEntrySchema, body)
    
    if (!validationResult.success) {
      console.error("❌ Input validation failed:", validationResult.error)
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      )
    }

    const { mood_score, notes } = validationResult.data
    
    // Sanitize user input
    const sanitizedNotes = notes ? sanitizeString(notes) : null
    
    // Step 3: Content filtering for mental health safety
    if (sanitizedNotes) {
      const contentFilterResult = await validateInput(
        require("@/lib/input-validation").contentFilterSchema,
        { content: sanitizedNotes }
      )
      
      if (!contentFilterResult.success) {
        console.warn("⚠️ Content flagged for review:", contentFilterResult.error)
        // Log for review but don't block the request
        // In production, you might want to flag this for human review
      }
    }

    // Step 4: Check for existing mood entry today
    const today = new Date().toISOString().split("T")[0]
    console.log("📅 Checking for existing mood entry on:", today)
    
    const { data: existingEntry, error: checkError } = await supabase
      .from("mood_entries")
      .select("id, privacy_level")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`)
      .is("deleted_at", null)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking existing entry:", checkError)
      return NextResponse.json(
        { success: false, error: "Database error checking existing entry" },
        { status: 500 }
      )
    }

    if (existingEntry) {
      console.log("⚠️ User already logged mood today")
      return NextResponse.json(
        { success: false, error: "You have already logged your mood today" },
        { status: 400 }
      )
    }

    console.log("✅ No existing mood entry found, creating new one")

    // Step 5: Encrypt sensitive data if needed
    let encryptedNotes = null
    if (sanitizedNotes) {
      try {
        // In production, use a proper encryption key management system
        const encryptionKey = process.env.ENCRYPTION_KEY || "default-key-change-in-production"
        encryptedNotes = privacyUtils.encryptSensitiveData(sanitizedNotes, encryptionKey)
      } catch (error) {
        console.error("❌ Encryption failed:", error)
        return NextResponse.json(
          { success: false, error: "Failed to encrypt sensitive data" },
          { status: 500 }
        )
      }
    }

    // Step 6: Create mood entry with privacy controls
    const { data: moodEntry, error: moodError } = await supabase
      .from("mood_entries")
      .insert({
        user_id: user.id,
        mood_score,
        notes: sanitizedNotes, // Store both plain and encrypted versions
        notes_encrypted: encryptedNotes,
        privacy_level: PrivacyLevel.PRIVATE, // Default to private for mental health data
        retention_days: 2555, // 7 years
        auto_delete: false
      })
      .select()
      .single()

    if (moodError) {
      console.error("❌ Error creating mood entry:", moodError)
      return NextResponse.json(
        { success: false, error: moodError.message },
        { status: 500 }
      )
    }

    console.log("✅ Mood entry created:", moodEntry.id)

    // Step 7: Award points using the unified system
    console.log("🎯 Awarding points for mood activity")
    const pointsResult = await awardPoints(user.id, "mood")

    if (!pointsResult.success) {
      console.error("❌ Error awarding points:", pointsResult.error)
      // Don't fail the mood creation, but return the error in response
      return NextResponse.json({
        success: true,
        mood_entry: {
          id: moodEntry.id,
          mood_score: moodEntry.mood_score,
          created_at: moodEntry.created_at,
          privacy_level: moodEntry.privacy_level
        },
        points_awarded: 0,
        streak_days: 0,
        multiplier: 1,
        new_level: 1,
        points_error: pointsResult.error,
        message: "Mood logged successfully, but there was an issue awarding points."
      })
    }

    console.log("🎉 Points awarded successfully:", pointsResult)

    // Step 8: Log audit event
    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: 'created',
        p_resource_type: 'mood_entry',
        p_resource_id: moodEntry.id,
        p_success: true,
        p_metadata: {
          mood_score,
          has_notes: !!sanitizedNotes,
          privacy_level: moodEntry.privacy_level,
          points_awarded: pointsResult.finalPoints
        }
      })
    } catch (auditError) {
      console.warn("⚠️ Failed to log audit event:", auditError)
      // Don't fail the request for audit logging errors
    }

    // Step 9: Return success response with privacy-aware data
    const responseData = {
      success: true,
      mood_entry: {
        id: moodEntry.id,
        mood_score: moodEntry.mood_score,
        created_at: moodEntry.created_at,
        privacy_level: moodEntry.privacy_level
        // Note: We don't return the notes in the response for privacy
      },
      points_awarded: pointsResult.finalPoints,
      streak_days: pointsResult.streakDays,
      multiplier: pointsResult.multiplier,
      new_level: pointsResult.newLevel,
      message: `Mood logged successfully! You earned ${pointsResult.finalPoints} CARE points.`,
      privacy_info: {
        data_retention_days: moodEntry.retention_days,
        auto_delete: moodEntry.auto_delete,
        encryption_status: encryptedNotes ? "encrypted" : "not_applicable"
      }
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })

  } catch (error) {
    console.error("❌ Secure Mood API error:", error)
    
    // Log the error for monitoring
    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: null,
        p_action: 'error',
        p_resource_type: 'mood_entry',
        p_success: false,
        p_error_message: error instanceof Error ? error.message : 'Unknown error',
        p_metadata: {
          endpoint: '/api/mood/create-secure',
          timestamp: new Date().toISOString()
        }
      })
    } catch (auditError) {
      console.warn("⚠️ Failed to log error audit event:", auditError)
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    )
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://app.goodonavax.info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-wallet-address, x-signature, x-timestamp',
      'Access-Control-Max-Age': '86400',
    },
  })
}
