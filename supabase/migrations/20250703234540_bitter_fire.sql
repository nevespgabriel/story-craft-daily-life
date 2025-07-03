/*
  # Add unique constraint for story progress

  1. Changes
    - Add unique constraint on (user_id, date) for story_progress table
    - This allows upsert operations to work properly when generating daily stories

  2. Security
    - No changes to existing RLS policies
*/

-- Add unique constraint on user_id and date combination
ALTER TABLE story_progress 
ADD CONSTRAINT story_progress_user_date_unique 
UNIQUE (user_id, date);