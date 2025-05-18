// ✅ 백엔드 - backend/index.js 

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import db from './db.js';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(cors({
  origin: [
    'https://vsdebategame.vercel.app',
    'https://vs-debate-game.vercel.app' 
  ]
}));
app.use(express.json());

// 테이블 초기화 
db.exec(`
  CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score REAL,
    date TEXT NOT NULL,
    quote TEXT
  )
`);


// 결과 저장
app.post('/api/rankings', (req, res) => {
  const { username, score, quote } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: '이름 또는 점수가 잘못되었습니다.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO rankings (username, score, date, quote) VALUES (?, ?, ?, ?)');
    stmt.run(username, score, today, quote);
    res.json({ success: true });
  } catch (error) {
    console.error('DB 저장 실패:', error);
    res.status(500).json({ error: '랭킹 저장 실패' });
  }
});

// 오늘의 랭킹 조회 (score 평균 기준 정렬)
app.get('/api/rankings', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const rows = db.prepare(`
      SELECT username,
             COUNT(*) AS games,
             ROUND(AVG(score), 1) AS averageScore,
             MAX(quote) AS quote
      FROM rankings
      WHERE date = ?
      GROUP BY username
      ORDER BY averageScore DESC, games DESC
    `).all(today);

    res.json(rows);
  } catch (error) {
    console.error('DB 조회 실패:', error);
    res.status(500).json({ error: '랭킹 조회 실패' });
  }
});

const imageCache = {};

app.get('/api/unsplash', async (req, res) => {
  const query = req.query.q;
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !query) return res.status(400).json({ error: 'Missing API key or query' });

  // 캐시된 이미지가 있다면 그대로 반환
  if (imageCache[query]) {
    return res.json({ url: imageCache[query] });
  }

  try {
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${key}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const imageUrl = data?.urls?.regular || null;

    if (imageUrl) {
      imageCache[query] = imageUrl;
    }

    res.json({ url: imageUrl });
  } catch (err) {
    console.error('Unsplash API 오류:', err);
    res.status(500).json({ error: '이미지 요청 실패' });
  }
});



// Grok API 프록시
app.post('/api/grok', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Grok API 키가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();
    res.json({ result: result || '(응답 없음)' });
  } catch (error) {
    console.error('❌ Grok API 오류:', error);
    res.status(500).json({ error: 'Grok API 호출 실패', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Grok API 서버 실행 중: http://localhost:${PORT}`);
});