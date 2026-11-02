import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Add as AddIcon } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { EmptyState } from '../components/EmptyState'
import { PlayerStatsDialog } from '../components/PlayerStatsDialog'
import type { Player } from '../domain/models'
import { useDataStore } from '../state/dataStore'
import { playerColorFor } from '../theme/colors'

export function PlayersPage() {
  const navigate = useNavigate()
  const players = useDataStore((s) => s.db.players)
  const createPlayer = useDataStore((s) => s.createPlayer)
  const deletePlayer = useDataStore((s) => s.deletePlayer)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [playerStats, setPlayerStats] = useState<Player | null>(null)
  const [newPlayerName, setNewPlayerName] = useState('')

  const handleAdd = () => {
    if (newPlayerName.trim() === '') return
    createPlayer(newPlayerName.trim())
    setNewPlayerName('')
    setShowAddDialog(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar title="Gestionar Jugadores" onBack={() => navigate(-1)} />

      <Box sx={{ flexGrow: 1, px: 2, pb: 12 }}>
        {players.length === 0 ? (
          <EmptyState title="No hay jugadores guardados" subtitle="Toca + para añadir un jugador" />
        ) : (
          <Stack spacing={1} sx={{ py: 2 }}>
            {players.map((player) => (
              <Card
                key={player.id}
                variant="outlined"
                sx={{ borderRadius: 2, boxShadow: 1, cursor: 'pointer' }}
                onClick={() => setPlayerStats(player)}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{ bgcolor: playerColorFor(player.id), color: '#FFFFFF', fontWeight: 700 }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {player.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Toca para ver estadísticas
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton
                    aria-label="Eliminar"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPlayerToDelete(player)
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Fab
        color="secondary"
        aria-label="Añadir jugador"
        onClick={() => setShowAddDialog(true)}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={showAddDialog} onClose={() => { setShowAddDialog(false); setNewPlayerName('') }}>
        <DialogTitle fontWeight="bold">Nuevo Jugador</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nombre"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPlayerName.trim() !== '') handleAdd()
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowAddDialog(false); setNewPlayerName('') }}>Cancelar</Button>
          <Button variant="contained" disabled={newPlayerName.trim() === ''} onClick={handleAdd}>
            Añadir
          </Button>
        </DialogActions>
      </Dialog>

      <PlayerStatsDialog player={playerStats} onClose={() => setPlayerStats(null)} />

      <Dialog open={playerToDelete !== null} onClose={() => setPlayerToDelete(null)}>
        <DialogTitle fontWeight="bold">Eliminar jugador</DialogTitle>
        <DialogContent>
          <Typography>¿Eliminar a {playerToDelete?.name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlayerToDelete(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (playerToDelete) deletePlayer(playerToDelete.id)
              setPlayerToDelete(null)
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
