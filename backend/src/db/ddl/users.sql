CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

INSERT INTO users (username, password_hash) VALUES ('igor', '8180c64408473977047b7d424ce3996aeedd2da1dfb32efe7027b0ea534722e4')
ON CONFLICT (username) DO NOTHING;
INSERT INTO users (username, password_hash) VALUES ('oleg', '8180c64408473977047b7d424ce3996aeedd2da1dfb32efe7027b0ea534722e4')
ON CONFLICT (username) DO NOTHING;
