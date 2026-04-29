CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  client TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  session_number INTEGER DEFAULT 1,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  resource_person TEXT,
  resource_room TEXT,
  status TEXT DEFAULT 'suggested',
  google_event_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS resource_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_type TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  alias TEXT UNIQUE NOT NULL
);

INSERT OR IGNORE INTO resource_aliases (resource_type, canonical_name, alias) VALUES
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

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT UNIQUE NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME
);
