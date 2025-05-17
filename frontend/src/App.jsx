// ✅ 프론트엔드 - src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import RankingsPage from './pages/RankingsPage';
import RankingSavePage from './pages/RankingSavePage';



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/rankingSave" element={<RankingSavePage />} />
      </Routes>
    </Router>
  );
}