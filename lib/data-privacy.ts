import { createHash, randomBytes, createCipher, createDecipher } from "crypto"

// Privacy levels for different types of data
export enum PrivacyLevel {
  PRIVATE = "private",      // Only visible to user
  ANONYMOUS = "anonymous",  // Visible to community but anonymous
  PUBLIC = "public"         // Visible to community with user info
}

// Data retention policies
export interface RetentionPolicy {
  retentionDays: number
  autoDelete: boolean
  anonymizeAfterDays?: number
  encryptionRequired: boolean
}

// Default retention policies
export const RETENTION_POLICIES: Record<string, RetentionPolicy> = {
  mood_entries: {
    retentionDays: 2555, // 7 years
    autoDelete: false,
    anonymizeAfterDays: 365, // Anonymize after 1 year
    encryptionRequired: true
  },
  journal_entries: {
    retentionDays: 2555, // 7 years
    autoDelete: false,
    anonymizeAfterDays: 365,
    encryptionRequired: true
  },
  community_posts: {
    retentionDays: 1095, // 3 years
    autoDelete: true,
    anonymizeAfterDays: 90, // Anonymize after 3 months
    encryptionRequired: false
  },
  user_stats: {
    retentionDays: 3650, // 10 years
    autoDelete: false,
    encryptionRequired: false
  }
}

// Data anonymization functions
export function anonymizeUserData(userData: any): any {
  const anonymized = { ...userData }
  
  // Anonymize personal identifiers
  if (anonymized.name) {
    anonymized.name = `User_${anonymized.id.slice(0, 8)}`
  }
  
  if (anonymized.twitter_username) {
    anonymized.twitter_username = `user_${anonymized.id.slice(0, 8)}`
  }
  
  if (anonymized.twitter_avatar_url) {
    anonymized.twitter_avatar_url = null
  }
  
  // Keep wallet address for blockchain functionality but mark as anonymized
  if (anonymized.wallet_address) {
    anonymized.wallet_address_anonymized = true
  }
  
  return anonymized
}

export function anonymizeContent(content: string, type: string): string {
  // Remove or replace personal identifiers in content
  let anonymized = content
  
  // Replace email addresses
  anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
  
  // Replace phone numbers
  anonymized = anonymized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
  
  // Replace names (basic pattern matching)
  anonymized = anonymized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
  
  // Replace addresses
  anonymized = anonymized.replace(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/gi, '[ADDRESS]')
  
  return anonymized
}

// Encryption functions for sensitive data
export function encryptSensitiveData(data: string, key: string): string {
  try {
    const algorithm = 'aes-256-cbc'
    const iv = randomBytes(16)
    const cipher = createCipher(algorithm, key)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decryptSensitiveData(encryptedData: string, key: string): string {
  try {
    const algorithm = 'aes-256-cbc'
    const [ivHex, encrypted] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = createDecipher(algorithm, key)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Data hashing for privacy
export function hashUserIdentifier(identifier: string, salt?: string): string {
  const hashSalt = salt || randomBytes(16).toString('hex')
  const hash = createHash('sha256')
  hash.update(identifier + hashSalt)
  return `${hashSalt}:${hash.digest('hex')}`
}

export function verifyHashedIdentifier(identifier: string, hashedIdentifier: string): boolean {
  try {
    const [salt, hash] = hashedIdentifier.split(':')
    const computedHash = createHash('sha256').update(identifier + salt).digest('hex')
    return computedHash === hash
  } catch {
    return false
  }
}

// Privacy-aware data filtering
export function filterDataByPrivacyLevel(
  data: any[],
  privacyLevel: PrivacyLevel,
  userContext?: any
): any[] {
  switch (privacyLevel) {
    case PrivacyLevel.PRIVATE:
      // Only return data for the authenticated user
      if (!userContext?.id) return []
      return data.filter(item => item.user_id === userContext.id)
      
    case PrivacyLevel.ANONYMOUS:
      // Return data but anonymize user information
      return data.map(item => ({
        ...item,
        user: anonymizeUserData(item.user || {}),
        content: anonymizeContent(item.content || '', item.type || 'general')
      }))
      
    case PrivacyLevel.PUBLIC:
      // Return all data (still respecting basic privacy)
      return data.map(item => ({
        ...item,
        content: anonymizeContent(item.content || '', item.type || 'general')
      }))
      
    default:
      return []
  }
}

// Data retention enforcement
export function shouldRetainData(
  createdAt: Date,
  policy: RetentionPolicy
): boolean {
  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysSinceCreation <= policy.retentionDays
}

export function shouldAnonymizeData(
  createdAt: Date,
  policy: RetentionPolicy
): boolean {
  if (!policy.anonymizeAfterDays) return false
  
  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysSinceCreation >= policy.anonymizeAfterDays
}

// Privacy compliance checks
export function checkPrivacyCompliance(data: any, policy: RetentionPolicy): {
  compliant: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Check if sensitive data is encrypted
  if (policy.encryptionRequired && data.content && !data.content_encrypted) {
    issues.push('Sensitive content is not encrypted')
    recommendations.push('Encrypt sensitive content before storage')
  }
  
  // Check data retention
  if (data.created_at) {
    const createdAt = new Date(data.created_at)
    if (!shouldRetainData(createdAt, policy)) {
      issues.push('Data exceeds retention period')
      recommendations.push('Delete or anonymize data according to retention policy')
    }
  }
  
  // Check for personal identifiers in content
  if (data.content) {
    const personalInfoPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Name
    ]
    
    const hasPersonalInfo = personalInfoPatterns.some(pattern => pattern.test(data.content))
    if (hasPersonalInfo) {
      issues.push('Content contains personal identifiers')
      recommendations.push('Anonymize personal information in content')
    }
  }
  
  return {
    compliant: issues.length === 0,
    issues,
    recommendations
  }
}

// GDPR compliance helpers
export function generateDataExport(userId: string, data: any[]): any {
  return {
    user_id: userId,
    export_date: new Date().toISOString(),
    data_types: Object.keys(data.reduce((acc, item) => ({ ...acc, [item.type]: true }), {})),
    records_count: data.length,
    data: data.map(item => ({
      type: item.type,
      created_at: item.created_at,
      content: item.content,
      metadata: {
        privacy_level: item.privacy_level || 'private',
        retention_policy: RETENTION_POLICIES[item.type] || RETENTION_POLICIES.mood_entries
      }
    }))
  }
}

export function generateDataDeletion(userId: string): any {
  return {
    user_id: userId,
    deletion_date: new Date().toISOString(),
    deletion_type: 'complete',
    confirmation_required: true,
    estimated_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  }
}

// Privacy-aware analytics
export function generatePrivacySafeAnalytics(data: any[]): any {
  const analytics = {
    total_users: new Set(data.map(item => item.user_id)).size,
    total_entries: data.length,
    activity_by_type: {},
    average_mood_score: 0,
    engagement_metrics: {}
  }
  
  // Calculate activity by type
  data.forEach(item => {
    const type = item.type || 'unknown'
    analytics.activity_by_type[type] = (analytics.activity_by_type[type] || 0) + 1
  })
  
  // Calculate average mood score (only from mood entries)
  const moodEntries = data.filter(item => item.type === 'mood' && item.mood_score)
  if (moodEntries.length > 0) {
    const totalMood = moodEntries.reduce((sum, item) => sum + item.mood_score, 0)
    analytics.average_mood_score = Math.round((totalMood / moodEntries.length) * 100) / 100
  }
  
  return analytics
}

// Export privacy utilities
export const privacyUtils = {
  anonymizeUserData,
  anonymizeContent,
  encryptSensitiveData,
  decryptSensitiveData,
  hashUserIdentifier,
  verifyHashedIdentifier,
  filterDataByPrivacyLevel,
  shouldRetainData,
  shouldAnonymizeData,
  checkPrivacyCompliance,
  generateDataExport,
  generateDataDeletion,
  generatePrivacySafeAnalytics
}
