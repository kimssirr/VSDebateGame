// backend/index.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://vs-debate-game.vercel.app'
  ]
}));
app.use(express.json());

/**
 * 랭킹 저장
 */
app.post('/api/rankings', async (req, res) => {
  const { username, score, quote, isWinner = false } = req.body;
  const now = new Date().toISOString();

  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: '이름 또는 점수가 잘못되었습니다.' });
  }

  try {
    const stmt = `
      INSERT INTO rankings (username, score, date, quote, iswinner)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await db.query(stmt, [username, score, now, quote, isWinner]);
    res.json({ success: true });
  } catch (error) {
    console.error('DB 저장 실패:', error);
    res.status(500).json({ error: '랭킹 저장 실패' });
  }
});

/**
 * 날짜 기준 랭킹 조회
 */
app.get('/api/rankings', async (req, res) => {
  let days = parseInt(req.query.days || '0', 10);
  if (isNaN(days) || days < 0) days = 0;

  try {
    // 한국 시간 기준 날짜 범위 계산
    const now = new Date();

    // 현재 시간을 한국 시간으로 보정
    const kstOffset = 9 * 60; // 9시간 → 분 단위
    const localNow = new Date(now.getTime() + kstOffset * 60 * 1000);

    // 기준일의 자정부터 계산 (KST 기준)
    localNow.setHours(0, 0, 0, 0);
    localNow.setDate(localNow.getDate() - days);

    const start = new Date(localNow);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);


    // 쿼리문: 하루 범위에 해당하는 데이터만 조회
    const stmt = `
      SELECT 
        username,
        MAX(score) AS score,
        MAX(quote) AS quote,
        MAX(CAST(iswinner AS INT)) AS iswinner_int
      FROM rankings
      WHERE 
        date >= $1 AND date < $2
      GROUP BY username
      ORDER BY 
        MAX(CAST(iswinner AS INT)) DESC,
        MAX(score) DESC
    `;

    const { rows } = await db.query(stmt, [
      start.toISOString(),
      end.toISOString()
    ]);

    // isWinner 정리
    const converted = rows.map(row => ({
      ...row,
      isWinner: row.iswinner_int === 1
    }));

    res.json(converted);
  } catch (error) {
    console.error('DB 조회 실패:', error);
    res.status(500).json({ error: '랭킹 조회 실패' });
  }
});


/**
 * Grok 프록시 API
 */
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
        messages: [{ role: 'user', content: prompt }],
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
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
