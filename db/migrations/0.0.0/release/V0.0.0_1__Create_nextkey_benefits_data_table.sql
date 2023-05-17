/* V0.0.0_1__Create_nextkey_benefit_data_table.sql */
CREATE TABLE IF NOT EXISTS nextkey_benefit_data (
  fk_nextkey_benefit_id UUID NOT NULL REFERENCES nextkey_benefit_meta (nextkey_benefit_id),
  attribute TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY(fk_nextkey_benefit_id, attribute)
);
