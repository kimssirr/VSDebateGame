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
      const prompt = `다음은 사용자와 AI 간의 토론 내용입니다. 최대 5개의 메시지를 주고받을 수 있으며, 중간에 종료될 수도 있습니다. 아래 기준에 따라 누가 더 설득력 있었는지 평가하세요.

[평가 기준] (총점 100점)
1. 논리적 일관성 (40점)
2. 근거의 명확성 (25점)
3. 반박의 적절성 (25점)
4. 표현력 및 명확성 (10점)

각 기준에 대해 사용자와 AI에게 점수를 부여하고, 총점을 계산하세요. 아래 형식으로 결과를 한국어로만 작성해주세요:

- 사용자 점수: 논리 XX.X / 근거 XX.X / 반박 XX.X / 표현 XX.X → 총합 XXX.X점
- AI 점수: 논리 XX.X / 근거 XX.X / 반박 XX.X / 표현 XX.X → 총합 XXX.X점
- 승자: 사용자 또는 AI
- 이유: 간단히 설명해주세요.

[토론 내용]

${formatMessages}

결과는 위 형식 그대로 출력해주세요.`;


      
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
    if (playerPick) {
    localStorage.setItem('playerPick', playerPick); // 선택지 저장
  }
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
  
  {/* ✅ 주제 표시 */}
  <p className="text-lg font-medium text-gray-700">
    🗳️ 선택한 주제: <span className="font-semibold text-green-700">{playerPick}</span>
  </p>

  {loading ? (
    <p>결과 분석 중...</p>
  ) : (
    <div className="space-y-4">
      <p className="text-xl font-semibold">
        승자: <span className="text-blue-600 font-bold">{winner}</span>
      </p>
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