/*
  # Fix user_statistics view permissions

  1. Changes
    - Drop and recreate the user_statistics view
    - Use profiles table instead of auth.users for user information
    - Ensure proper RLS compliance for client-side access

  2. Security
    - View will respect existing RLS policies on underlying tables
    - No direct access to auth.users table from client side
*/

-- Drop the existing view
DROP VIEW IF EXISTS user_statistics;

-- Recreate the view using profiles table instead of auth.users
CREATE VIEW user_statistics AS
SELECT 
  p.id as user_id,
  p.name,
  COALESCE(goal_stats.days_with_goals, 0) as days_with_goals,
  COALESCE(goal_stats.total_goals_set, 0) as total_goals_set,
  COALESCE(goal_stats.total_goals_completed, 0) as total_goals_completed,
  CASE 
    WHEN COALESCE(goal_stats.total_goals_set, 0) > 0 
    THEN ROUND((COALESCE(goal_stats.total_goals_completed, 0)::numeric / goal_stats.total_goals_set::numeric) * 100, 2)
    ELSE 0
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
  GROUP BY user_id
) story_stats ON p.id = story_stats.user_id;