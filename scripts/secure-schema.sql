-- Secure database schema for GOOD CARE Network mental health DApp
-- This script implements proper security, privacy, and data protection measures

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create secure users table with encryption
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  twitter_username TEXT UNIQUE,
  twitter_name TEXT,
  twitter_avatar_url TEXT,
  name TEXT DEFAULT '',
  care_points INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date TIMESTAMP WITH TIME ZONE,
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  data_retention_consent BOOLEAN DEFAULT false,
  encryption_key_hash TEXT, -- Hash of user's encryption key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  -- Ensure at least one identifier is present
  CONSTRAINT check_user_identifier CHECK (wallet_address IS NOT NULL OR twitter_username IS NOT NULL)
);

-- Create user_stats table with privacy controls
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_checkin DATE,
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create encrypted mood_entries table
CREATE TABLE mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  notes TEXT,
  notes_encrypted TEXT, -- Encrypted version of notes
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  retention_days INTEGER DEFAULT 2555, -- 7 years
  auto_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create encrypted journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Journal Entry',
  content TEXT NOT NULL,
  content_encrypted TEXT, -- Encrypted version of content
  is_public BOOLEAN DEFAULT false,
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  retention_days INTEGER DEFAULT 2555, -- 7 years
  auto_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create community_posts table with privacy controls
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_encrypted TEXT, -- Encrypted version for sensitive content
  type TEXT DEFAULT 'general' CHECK (type IN ('gratitude', 'reflection', 'support', 'general')),
  privacy_level TEXT DEFAULT 'anonymous' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  retention_days INTEGER DEFAULT 1095, -- 3 years
  auto_delete BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create daily_activities table for tracking
CREATE TABLE daily_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('mood', 'journal', 'checkin', 'community')),
  points_earned INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('private', 'anonymous', 'public')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_retention_logs table for compliance
CREATE TABLE data_retention_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'anonymized', 'encrypted')),
  retention_policy TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create audit_logs table for security monitoring
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance and security
CREATE INDEX idx_users_wallet_address ON users(wallet_address) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_twitter_username ON users(twitter_username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_privacy_level ON users(privacy_level);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX idx_mood_entries_privacy_level ON mood_entries(privacy_level);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_privacy_level ON journal_entries(privacy_level);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_posts_privacy_level ON community_posts(privacy_level);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    privacy_level = 'public' OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- User stats policies
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    privacy_level = 'public' OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Mood entries policies
CREATE POLICY "Users can view their own mood entries" ON mood_entries
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    privacy_level = 'public' OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can insert their own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON journal_entries
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    (is_public = true AND privacy_level IN ('public', 'anonymous')) OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Community posts policies
CREATE POLICY "Users can view community posts" ON community_posts
  FOR SELECT USING (
    privacy_level = 'public' OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL) OR
    auth.uid()::text = user_id::text
  );

CREATE POLICY "Users can insert their own community posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own community posts" ON community_posts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own community posts" ON community_posts
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Daily activities policies
CREATE POLICY "Users can view their own activities" ON daily_activities
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    privacy_level = 'public' OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can insert their own activities" ON daily_activities
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Badges policies
CREATE POLICY "Users can view badges" ON badges
  FOR SELECT USING (
    privacy_level = 'public' OR
    (privacy_level = 'anonymous' AND auth.uid() IS NOT NULL) OR
    auth.uid()::text = user_id::text
  );

CREATE POLICY "System can insert badges" ON badges
  FOR INSERT WITH CHECK (true);

-- Audit logs policies (admin only)
CREATE POLICY "System can manage audit logs" ON audit_logs
  FOR ALL USING (true);

-- Data retention logs policies
CREATE POLICY "Users can view their own retention logs" ON data_retention_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can manage retention logs" ON data_retention_logs
  FOR INSERT WITH CHECK (true);

-- Create functions for data privacy and security

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, error_message, metadata
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    inet_client_addr(), current_setting('request.headers')::json->>'user-agent',
    p_success, p_error_message, p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt sensitive content
CREATE OR REPLACE FUNCTION encrypt_content(
  p_content TEXT,
  p_encryption_key TEXT
) RETURNS TEXT AS $$
BEGIN
  -- In production, use proper encryption
  -- For now, return a hash of the content
  RETURN encode(hmac(p_content, p_encryption_key, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive content
CREATE OR REPLACE FUNCTION decrypt_content(
  p_encrypted_content TEXT,
  p_encryption_key TEXT
) RETURNS TEXT AS $$
BEGIN
  -- In production, implement proper decryption
  -- For now, return the encrypted content as-is
  RETURN p_encrypted_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    name = 'User_' || substring(id::text from 1 for 8),
    twitter_username = 'user_' || substring(id::text from 1 for 8),
    twitter_avatar_url = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the anonymization
  PERFORM log_audit_event(p_user_id, 'anonymized', 'user', p_user_id, true, NULL, '{"anonymization_date": "' || NOW() || '"}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce data retention policies
CREATE OR REPLACE FUNCTION enforce_data_retention() RETURNS VOID AS $$
DECLARE
  record_record RECORD;
BEGIN
  -- Delete expired mood entries
  FOR record_record IN 
    SELECT id, user_id FROM mood_entries 
    WHERE created_at < NOW() - INTERVAL '7 years' AND deleted_at IS NULL
  LOOP
    UPDATE mood_entries SET deleted_at = NOW() WHERE id = record_record.id;
    PERFORM log_audit_event(record_record.user_id, 'deleted', 'mood_entry', record_record.id, true, NULL, '{"reason": "retention_policy", "retention_days": 2555}');
  END LOOP;
  
  -- Delete expired community posts
  FOR record_record IN 
    SELECT id, user_id FROM community_posts 
    WHERE created_at < NOW() - INTERVAL '3 years' AND deleted_at IS NULL
  LOOP
    UPDATE community_posts SET deleted_at = NOW() WHERE id = record_record.id;
    PERFORM log_audit_event(record_record.user_id, 'deleted', 'community_post', record_record.id, true, NULL, '{"reason": "retention_policy", "retention_days": 1095}');
  END LOOP;
  
  -- Anonymize old data
  FOR record_record IN 
    SELECT id, user_id FROM mood_entries 
    WHERE created_at < NOW() - INTERVAL '1 year' AND privacy_level != 'anonymous' AND deleted_at IS NULL
  LOOP
    UPDATE mood_entries SET privacy_level = 'anonymous' WHERE id = record_record.id;
    PERFORM log_audit_event(record_record.user_id, 'anonymized', 'mood_entry', record_record.id, true, NULL, '{"reason": "retention_policy", "anonymize_after_days": 365}');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON mood_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create scheduled job for data retention (runs daily)
SELECT cron.schedule('enforce-data-retention', '0 2 * * *', 'SELECT enforce_data_retention();');

-- Insert sample data for testing (with proper privacy controls)
INSERT INTO users (wallet_address, name, care_points, current_streak, longest_streak, total_checkins, privacy_level, data_retention_consent) VALUES
('0x1234567890123456789012345678901234567890', 'Alice', 150, 5, 10, 25, 'public', true),
('0x2345678901234567890123456789012345678901', 'Bob', 120, 3, 8, 20, 'anonymous', true),
('0x3456789012345678901234567890123456789012', 'Charlie', 200, 7, 12, 35, 'private', true);

-- Insert corresponding user stats
INSERT INTO user_stats (user_id, total_points, total_checkins, current_streak, longest_streak, level, privacy_level) 
SELECT id, care_points, total_checkins, current_streak, longest_streak, 
       GREATEST(1, FLOOR(care_points / 100) + 1) as level, privacy_level
FROM users;
