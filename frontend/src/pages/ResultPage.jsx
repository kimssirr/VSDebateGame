// ✅ 프론트엔드 - src/pages/ResultPage.jsx (AI 점수 추출 및 저장 추가)

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { callGrok } from '../api/grok';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages, playerPick, aiPick } = location.state || {};

  const [resultText, setResultText] = useState('');
  const [winner, setWinner] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const prepareJudgement = async () => {
      const formatMessages = messages.map((m, i) => `${m.sender === 'ai' ? 'AI' : '사용자'}: ${m.text}`).join('\n');
      const prompt = `다음은 토론 내용입니다. 누가 더 설득력 있었는지 판단해주세요.\n\n${formatMessages}\n\n승자를 \"사용자\" 또는 \"AI\"로 말하고, 간단한 이유와 승률을 알려주세요. (예: 사용자 70%, AI 30%) 한국말로 말해주세요.`;
      const res = await callGrok(prompt);
      setResultText(res);

      const winnerMatch = res.match(/(사용자|AI)/);
      const scoreMatch = res.match(/사용자\s*([0-9]{1,3})%/);

      if (winnerMatch) {
        const finalWinner = winnerMatch[1];
        setWinner(finalWinner);
        localStorage.setItem('lastWinner', finalWinner);
      }

      if (Array.isArray(messages)) {
        localStorage.setItem('lastMessages', JSON.stringify([...messages]));
      } else {
        console.warn("❌ 저장할 messages가 배열 아님:", messages);
      }

      if (scoreMatch) {
        const score = parseFloat(scoreMatch[1]);
        localStorage.setItem('lastScore', score);
        console.log("✅ AI 판단 점수 저장됨:", score);
      } else {
        console.warn("❌ 점수 추출 실패 (scoreMatch 없음)");
      }

      setLoading(false);
    };
    prepareJudgement();
  }, [messages]);

  if (!messages || !playerPick || !aiPick) {
    return (
      <div className="p-4 text-center">잘못된 접근입니다. <Button onClick={() => navigate('/')}>홈으로</Button></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-6 space-y-6 text-center">
          <h2 className="text-2xl font-bold">🏁 토론 결과</h2>
          {loading ? (
            <p>결과 분석 중...</p>
          ) : (
            <div className="space-y-4">
              <p className="text-xl font-semibold">승자: <span className="text-blue-600 font-bold">{winner}</span></p>
              <p className="text-gray-800 whitespace-pre-line">{resultText}</p>
            </div>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button onClick={() => navigate('/')}>다시 시작</Button>
            <Button onClick={() => navigate('/rankingSave')}>랭킹 기록</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}