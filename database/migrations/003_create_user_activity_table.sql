-- Create user_activity table for tracking daily user engagement
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('simulation_completed', 'simulation_started', 'login', 'discovery_session')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate activities per day per user per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_unique 
ON user_activity (user_id, activity_date, activity_type);

-- Create index for efficient streak calculations
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date 
ON user_activity (user_id, activity_date DESC);

-- Create index for activity type filtering
CREATE INDEX IF NOT EXISTS idx_user_activity_type 
ON user_activity (activity_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activity
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can do everything" ON user_activity
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE TRIGGER update_user_activity_updated_at
  BEFORE UPDATE ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_date DATE DEFAULT CURRENT_DATE,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity (user_id, activity_date, activity_type, metadata)
  VALUES (p_user_id, p_activity_date, p_activity_type, p_metadata)
  ON CONFLICT (user_id, activity_date, activity_type)
  DO UPDATE SET 
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate user streaks
CREATE OR REPLACE FUNCTION calculate_user_streaks(p_user_id UUID)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  total_active_days INTEGER
) AS $$
DECLARE
  activity_dates DATE[];
  current_streak_count INTEGER := 0;
  longest_streak_count INTEGER := 0;
  temp_streak_count INTEGER := 0;
  i INTEGER;
  current_date DATE := CURRENT_DATE;
  activity_date DATE;
BEGIN
  -- Get all unique activity dates for the user, ordered by date descending
  SELECT ARRAY_AGG(DISTINCT activity_date ORDER BY activity_date DESC)
  INTO activity_dates
  FROM user_activity
  WHERE user_id = p_user_id
    AND activity_date <= current_date;
  
  -- If no activity, return zeros
  IF activity_dates IS NULL OR array_length(activity_dates, 1) = 0 THEN
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;
  
  -- Calculate current streak (consecutive days from today backwards)
  FOR i IN 1..array_length(activity_dates, 1) LOOP
    activity_date := activity_dates[i];
    
    -- Check if this date is consecutive to the previous day
    IF i = 1 THEN
      -- First date should be today or yesterday
      IF activity_date = current_date OR activity_date = current_date - INTERVAL '1 day' THEN
        current_streak_count := 1;
        temp_streak_count := 1;
      ELSE
        -- Gap found, current streak is 0
        current_streak_count := 0;
        temp_streak_count := 1;
      END IF;
    ELSE
      -- Check if this date is consecutive to the previous date
      IF activity_dates[i-1] - activity_date = INTERVAL '1 day' THEN
        temp_streak_count := temp_streak_count + 1;
        -- Update current streak only if we're still in the current streak period
        IF current_streak_count > 0 THEN
          current_streak_count := temp_streak_count;
        END IF;
      ELSE
        -- Gap found, reset temp streak
        temp_streak_count := 1;
        -- If we were in current streak, it's now broken
        IF current_streak_count > 0 THEN
          current_streak_count := 0;
        END IF;
      END IF;
    END IF;
    
    -- Update longest streak
    IF temp_streak_count > longest_streak_count THEN
      longest_streak_count := temp_streak_count;
    END IF;
  END LOOP;
  
  -- Return the calculated streaks
  RETURN QUERY SELECT 
    current_streak_count,
    longest_streak_count,
    array_length(activity_dates, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
