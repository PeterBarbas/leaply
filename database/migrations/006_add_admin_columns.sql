-- Add admin-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ;

-- Add index on banned for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);

-- Add index on last_activity for analytics
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- Update the updated_at trigger to handle the new columns
-- (The existing trigger should already handle this)
