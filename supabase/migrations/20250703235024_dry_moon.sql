/*
  # Fix user statistics permissions

  1. Security Changes
    - Create a security definer function to safely access user statistics
    - This function runs with elevated privileges but only returns data for the authenticated user
    - Replace direct view access with function-based access

  2. Function Details
    - `get_user_statistics()` returns statistics for the current authenticated user
    - Uses SECURITY DEFINER to access auth.users table
    - Includes proper security checks to ensure users only see their own data
*/

-- Drop the existing view since we'll replace it with a function approach
DROP VIEW IF EXISTS user_statistics;

-- Create a security definer function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE (
  user_id uuid,
  name text,
  days_with_goals bigint,
  total_goals_set bigint,
  total_goals_completed bigint,
  completion_percentage numeric,
  story_entries bigint,
  positive_days bigint,
  negative_days bigint,
  extra_reward_days bigint,
  severe_penalty_days bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.name,
    COALESCE(goal_stats.days_with_goals, 0) as days_with_goals,
    COALESCE(goal_stats.total_goals_set, 0) as total_goals_set,
    COALESCE(goal_stats.total_goals_completed, 0) as total_goals_completed,
    CASE 
      WHEN COALESCE(goal_stats.total_goals_set, 0) = 0 THEN 0::numeric
      ELSE ROUND((COALESCE(goal_stats.total_goals_completed, 0)::numeric / goal_stats.total_goals_set::numeric) * 100, 2)
    END as completion_percentage,
    COALESCE(story_stats.story_entries, 0) as story_entries,
    COALESCE(story_stats.positive_days, 0) as positive_days,
    COALESCE(story_stats.negative_days, 0) as negative_days,
    COALESCE(story_stats.extra_reward_days, 0) as extra_reward_days,
    COALESCE(story_stats.severe_penalty_days, 0) as severe_penalty_days
  FROM profiles p
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(DISTINCT date) as days_with_goals,
      COUNT(*) as total_goals_set,
      COUNT(*) FILTER (WHERE completed = true) as total_goals_completed
    FROM daily_goals 
    WHERE user_id = auth.uid()
    GROUP BY user_id
  ) goal_stats ON p.id = goal_stats.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as story_entries,
      COUNT(*) FILTER (WHERE impact_type = 'positive') as positive_days,
      COUNT(*) FILTER (WHERE impact_type = 'negative') as negative_days,
      COUNT(*) FILTER (WHERE impact_type = 'extra_reward') as extra_reward_days,
      COUNT(*) FILTER (WHERE impact_type = 'severe_penalty') as severe_penalty_days
    FROM story_progress 
    WHERE user_id = auth.uid()
    GROUP BY user_id
  ) story_stats ON p.id = story_stats.user_id
  WHERE p.id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;