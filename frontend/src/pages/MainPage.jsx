// 프론트엔드 - src/pages/MainPage.jsx 

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { RankingButton } from '../components/ui/rankingButton';
import { Card, CardContent } from '../components/ui/card';
import topicsByDate from '../data/topicsByDate';


export default function MainPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [leftImage, setLeftImage] = useState('');
  const [rightImage, setRightImage] = useState('');
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [now, setNow] = useState(new Date());
  const [patchHtml, setPatchHtml] = useState('');

  useEffect(() => {
    fetch('/patchNotes.html')
      .then(res => res.text())
      .then(setPatchHtml)
      .catch(() => setPatchHtml('<p class="text-sm text-red-500">패치노트를 불러오지 못했습니다.</p>'));
  }, []);


  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) setUsername(storedName);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    if (!username.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    localStorage.setItem('username', username.trim());
    navigate('/game');
  };

  const handleRankings = () => {
    navigate('/rankings');
  };


    const today = new Date().toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '-').replace('.', '');

  // 🖼️ Pixabay API로 이미지 불러오기
  useEffect(() => {
  const BASE_URL = import.meta.env.PROD ? 'https://vsdebategame.onrender.com' : '';

  const fetchImages = async () => {
    const topicData = topicsByDate[today];
    if (!topicData) return;

    const [enA, enB] = topicData.translated;
    try {
      const res1 = await fetch(`${BASE_URL}/api/pixabay?q=${encodeURIComponent(enA)}`);
      const res2 = await fetch(`${BASE_URL}/api/pixabay?q=${encodeURIComponent(enB)}`);
      const data1 = await res1.json();
      const data2 = await res2.json();
      
      // Pixabay의 largeImageURL 사용
      setLeftImage(data1.hits[0]?.largeImageURL || '');
      setRightImage(data2.hits[0]?.largeImageURL || '');
    } catch (err) {
      console.error('배경 이미지 로딩 실패:', err);
    }
  };

  fetchImages();
}, []);
  const topicSet = topicsByDate[today];
  const [topicA, topicB] = topicSet.topics;

  return (
    <div className="flex flex-col min-h-screen relative">
  {/* 배경 */}
  <div className="absolute inset-0 flex">
    <div
      className="w-1/2 h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${leftImage})`, opacity: 0.7 }}
    />
    <div
      className="w-1/2 h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${rightImage})`, opacity: 0.7 }}
    />
  </div>



  {/* 콘텐츠 영역 */}
  <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4">
    <img
      src="/og-image.png"
      alt="VS 토론 게임 대표 이미지"
      className="w-48 h-auto mb-6 rounded-lg shadow-lg"
    />
    <Card className="max-w-sm">
      <CardContent className="text-center space-y-4 p-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg">
          네 말이 틀렸어, AI야!
        </h1>
        <p className="text-lg sm:text-xl">
          오늘의 토론 주제<br /><strong>{topicA} vs {topicB}</strong>
        </p>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full border rounded p-2 text-center"
        />
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={handleStart} variant="outline">게임 시작</Button>
          <RankingButton onClick={handleRankings} variant="outline">랭킹 보기</RankingButton>
        </div>
      </CardContent>
    </Card>
  </main>

  {/* 왼쪽 아래 패치노트 버튼 */}
<button
  className="fixed bottom-4 left-4 z-30 bg-white text-black border border-gray-300 rounded px-3 py-1 shadow hover:bg-gray-100"
  onClick={() => setShowPatchNotes(true)}
>
 패치 노트
</button>
{showPatchNotes && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
        onClick={() => setShowPatchNotes(false)}
      >
        ×
      </button>

      <div
        className="prose text-sm"
        dangerouslySetInnerHTML={{ __html: patchHtml }}
      />
    </div>
  </div>
)}






</div>

  );
}
