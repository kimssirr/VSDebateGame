// ✅ 프론트엔드 - src/pages/ResultPage.jsx 

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { RankingButton } from '../components/ui/rankingButton';
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
      const prompt = `다음은 사용자와 AI 간의 토론 내용입니다.  
당신은 공정한 심판으로서, 오직 **내용만 보고 판단**해야 합니다.  
AI라고 해서 더 잘했다고 생각하지 마세요.  
오히려 사람이 만든 주장에는 현실적인 설득력이 있을 수 있습니다.
AI가 논리적으로 정확하더라도, 현실적이지 않거나 와닿지 않으면 감점해도 된다.

[평가 기준] (총점 100점)
1. 현실 공감도 (40점): 청중(일반 사용자)이 공감하거나 일상 경험에 기반했는가?
2. 창의성 (30점): 예상치 못한 발상, 유쾌한 방식이 있는가?
3. 반박력 (20점): 상대 주장에 어떻게 반응했는가?
4. 간결·명확한 표현 (10점): 불필요한 수식 없이 의도를 잘 전달했는가?

사용자와 AI 모두에게 점수를 부여해주세요.


[출력 형식 예시]
- 사용자 점수: 총합 XXX.X점
- AI 점수: 총합 XXX.X점
- 승자: 사용자 또는 AI
- 이유: 간단히 설명해주세요.

[토론 내용]
${formatMessages}


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
            <RankingButton onClick={() => navigate('/rankingSave')}>랭킹 기록</RankingButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
