// ✅ 프론트엔드 - src/pages/ResultPage.jsx 

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
1. 논리적 타당성 (40점) 주장과 근거가 얼마나 일관되고 논리적으로 연결되어 있는가
2. 신박함/창의성 (30점) 예상치 못한 시각 제시 여부
3. 반박의 적절성 (20점) 상대의 주장에 대한 반론이 얼마나 적절하고 설득력 있는가
4. 표현력 및 명확성 (10점) 문장이 얼마나 명확하고 설득력 있게 전달되었는가

각 기준에 대해 사용자와 AI에게 점수를 부여하고, 총점을 계산하세요. 아래 형식으로 결과를 한국어로만 작성해주세요:

- 사용자 점수: 논리력 XX.X / 창의성 XX.X / 반박력 XX.X / 표현력 XX.X → 총합 XXX.X점
- AI 점수: 논리력 XX.X / 창의성 XX.X / 반박력 XX.X / 표현력 XX.X → 총합 XXX.X점
- 승자: 사용자 또는 AI
- 이유: 간단히 설명해주세요.

[토론 내용]

${formatMessages}

결과는 위 형식 그대로 출력해주세요.`;

      const res = await callGrok(prompt);
      setResultText(res);

      const winnerMatch = res.match(/승자:\s*(사용자|AI)/);
      const userScoreMatch = res.match(/사용자.*?총합\s*([\d.]+)점/);
      const aiScoreMatch = res.match(/AI.*?총합\s*([\d.]+)점/);

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

      if (userScoreMatch) {
        const userScore = parseFloat(userScoreMatch[1]);
        localStorage.setItem('lastScore', userScore);
        console.log("✅ 사용자 점수 저장됨:", userScore);
      } else {
        console.warn("❌ 사용자 점수 추출 실패");
      }

      if (aiScoreMatch) {
        const aiScore = parseFloat(aiScoreMatch[1]);
        console.log("📊 AI 점수 추출:", aiScore);
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
