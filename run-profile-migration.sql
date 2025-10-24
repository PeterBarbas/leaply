-- Run this SQL script in your Supabase SQL editor to add missing profile columns

-- Add missing profile columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'avatar1';

-- Add index on location for potential filtering
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- Add index on website for potential filtering
CREATE INDEX IF NOT EXISTS idx_users_website ON users(website);

-- Add index on avatar for potential filtering
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar);
