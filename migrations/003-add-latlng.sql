-- Up
ALTER TABLE photos ADD COLUMN lat float;
ALTER TABLE photos ADD COLUMN lng float;

-- Down
-- Do nothing.