// ✅ 프론트엔드 - src/pages/RankingsPage.jsx 

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BASE_URL } from '../lib/constants'; // 상단에 추가


export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


useEffect(() => {
  const fetchRankings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rankings`);
      const data = await res.json();
      setRankings(data);
    } catch (err) {
      console.error('랭킹 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchRankings();
}, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-4 text-center">
          <h2 className="text-2xl font-bold">🏆 오늘의 승률 랭킹</h2>

          {loading ? (
            <p>불러오는 중...</p>
          ) : rankings.length === 0 ? (
            <p>아직 기록이 없습니다.</p>
          ) : (
            <ul className="text-left space-y-4">
  {rankings.map((r, i) => (
    <li
      key={i}
      className={`border p-3 rounded-md ${
        r.isWinner === 1 ? 'bg-yellow-100' : 'bg-red-100'
      }`}
    >
      <p className="font-bold">
        {i + 1}위 - {r.username} : 설득력 {r.averageScore}%
      </p>
      <p className="text-sm italic text-gray-600">“{r.quote || '명대사 없음'}”</p>
    </li>
  ))}
</ul>


          )}

          <Button onClick={() => navigate('/')}>홈으로</Button>
        </CardContent>
      </Card>
    </div>
  );
}
