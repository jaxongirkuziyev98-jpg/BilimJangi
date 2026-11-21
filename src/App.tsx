import { FloatingBackground } from './components/FloatingBackground';
import { TopBar } from './components/TopBar';
import { useSocketSync } from './hooks/useSocket';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { GamePage } from './pages/GamePage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { LobbyPage } from './pages/LobbyPage';
import { ProfileSubjectPage } from './pages/ProfileSubjectPage';
import { ResultsPage } from './pages/ResultsPage';
import { WelcomePage } from './pages/WelcomePage';
import { useGameStore } from './store/useGameStore';

export default function App() {
  useSocketSync();
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <FloatingBackground />
      <TopBar />

      <div className="flex-1">
        {screen === 'welcome' && <WelcomePage />}
        {screen === 'profile' && <ProfileSubjectPage />}
        {screen === 'create_room' && <CreateRoomPage />}
        {screen === 'join_room' && <JoinRoomPage />}
        {screen === 'lobby' && <LobbyPage />}
        {screen === 'game' && <GamePage />}
        {screen === 'results' && <ResultsPage />}
      </div>
    </div>
  );
}
