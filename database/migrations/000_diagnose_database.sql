-- Diagnostic queries to check current database state
-- Run these one by one to see what exists

-- 1. Check if users table exists and its structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check if there are any existing policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Check if there are any existing triggers on users table
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 4. Check if there are any existing functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'update_updated_at_column');

-- 5. Check if there are any existing triggers on auth.users
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
