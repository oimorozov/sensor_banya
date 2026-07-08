CREATE TABLE IF NOT EXISTS metrics (
    id     BIGSERIAL PRIMARY KEY,
    metric TEXT             NOT NULL,
    value  DOUBLE PRECISION NOT NULL,
    ts     TIMESTAMPTZ      NOT NULL DEFAULT now()
);
