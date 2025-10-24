-- Add unique constraint to prevent duplicate attempts for the same user and simulation
-- This ensures each user can only have one attempt per simulation

-- First, remove any existing duplicate attempts (keep the most recent one)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, simulation_id 
      ORDER BY created_at DESC
    ) as rn
  FROM attempts
  WHERE user_id IS NOT NULL
)
DELETE FROM attempts 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint
ALTER TABLE attempts 
ADD CONSTRAINT unique_user_simulation_attempt 
UNIQUE (user_id, simulation_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_user_simulation_attempt ON attempts IS 
'Ensures each user can only have one attempt per simulation';
