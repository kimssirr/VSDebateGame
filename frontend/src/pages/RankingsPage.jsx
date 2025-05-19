// ✅ 프론트엔드 - src/pages/RankingsPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Button2 } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BASE_URL } from '../lib/constants';

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDaysAgo, setSelectedDaysAgo] = useState(0); // 선택용
  const [daysAgo, setDaysAgo] = useState(0); // fetch 트리거용

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에서 days 파라미터 초기값 읽기
  useEffect(() => {
    const initialDays = parseInt(searchParams.get('days') || '0', 10);
    setSelectedDaysAgo(initialDays);
    setDaysAgo(initialDays);
  }, []);

  // 날짜 변경 시 fetch
  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const url = `${BASE_URL}/api/rankings${daysAgo > 0 ? `?days=${daysAgo}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('응답이 배열이 아님:', data);
          setRankings([]);
          return;
        }

        setRankings(data);
      } catch (err) {
        console.error('랭킹 불러오기 실패:', err);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [searchParams]);

  // 버튼 누르면 fetch 트리거 + URL 반영
  const handleSearch = () => {
    setDaysAgo(selectedDaysAgo);
    setSearchParams({ days: selectedDaysAgo.toString() });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-4 text-center">
          <h2 className="text-2xl font-bold">🏆 승률 랭킹</h2>

          {/* 날짜 선택 + 조회 버튼 */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
            <select
              value={selectedDaysAgo}
              onChange={(e) => setSelectedDaysAgo(Number(e.target.value))}
              className="border rounded p-2 w-full sm:w-40"
            >
              {[...Array(8).keys()].map((d) => (
                <option key={d} value={d}>
                  {d === 0 ? '오늘' : `${d}일 전`}
                </option>
              ))}
            </select>

            <Button2 onClick={handleSearch}>조회</Button2>
          </div>

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
                    {i + 1}위 - {r.username} : 설득력 {r.score}%
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
