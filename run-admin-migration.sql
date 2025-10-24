-- Run this SQL script in your Supabase SQL editor to add admin columns to users table

-- Add admin-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ;

-- Add index on banned for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);

-- Add index on last_activity for analytics
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- Create admin_settings table for storing admin configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'We''re currently performing maintenance. Please check back later.',
  allow_user_registration BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  max_users_per_day INTEGER DEFAULT 100,
  system_announcement TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only service role can access admin settings
CREATE POLICY "Service role can manage admin settings" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default admin settings
INSERT INTO admin_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
