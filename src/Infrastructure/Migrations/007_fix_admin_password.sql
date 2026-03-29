-- Fix admin password hash (previous hash in 004 was a placeholder and did not match '111aaa**')
-- Hash below is generated from BCrypt.Net.BCrypt.HashPassword("111aaa**", 12)
UPDATE users
SET password_hash = '$2a$12$mh5Ciz3zFOhHzNxA/5/Kg./2hKsCdOXQqJK.ykozlQx3pWtlwh5ki'
WHERE username = 'admin';
