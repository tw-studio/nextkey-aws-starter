/* V0.0.0_0__Create_nextkey_benefit_meta_table.sql */
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS nextkey_benefit_meta (
  nextkey_benefit_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  /* DEFAULT after TIMESTAMPTZ is unnecessary thanks to trigger, but leaving in
     for reference and future flexibility */
  created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
);

CREATE OR REPLACE FUNCTION t_set_created_at() RETURNS trigger AS $$
BEGIN
  new.created_at := now() AT TIME ZONE 'utc';
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_set_created_at
  BEFORE INSERT ON nextkey_benefit_meta
  FOR EACH ROW EXECUTE PROCEDURE t_set_created_at();
