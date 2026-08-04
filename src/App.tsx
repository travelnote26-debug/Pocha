import { Navigate, Route, Routes } from 'react-router-dom'
import { GamePage } from './pages/GamePage'
import { GameOverPage } from './pages/GameOverPage'
import { HomePage } from './pages/HomePage'
import { NewGamePage } from './pages/NewGamePage'
import { NewGamePlayersPage } from './pages/NewGamePlayersPage'
import { PlayersPage } from './pages/PlayersPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/new-game" element={<NewGamePage />} />
      <Route path="/new-game/players" element={<NewGamePlayersPage />} />
      <Route path="/game/:gameId" element={<GamePage />} />
      <Route path="/game-over/:gameId" element={<GameOverPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
