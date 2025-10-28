-- Add career-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS career_goal TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT;

-- Add indexes for potential filtering
CREATE INDEX IF NOT EXISTS idx_users_career_goal ON users(career_goal);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);

-- Update the updated_at trigger to handle the new columns
-- (The existing trigger should already handle this, but let's make sure)
