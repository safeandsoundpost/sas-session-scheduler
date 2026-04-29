-- Remove Studio 3
DELETE FROM resource_aliases WHERE canonical_name = 'Studio 3';

-- Update Studio 1 → ST1 (150 John St)
UPDATE resource_aliases SET canonical_name = 'ST1 (150 John St)' WHERE canonical_name = 'Studio 1';
INSERT OR IGNORE INTO resource_aliases (resource_type, canonical_name, alias) VALUES
  ('room', 'ST1 (150 John St)', 'studio_a');

-- Update Studio 2 → ST2 (150 John St)
UPDATE resource_aliases SET canonical_name = 'ST2 (150 John St)' WHERE canonical_name = 'Studio 2';
INSERT OR IGNORE INTO resource_aliases (resource_type, canonical_name, alias) VALUES
  ('room', 'ST2 (150 John St)', 'studio_b');

-- Add TCHA (Difuze Studio A)
INSERT OR IGNORE INTO resource_aliases (resource_type, canonical_name, alias) VALUES
  ('room', 'TCHA (17 Central Hospital Lane)', 'tcha'),
  ('room', 'TCHA (17 Central Hospital Lane)', 'studio a'),
  ('room', 'TCHA (17 Central Hospital Lane)', 'studio_a_tch');

-- Add TCHB (Difuze Studio B)
INSERT OR IGNORE INTO resource_aliases (resource_type, canonical_name, alias) VALUES
  ('room', 'TCHB (17 Central Hospital Lane)', 'tchb'),
  ('room', 'TCHB (17 Central Hospital Lane)', 'studio b'),
  ('room', 'TCHB (17 Central Hospital Lane)', 'studio_b_tch');
