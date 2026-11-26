import { FloatingBackground } from './components/FloatingBackground';
import { InviteModal } from './components/InviteModal';
import { TopBar } from './components/TopBar';
import { useSocketSync } from './hooks/useSocket';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { GamePage } from './pages/GamePage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LobbyPage } from './pages/LobbyPage';
import { LoginPage } from './pages/LoginPage';
import { ProfileDashboardPage } from './pages/ProfileDashboardPage';
import { ProfileSubjectPage } from './pages/ProfileSubjectPage';
import { ResultsPage } from './pages/ResultsPage';
import { WelcomePage } from './pages/WelcomePage';
import { useGameStore } from './store/useGameStore';

export default function App() {
  useSocketSync();
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="min-h-dvh w-full overflow-x-hidden flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <FloatingBackground />
      <TopBar />
      <InviteModal />

      <div className="flex-1 min-w-0">
        {screen === 'login' && <LoginPage />}
        {screen === 'welcome' && <WelcomePage />}
        {screen === 'dashboard' && <ProfileDashboardPage />}
        {screen === 'leaderboard' && <LeaderboardPage />}
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
