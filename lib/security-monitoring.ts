import { supabase } from "./supabase"

// Security event types
export enum SecurityEventType {
  AUTHENTICATION_SUCCESS = "authentication_success",
  AUTHENTICATION_FAILURE = "authentication_failure",
  AUTHORIZATION_FAILURE = "authorization_failure",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  DATA_ACCESS = "data_access",
  DATA_MODIFICATION = "data_modification",
  ENCRYPTION_EVENT = "encryption_event",
  DECRYPTION_EVENT = "decryption_event",
  PRIVACY_VIOLATION = "privacy_violation",
  MALICIOUS_INPUT = "malicious_input",
  SYSTEM_ERROR = "system_error"
}

// Security event severity levels
export enum SecuritySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Security event interface
export interface SecurityEvent {
  id?: string
  event_type: SecurityEventType
  severity: SecuritySeverity
  user_id?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  description: string
  metadata?: Record<string, any>
  timestamp?: Date
  resolved?: boolean
  alert_sent?: boolean
}

// Anomaly detection thresholds
export const ANOMALY_THRESHOLDS = {
  AUTH_FAILURES_PER_HOUR: 5,
  RATE_LIMIT_VIOLATIONS_PER_HOUR: 10,
  SUSPICIOUS_IP_CHANGES_PER_DAY: 3,
  UNUSUAL_DATA_ACCESS_PATTERNS: 20,
  ENCRYPTION_FAILURES_PER_HOUR: 3
}

// Security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor
  private eventQueue: SecurityEvent[] = []
  private isProcessing = false

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  // Log a security event
  async logEvent(event: SecurityEvent): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!event.timestamp) {
        event.timestamp = new Date()
      }

      // Add to queue for batch processing
      this.eventQueue.push(event)

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processEventQueue()
      }

      // Check for immediate alerts
      await this.checkForImmediateAlerts(event)
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  // Process event queue in batches
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      const batch = this.eventQueue.splice(0, 50) // Process 50 events at a time

      // Insert events into database
      const { error } = await supabase
        .from("security_events")
        .insert(batch.map(event => ({
          event_type: event.event_type,
          severity: event.severity,
          user_id: event.user_id,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          resource_type: event.resource_type,
          resource_id: event.resource_id,
          description: event.description,
          metadata: event.metadata,
          timestamp: event.timestamp,
          resolved: event.resolved || false,
          alert_sent: event.alert_sent || false
        })))

      if (error) {
        console.error("Failed to insert security events:", error)
        // Re-add events to queue for retry
        this.eventQueue.unshift(...batch)
      }
    } catch (error) {
      console.error("Error processing security event queue:", error)
    } finally {
      this.isProcessing = false

      // Process remaining events
      if (this.eventQueue.length > 0) {
        setTimeout(() => this.processEventQueue(), 1000)
      }
    }
  }

  // Check for immediate alerts
  private async checkForImmediateAlerts(event: SecurityEvent): Promise<void> {
    // Critical events should trigger immediate alerts
    if (event.severity === SecuritySeverity.CRITICAL) {
      await this.sendAlert(event, "CRITICAL")
      return
    }

    // High severity events should be logged and monitored
    if (event.severity === SecuritySeverity.HIGH) {
      await this.sendAlert(event, "HIGH")
      return
    }

    // Check for patterns that might indicate attacks
    await this.detectAnomalies(event)
  }

  // Detect security anomalies
  private async detectAnomalies(event: SecurityEvent): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Check for authentication failures
      if (event.event_type === SecurityEventType.AUTHENTICATION_FAILURE) {
        const { count } = await supabase
          .from("security_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", SecurityEventType.AUTHENTICATION_FAILURE)
          .eq("ip_address", event.ip_address)
          .gte("timestamp", oneHourAgo.toISOString())

        if (count && count >= ANOMALY_THRESHOLDS.AUTH_FAILURES_PER_HOUR) {
          await this.logEvent({
            event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: SecuritySeverity.HIGH,
            user_id: event.user_id,
            ip_address: event.ip_address,
            description: `Multiple authentication failures detected from IP ${event.ip_address}`,
            metadata: { failure_count: count, threshold: ANOMALY_THRESHOLDS.AUTH_FAILURES_PER_HOUR }
          })
        }
      }

      // Check for rate limit violations
      if (event.event_type === SecurityEventType.RATE_LIMIT_EXCEEDED) {
        const { count } = await supabase
          .from("security_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", SecurityEventType.RATE_LIMIT_EXCEEDED)
          .eq("ip_address", event.ip_address)
          .gte("timestamp", oneHourAgo.toISOString())

        if (count && count >= ANOMALY_THRESHOLDS.RATE_LIMIT_VIOLATIONS_PER_HOUR) {
          await this.logEvent({
            event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: SecuritySeverity.MEDIUM,
            user_id: event.user_id,
            ip_address: event.ip_address,
            description: `Excessive rate limit violations from IP ${event.ip_address}`,
            metadata: { violation_count: count, threshold: ANOMALY_THRESHOLDS.RATE_LIMIT_VIOLATIONS_PER_HOUR }
          })
        }
      }

      // Check for unusual data access patterns
      if (event.event_type === SecurityEventType.DATA_ACCESS) {
        const { count } = await supabase
          .from("security_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", SecurityEventType.DATA_ACCESS)
          .eq("user_id", event.user_id)
          .gte("timestamp", oneHourAgo.toISOString())

        if (count && count >= ANOMALY_THRESHOLDS.UNUSUAL_DATA_ACCESS_PATTERNS) {
          await this.logEvent({
            event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: SecuritySeverity.MEDIUM,
            user_id: event.user_id,
            ip_address: event.ip_address,
            description: `Unusual data access pattern detected for user ${event.user_id}`,
            metadata: { access_count: count, threshold: ANOMALY_THRESHOLDS.UNUSUAL_DATA_ACCESS_PATTERNS }
          })
        }
      }

    } catch (error) {
      console.error("Error detecting anomalies:", error)
    }
  }

  // Send security alerts
  private async sendAlert(event: SecurityEvent, level: string): Promise<void> {
    try {
      // In production, integrate with your alerting system (Slack, email, etc.)
      console.log(`🚨 SECURITY ALERT [${level}]: ${event.description}`, {
        event_type: event.event_type,
        severity: event.severity,
        user_id: event.user_id,
        ip_address: event.ip_address,
        timestamp: event.timestamp,
        metadata: event.metadata
      })

      // Mark alert as sent
      event.alert_sent = true

      // Store alert in database
      await supabase
        .from("security_alerts")
        .insert({
          event_id: event.id,
          alert_level: level,
          message: event.description,
          metadata: event.metadata,
          sent_at: new Date().toISOString()
        })

    } catch (error) {
      console.error("Failed to send security alert:", error)
    }
  }

  // Get security events for a user
  async getUserEvents(userId: string, limit = 100): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Failed to get user security events:", error)
      return []
    }
  }

  // Get security events for an IP address
  async getIPEvents(ipAddress: string, limit = 100): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .eq("ip_address", ipAddress)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Failed to get IP security events:", error)
      return []
    }
  }

  // Generate security report
  async generateSecurityReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString())

      if (error) throw error

      const events = data || []
      const report = {
        period: { start: startDate, end: endDate },
        total_events: events.length,
        events_by_type: {},
        events_by_severity: {},
        events_by_ip: {},
        critical_events: events.filter(e => e.severity === SecuritySeverity.CRITICAL),
        high_severity_events: events.filter(e => e.severity === SecuritySeverity.HIGH),
        suspicious_activities: events.filter(e => e.event_type === SecurityEventType.SUSPICIOUS_ACTIVITY),
        authentication_failures: events.filter(e => e.event_type === SecurityEventType.AUTHENTICATION_FAILURE),
        rate_limit_violations: events.filter(e => e.event_type === SecurityEventType.RATE_LIMIT_EXCEEDED)
      }

      // Group events by type
      events.forEach(event => {
        report.events_by_type[event.event_type] = (report.events_by_type[event.event_type] || 0) + 1
        report.events_by_severity[event.severity] = (report.events_by_severity[event.severity] || 0) + 1
        if (event.ip_address) {
          report.events_by_ip[event.ip_address] = (report.events_by_ip[event.ip_address] || 0) + 1
        }
      })

      return report
    } catch (error) {
      console.error("Failed to generate security report:", error)
      return null
    }
  }

  // Block IP address (implement IP blocking logic)
  async blockIPAddress(ipAddress: string, reason: string, duration: number): Promise<void> {
    try {
      await this.logEvent({
        event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.HIGH,
        ip_address: ipAddress,
        description: `IP address ${ipAddress} blocked: ${reason}`,
        metadata: { block_duration: duration, reason }
      })

      // In production, implement actual IP blocking (firewall rules, etc.)
      console.log(`🚫 IP ${ipAddress} blocked for ${duration} seconds: ${reason}`)
    } catch (error) {
      console.error("Failed to block IP address:", error)
    }
  }

  // Resolve security event
  async resolveEvent(eventId: string, resolution: string): Promise<void> {
    try {
      await supabase
        .from("security_events")
        .update({
          resolved: true,
          metadata: { resolution, resolved_at: new Date().toISOString() }
        })
        .eq("id", eventId)

      console.log(`✅ Security event ${eventId} resolved: ${resolution}`)
    } catch (error) {
      console.error("Failed to resolve security event:", error)
    }
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance()

// Helper functions for common security events
export const securityEvents = {
  // Authentication events
  logAuthSuccess: (userId: string, ipAddress: string, userAgent: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.AUTHENTICATION_SUCCESS,
      severity: SecuritySeverity.LOW,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: "User authentication successful"
    }),

  logAuthFailure: (userId: string, ipAddress: string, userAgent: string, reason: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.AUTHENTICATION_FAILURE,
      severity: SecuritySeverity.MEDIUM,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `Authentication failed: ${reason}`
    }),

  // Authorization events
  logAuthFailure: (userId: string, ipAddress: string, resource: string, reason: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.AUTHORIZATION_FAILURE,
      severity: SecuritySeverity.MEDIUM,
      user_id: userId,
      ip_address: ipAddress,
      resource_type: resource,
      description: `Authorization failed: ${reason}`
    }),

  // Rate limiting events
  logRateLimitExceeded: (ipAddress: string, endpoint: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.MEDIUM,
      ip_address: ipAddress,
      description: `Rate limit exceeded for endpoint: ${endpoint}`
    }),

  // Data access events
  logDataAccess: (userId: string, ipAddress: string, resourceType: string, resourceId: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.DATA_ACCESS,
      severity: SecuritySeverity.LOW,
      user_id: userId,
      ip_address: ipAddress,
      resource_type: resourceType,
      resource_id: resourceId,
      description: `Data access: ${resourceType} ${resourceId}`
    }),

  // Malicious input events
  logMaliciousInput: (userId: string, ipAddress: string, input: string, type: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.MALICIOUS_INPUT,
      severity: SecuritySeverity.HIGH,
      user_id: userId,
      ip_address: ipAddress,
      description: `Malicious input detected: ${type}`,
      metadata: { input_type: type, sanitized_input: input.substring(0, 100) }
    }),

  // Privacy violation events
  logPrivacyViolation: (userId: string, ipAddress: string, violation: string) =>
    securityMonitor.logEvent({
      event_type: SecurityEventType.PRIVACY_VIOLATION,
      severity: SecuritySeverity.HIGH,
      user_id: userId,
      ip_address: ipAddress,
      description: `Privacy violation: ${violation}`
    })
}
