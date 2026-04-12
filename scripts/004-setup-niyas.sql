-- 004 setup niyas baseline.sql
UPDATE users 
SET 
  name = 'Niyas',
  credits = 1000
WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1);
