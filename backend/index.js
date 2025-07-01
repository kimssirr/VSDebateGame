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
    'https://vs-debate-game-3.vercel.app'
  ]
}));
app.use(express.json());

/**
 * 랭킹 저장
 */
app.post('/api/rankings', async (req, res) => {
  try {
    const { username, score, quote, isWinner, date } = req.body;

    if (!username || typeof score !== 'number') {
      return res.status(400).json({ error: '필수 정보 누락' });
    }

    // 클라이언트에서 KST 기준 ISO 문자열을 보냈으므로 그냥 저장
    const insertDate = date ? new Date(date) : new Date();

    await db.query(`
      INSERT INTO rankings (username, score, quote, iswinner, date)
      VALUES ($1, $2, $3, $4, $5)
    `, [username, score, quote, isWinner, insertDate]);

    res.status(201).json({ message: '랭킹 저장 완료' });
  } catch (err) {
    console.error('랭킹 저장 실패:', err);
    res.status(500).json({ error: '랭킹 저장 중 서버 오류' });
  }
});


/**
 * 날짜 기준 랭킹 조회
 */
app.get('/api/rankings', async (req, res) => {
  let days = parseInt(req.query.days || '0', 10);
  const cursor = req.query.cursor;
  const limit = 10;

  if (isNaN(days) || days < 0) days = 0;

  try {
    const KST_OFFSET = 9 * 60 * 60 * 1000;

    // 현재 시각 기준 KST 시간 만들기
    const now = new Date();
    const kstNow = new Date(now.getTime() + KST_OFFSET);

    // KST 기준 날짜 문자열 만들기 (요청한 daysAgo 반영)
    const year = kstNow.getFullYear();
    const month = String(kstNow.getMonth() + 1).padStart(2, '0');
    const date = String(kstNow.getDate() - days).padStart(2, '0');
    const kstDateString = `${year}-${month}-${date}`; // 예: 2025-05-21

    // 해당 날짜의 KST 자정 기준 UTC 시간 계산
    const startUtc = new Date(`${kstDateString}T00:00:00+09:00`);
    const endUtc = new Date(`${kstDateString}T24:00:00+09:00`);

    // 디버깅용 로그
    // console.log('조회 범위 (KST):',
    //   new Date(startUtc.getTime() + KST_OFFSET).toLocaleString('ko-KR'),
    //   '~',
    //   new Date(endUtc.getTime() + KST_OFFSET).toLocaleString('ko-KR')
    // );

    let cursorCondition = '';
    let params = [startUtc.toISOString(), endUtc.toISOString()];

    if (cursor) {
      const [cursorScore, cursorUsername] = cursor.split('::');
      cursorCondition = `
        AND (
          score < $3 
          OR (score = $3 AND username > $4)
        )
      `;
      params.push(parseFloat(cursorScore), cursorUsername);
    }

    const stmt = `
    WITH RankedData AS (
      SELECT 
        username,
        MAX(score) as score,
        MAX(quote) as quote,
        BOOL_OR(iswinner) as iswinner,
        MIN(date) as first_submission
      FROM rankings
      WHERE date >= $1 AND date < $2
      GROUP BY username
    )
    SELECT 
      username,
      score,
      quote,
      iswinner,
      first_submission
    FROM RankedData
    WHERE TRUE ${cursorCondition}
    ORDER BY 
      iswinner DESC,
      score DESC,
      first_submission ASC,
      username ASC
    LIMIT ${limit + 1}

    `;

    const { rows } = await db.query(stmt, params);

    const hasNextPage = rows.length > limit;
    const data = rows.slice(0, limit);
    const nextCursor = hasNextPage ? `${data[data.length - 1].score}::${data[data.length - 1].username}` : null;

    res.json({
      rankings: data.map(row => ({
        username: row.username,
        score: row.score,
        quote: row.quote,
        isWinner: row.iswinner
      })),
      nextCursor,
      hasNextPage
    });

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

/**
 * Pixabay 프록시 API
 */
app.get('/api/pixabay', async (req, res) => {
  const { q } = req.query;
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Pixabay API 키가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q)}&image_type=photo&per_page=3`);
    const data = await response.json();
    
    if (!data.hits || data.hits.length === 0) {
      return res.json({ hits: [{ largeImageURL: '' }] });
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Pixabay API 오류:', error);
    res.status(500).json({ error: 'Pixabay API 호출 실패', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
