import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Button2 } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BASE_URL } from '../lib/constants';
import topicsByDate from '../data/topicsByDate';

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [selectedDaysAgo, setSelectedDaysAgo] = useState(0);
  const [daysAgo, setDaysAgo] = useState(0);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getKSTDateString = (daysAgo) => {
    const now = new Date();
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const targetDate = new Date(kstNow);
    targetDate.setDate(kstNow.getDate() - daysAgo);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const initialDays = parseInt(searchParams.get('days') || '0', 10);
    setSelectedDaysAgo(initialDays);
    setDaysAgo(initialDays);
  }, []);

  // 랭킹 초기 fetch
  useEffect(() => {
    const fetchInitialRankings = async () => {
      setLoading(true);
      try {
        const url = `${BASE_URL}/api/rankings${daysAgo > 0 ? `?days=${daysAgo}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.rankings && Array.isArray(data.rankings)) {
          setRankings(data.rankings);
          setNextCursor(data.nextCursor);
          setHasNextPage(data.hasNextPage);
        } else {
          console.error('응답 형식이 올바르지 않음:', data);
          setRankings([]);
          setNextCursor(null);
          setHasNextPage(false);
        }
      } catch (err) {
        console.error('랭킹 불러오기 실패:', err);
        setRankings([]);
        setNextCursor(null);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialRankings();
    setNextCursor(null);
  }, [searchParams]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (nearBottom && hasNextPage && !loading) {
      handleLoadMore();
    }
  }, [hasNextPage, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 다음 랭킹 자동 fetch
  const handleLoadMore = async () => {
    if (!nextCursor || loading) return;

    setLoading(true);
    try {
      const url = `${BASE_URL}/api/rankings?${daysAgo > 0 ? `days=${daysAgo}&` : ''}cursor=${nextCursor}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.rankings && Array.isArray(data.rankings)) {
        setRankings(prev => [...prev, ...data.rankings]);
        setNextCursor(data.nextCursor);
        setHasNextPage(data.hasNextPage);
      } else {
        console.error('응답 형식이 올바르지 않음:', data);
      }
    } catch (err) {
      console.error('추가 랭킹 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setDaysAgo(selectedDaysAgo);
    setSearchParams({ days: selectedDaysAgo.toString() });
  };

  const topicDate = getKSTDateString(selectedDaysAgo);
  const topicPair = topicsByDate[topicDate]?.topics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-4 text-center">
          <h2 className="text-2xl font-bold">🏆 승률 랭킹</h2>

          {topicPair && (
            <h3 className="text-lg font-semibold text-gray-700">
              {topicPair[0]} vs {topicPair[1]}
            </h3>
          )}

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

          {loading && rankings.length === 0 ? (
            <p>불러오는 중...</p>
          ) : rankings.length === 0 ? (
            <p>아직 기록이 없습니다.</p>
          ) : (
            <ul className="text-left space-y-4">
              {rankings.map((r, i) => (
                <li
                  key={`${r.username}-${i}`}
                  className={`border p-3 rounded-md ${
                    r.isWinner ? 'bg-yellow-100' : 'bg-red-100'
                  }`}
                >
                  <p className="font-bold">
                    {i + 1}위 - {r.username} : 설득력 {r.score}%
                  </p>
                  <p className="text-sm italic text-gray-600">"{r.quote || '명대사 없음'}"</p>
                </li>
              ))}
            </ul>
          )}

          {loading && rankings.length > 0 && <p className="text-sm text-gray-500">불러오는 중...</p>}

          <Button onClick={() => navigate('/')}>홈으로</Button>
        </CardContent>
      </Card>
    </div>
  );
}
