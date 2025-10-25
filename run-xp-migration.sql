-- Run this SQL script in your Supabase SQL editor to create the XP tracking system

-- Add XP tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp_to_next_level INTEGER DEFAULT 100;

-- Add index on total_xp for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users(total_xp);

-- Add index on level for level-based queries
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);

-- Create a function to calculate XP to next level
CREATE OR REPLACE FUNCTION calculate_xp_to_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- XP required for each level: 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000...
  -- Formula: level * 100 for levels 1-3, then increasing increments
  CASE 
    WHEN current_level <= 3 THEN
      RETURN current_level * 100;
    WHEN current_level <= 6 THEN
      RETURN (current_level - 3) * 250 + 300;
    WHEN current_level <= 10 THEN
      RETURN (current_level - 6) * 500 + 1050;
    ELSE
      RETURN (current_level - 10) * 1000 + 3050;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create XP transactions table for tracking
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  task_index INTEGER NOT NULL,
  xp_amount INTEGER NOT NULL,
  task_level INTEGER NOT NULL DEFAULT 1,
  is_correct BOOLEAN NOT NULL,
  simulation_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for XP transactions
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_attempt_id ON xp_transactions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at);

-- Enable RLS on XP transactions
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for XP transactions
CREATE POLICY "Users can view own XP transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage XP transactions" ON xp_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to add XP and update level
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS JSON AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
  xp_needed INTEGER;
  leveled_up BOOLEAN := FALSE;
BEGIN
  -- Get current XP and level
  SELECT total_xp, level INTO current_xp, current_level
  FROM users WHERE id = user_id;
  
  -- Calculate new XP and level
  new_xp := current_xp + xp_amount;
  new_level := current_level;
  
  -- Check if user leveled up
  WHILE new_xp >= calculate_xp_to_next_level(new_level) LOOP
    new_level := new_level + 1;
    leveled_up := TRUE;
  END LOOP;
  
  -- Update user's XP and level
  UPDATE users 
  SET 
    total_xp = new_xp,
    level = new_level,
    xp_to_next_level = calculate_xp_to_next_level(new_level) - new_xp,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Return result
  RETURN json_build_object(
    'new_xp', new_xp,
    'new_level', new_level,
    'xp_to_next_level', calculate_xp_to_next_level(new_level) - new_xp,
    'leveled_up', leveled_up,
    'xp_gained', xp_amount
  );
END;
$$ LANGUAGE plpgsql;
