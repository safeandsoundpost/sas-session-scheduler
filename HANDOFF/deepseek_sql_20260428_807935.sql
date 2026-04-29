-- migrations/0001_init.sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT,
  client TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  start_time DATETIME,
  end_time DATETIME,
  resource_person TEXT,
  resource_room TEXT,
  status TEXT DEFAULT 'suggested',
  google_event_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE resource_aliases (
  id INTEGER PRIMARY KEY,
  resource_type TEXT,
  canonical_name TEXT,
  alias TEXT UNIQUE
);

INSERT INTO resource_aliases (resource_type, canonical_name, alias) VALUES
('person', 'Thom', 'thom'),
('person', 'Thom', 'thom@safeandsound.com'),
('person', 'Thom', 'tom'),
('person', 'Jesse', 'jesse'),
('person', 'Jesse', 'jesse@safeandsound.com'),
('person', 'Alex', 'alex'),
('room', 'Studio 1', 'st1'),
('room', 'Studio 1', 'studio 1'),
('room', 'Studio 1', 'studio_a'),
('room', 'Studio 2', 'st2'),
('room', 'Studio 2', 'studio 2'),
('room', 'Studio 2', 'studio_b'),
('room', 'Studio 3', 'st3'),
('room', 'Studio 3', 'studio 3');

CREATE TABLE oauth_tokens (
  id INTEGER PRIMARY KEY,
  user_email TEXT UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME
);