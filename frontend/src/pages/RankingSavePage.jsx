// ✅ 프론트엔드 - src/pages/RankingSavePage.jsx (AI 점수 기반 랭킹 저장)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const BASE_URL = import.meta.env.PROD
  ? 'https://vsdebategame.onrender.com'
  : '';

export default function RankingSavePage() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🏁 랭킹 저장 페이지 시작");

    const username = localStorage.getItem('username');
    const scoreRaw = localStorage.getItem('lastScore');
    const messagesRaw = localStorage.getItem('lastMessages');
    const topic = localStorage.getItem('playerPick');


    let messages = [];
    try {
      const parsed = JSON.parse(messagesRaw || '[]');
      if (Array.isArray(parsed)) {
        messages = parsed;
      } else {
        console.warn("❌ lastMessages 파싱 결과 배열 아님:", parsed);
      }
    } catch (err) {
      console.error('❌ lastMessages 파싱 실패:', err);
    }

    const score = parseFloat(scoreRaw);

    if (!username || isNaN(score) || messages.length === 0) {
      console.log("❌ 필요한 데이터 없음:", { username, score, messages });
      setResult('이름, 점수 또는 대화 기록이 없습니다.');
      return;
    }

    const userMessages = messages.filter(m => m?.sender === 'user' && m?.text?.trim());
    const bestQuote = userMessages.length > 0 ? userMessages.at(-1).text : '(명대사 없음)';

    console.log("✅ 추출된 명대사:", bestQuote);
    console.log("✅ 저장할 점수:", score);

    fetch(`${BASE_URL}/api/rankings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score, quote: bestQuote, topic }),
    })
      .then(res => res.json())
      .then(() => setResult(`✅ 랭킹에 기록되었습니다! (${score.toFixed(1)}점)`))
      .catch(() => setResult('❌ 기록 실패.'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">🏆 랭킹 기록</h2>
          <p>{result || '기록 중...'}</p>
          <Button onClick={() => navigate('/')}>홈으로</Button>
        </CardContent>
      </Card>
    </div>
  );
}
