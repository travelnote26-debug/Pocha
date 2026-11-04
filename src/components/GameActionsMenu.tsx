import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import HistoryIcon from '@mui/icons-material/History'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'
import type { Game } from '../domain/models'
import { RoundHistoryDialog } from './RoundHistoryDialog'
import { StandingsDialog } from './StandingsDialog'

interface GameActionsMenuProps {
  game: Game
  onExit: () => void
}

export function GameActionsMenu({ game, onExit }: GameActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showStandings, setShowStandings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const closeMenu = () => setAnchorEl(null)

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Acciones de la partida"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={anchorEl !== null} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu()
            setShowStandings(true)
          }}
        >
          <ListItemIcon>
            <LeaderboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clasificación general</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu()
            setShowHistory(true)
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Historial de rondas</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu()
            onExit()
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Salir de la partida</ListItemText>
        </MenuItem>
      </Menu>

      <StandingsDialog game={game} open={showStandings} onClose={() => setShowStandings(false)} />
      <RoundHistoryDialog game={game} open={showHistory} onClose={() => setShowHistory(false)} />
    </>
  )
}
