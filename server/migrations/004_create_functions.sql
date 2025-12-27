-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get daily calorie summary
CREATE OR REPLACE FUNCTION get_daily_summary(user_uuid UUID, target_date DATE)
RETURNS TABLE (
  total_calories BIGINT,
  meal_count BIGINT,
  breakfast_calories BIGINT,
  lunch_calories BIGINT,
  dinner_calories BIGINT,
  snack_calories BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(calories), 0) as total_calories,
    COUNT(*) as meal_count,
    COALESCE(SUM(CASE WHEN meal_type = 'breakfast' THEN calories ELSE 0 END), 0) as breakfast_calories,
    COALESCE(SUM(CASE WHEN meal_type = 'lunch' THEN calories ELSE 0 END), 0) as lunch_calories,
    COALESCE(SUM(CASE WHEN meal_type = 'dinner' THEN calories ELSE 0 END), 0) as dinner_calories,
    COALESCE(SUM(CASE WHEN meal_type = 'snack' THEN calories ELSE 0 END), 0) as snack_calories
  FROM meals
  WHERE user_id = user_uuid
    AND DATE(logged_at AT TIME ZONE 'UTC') = target_date;
END;
$$ LANGUAGE plpgsql;
