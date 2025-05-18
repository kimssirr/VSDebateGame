// ✅ 백엔드 - backend/db.js
import Database from 'better-sqlite3';

// SQLite DB 파일 생성 (없으면 자동 생성됨)
const db = new Database('rankings.db');

// 사용자 랭킹 테이블 초기화 (최초 1회 실행)
db.exec(`
  CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score REAL,
    date TEXT NOT NULL,
    quote TEXT,
    isWinner INTEGER DEFAULT 0 
  )
`);


export default db;
