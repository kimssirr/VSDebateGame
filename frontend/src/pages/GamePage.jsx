// ✅ 프론트엔드 - src/pages/GamePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonVS1, ButtonVS2 } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { callGrok } from '../api/grok';
import topicsByDate from '../data/topicsByDate'; 


export default function GamePage() {
  // 오늘 날짜 구하기 (한국 시간 기준)
const today = new Date().toLocaleDateString('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).replace(/\. /g, '-').replace('.', '');

// 오늘의 주제 불러오기
const topicSet = topicsByDate[today] || topicsByDate.default;
const topicChoices = topicSet.topics;

  const navigate = useNavigate();
  const [playerPick, setPlayerPick] = useState(null);
  const [aiPick, setAiPick] = useState(null);
  const [messages, setMessages] = useState([]); // {sender: 'ai' | 'user', text: ''}
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePick = async (pick) => {
    const aiChoice = topicChoices.find(c => c !== pick);
    setPlayerPick(pick);
    setAiPick(aiChoice);
    setLoading(true);
    const aiIntro = await callGrok(
      `너는 지금부터 진지한 토론자로서, ${aiChoice}가 ${pick}보다 더 좋은 이유를 하나의 문장으로 설명해줘. 오직 한국말로.
      목표는 '재미있고 깊이 있는 대화'를 이끌어내는 것.
      `);
    setMessages([{ sender: 'ai', text: aiIntro }]);
    setLoading(false);
  };

  const handleUserMessage = async () => {
    if (!inputText.trim()) return;
    const updatedMessages = [...messages, { sender: 'user', text: inputText }];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    if (updatedMessages.filter(m => m.sender === 'user').length >= 10) return;

    const lastUserMessage = updatedMessages[updatedMessages.length - 1].text;
    const aiResponse = await callGrok(`너는 ${aiPick}가 더 좋다는 입장이야. 다음 사용자 말에 한 문장으로 반론해줘: ${lastUserMessage}. 
      무조건 한국말로 말해주세요. 한자, 일본어 안됩니다.
      말투는 논리적이고, 때론 도발적으로 유도 질문을 던져야 해.
      목표는 '재미있고 깊이 있는 대화'를 이끌어내는 것.
      사용자가 어떤 주장을 하든 반론을 펼쳐야 하며, 유쾌하게 대립각을 세워야 한다.`);

    setMessages([...updatedMessages, { sender: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  const handleShowResult = () => {
    navigate('/result', { state: { messages, playerPick, aiPick } });
  };

  if (!playerPick) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Card className="max-w-xl w-full">
          <CardContent className="space-y-4 p-6 text-center">
            <h2 className="text-2xl font-bold">어떤 쪽을 선택하시겠어요?</h2>
              <div className="flex justify-center gap-4">
                <ButtonVS1 onClick={() => handlePick(topicChoices[0])}>
                  {topicChoices[0]}
                </ButtonVS1>
                <ButtonVS2 onClick={() => handlePick(topicChoices[1])}>
                  {topicChoices[1]}
                </ButtonVS2>
              </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-3xl mx-auto">
      <header className="text-center text-xl font-bold mb-2">당신의 선택: {playerPick}</header>

      <div className="flex-1 bg-white rounded-xl shadow p-4 overflow-y-auto space-y-2">
        <p>* 당신의 대사는 랭킹 명대사에 반영될 수 있습니다.</p>
        <p>* 최대 10번의 대화가 가능합니다.</p>
        {messages.map((m, i) => (
          <div key={i} className={`text-sm p-2 rounded ${m.sender === 'ai' ? 'bg-blue-100 text-left' : 'bg-green-100 text-right'}`}>
            <strong>{m.sender === 'ai' ? 'AI' : '당신'}:</strong> {m.text}
          </div>
        ))}
      
      </div>
      <div className="mt-4 space-y-2">
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="반론을 입력하세요"
        ></textarea>
        <div className="flex justify-between items-center">
          <Button disabled={loading || !inputText} onClick={handleUserMessage} type="button">
            전송
          </Button>
          {messages.filter(m => m.sender === 'user').length >= 1 && (
            <Button onClick={handleShowResult} type="button">
              토론 결과 보기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
