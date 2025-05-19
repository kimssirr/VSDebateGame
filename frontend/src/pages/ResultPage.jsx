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
      const prompt = `
다음은 사용자와 AI 간의 토론 내용입니다.  
당신은 공정한 심판으로서, 오직 **내용만 보고 판단**해야 합니다.  

---

[평가 기준] (총점 100점)

1. 현실 공감도 (30점): 실제 생활 경험에 기반했거나 청중이 쉽게 공감할 수 있는 내용인지  
2. 창의성 (20점): 독특한 발상, 유쾌하거나 기발한 접근이 있는지  
3. 반박력 (20점): 상대 주장의 핵심을 정확히 찌르고 논리적으로 반박했는지  
4. 간결·명확한 표현 (10점): 불필요한 말 없이 핵심이 잘 전달됐는지  
5. 감성적 매력 (20점): 인간적인 매력 (유머, 경험담, 감정 표현 등)이 돋보였는지  

---

사용자와 AI 모두에게 점수를 부여해주세요.  

---

[출력 형식 예시]
- 사용자 점수: 총합 XXX.X점  
- AI 점수: 총합 XXX.X점  
- 승자: 사용자 또는 AI  
- 이유: 간단히 설명해주세요. 둘의 대화 내용이 들어가면 더 좋습니다.

[토론 내용]  
${formatMessages}

결과는 위 형식 그대로 출력해주세요.
`;

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
