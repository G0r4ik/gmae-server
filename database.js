import Database from 'better-sqlite3';
const db = new Database('foobar.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS history  (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER,
  user2_id INTEGER,
  date_of_play TIMESTAMP,
  user1_score INTEGER,
  user2_score INTEGER,
  result text,
  FOREIGN KEY (user1_id) REFERENCES users (id)
  FOREIGN KEY (user2_id) REFERENCES users (id)
)
`);
export default db;
