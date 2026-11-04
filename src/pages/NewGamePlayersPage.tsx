import AddIcon from '@mui/icons-material/Add'
import CasinoIcon from '@mui/icons-material/Casino'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
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
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppTopBar } from '../components/AppTopBar'
import { TablePreview } from '../components/TablePreview'
import { useDataStore } from '../state/dataStore'
import { useNewGame } from '../state/newGame'
import { playerColorFor } from '../theme/colors'

export function NewGamePlayersPage() {
  const navigate = useNavigate()
  const selectedPlayerIds = useNewGame((s) => s.selectedPlayerIds)
  const createdGameId = useNewGame((s) => s.createdGameId)
  const togglePlayerSelection = useNewGame((s) => s.togglePlayerSelection)
  const shufflePlayers = useNewGame((s) => s.shufflePlayers)
  const movePlayer = useNewGame((s) => s.movePlayer)
  const removePlayer = useNewGame((s) => s.removePlayer)
  const setDealer = useNewGame((s) => s.setDealer)
  const addPlayer = useNewGame((s) => s.addPlayer)
  const createGame = useNewGame((s) => s.createGame)
  const reset = useNewGame((s) => s.reset)

  const allPlayers = useDataStore((s) => s.db.players)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  useEffect(() => {
    if (createdGameId !== null) {
      reset()
      navigate(`/game/${createdGameId}`, { replace: true })
    }
  }, [createdGameId, navigate, reset])

  const selectedPlayers = selectedPlayerIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  const handleAdd = () => {
    if (newPlayerName.trim() === '') return
    addPlayer(newPlayerName.trim())
    setNewPlayerName('')
    setShowAddDialog(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar
        title="Seleccionar jugadores"
        onBack={() => navigate(-1)}
        actions={
          <IconButton color="inherit" aria-label="Añadir jugador" onClick={() => setShowAddDialog(true)}>
            <AddIcon />
          </IconButton>
        }
      />

      <Box sx={{ flexGrow: 1, px: 2, pb: 'calc(96px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
        {allPlayers.length > 0 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Jugadores guardados (toca para elegir)
            </Typography>
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', mt: 1, gap: 1 }}>
              {allPlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.id)
                return (
                  <Chip
                    key={player.id}
                    label={player.name}
                    clickable
                    color={isSelected ? 'secondary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => togglePlayerSelection(player.id)}
                    icon={isSelected ? <CheckIcon /> : undefined}
                    sx={{ fontWeight: isSelected ? 700 : 500 }}
                  />
                )
              })}
            </Stack>
          </Box>
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Mesa de juego
            </Typography>
            <Typography variant="body2" color={selectedPlayerIds.length < 2 ? 'error' : 'text.secondary'}>
              {selectedPlayerIds.length < 2
                ? `${selectedPlayerIds.length} seleccionados (mínimo 2)`
                : `${selectedPlayerIds.length} jugadores en orden de asiento`}
            </Typography>
          </Box>
          {selectedPlayerIds.length >= 2 && (
            <Button color="secondary" onClick={shufflePlayers} sx={{ fontWeight: 700 }}>
              <CasinoIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Sortear
            </Button>
          )}
        </Stack>

        {selectedPlayers.length > 0 && <TablePreview players={selectedPlayers} />}

        {selectedPlayers.length === 0 ? (
          <Card variant="outlined" sx={{ mt: 2, borderRadius: 2, bgcolor: 'action.hover', px: 3, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Toca los jugadores guardados arriba o añade uno nuevo para comenzar
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1.5} sx={{ py: 2 }}>
            {selectedPlayers.map((player, index) => {
              const isDealer = index === 0
              return (
                <Card
                  key={player.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: isDealer ? 'primary.main' : 'background.paper',
                    color: isDealer ? 'primary.contrastText' : 'text.primary',
                    borderColor: isDealer ? 'secondary.main' : 'divider',
                    boxShadow: isDealer ? 4 : 2,
                    px: 1.5,
                    py: 1.25
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: playerColorFor(player.id),
                        color: '#FFFFFF',
                        fontWeight: 700
                      }}
                    >
                      {index + 1}º
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {player.name}
                      </Typography>
                      {isDealer ? (
                        <Typography variant="caption" color="secondary.main" fontWeight="bold">
                          🎴 Reparte primero (Mano)
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          onClick={() => setDealer(player.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          Toca para asignar reparto
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" alignItems="center">
                      <IconButton size="small" disabled={index === 0} onClick={() => movePlayer(index, index - 1)} aria-label="Subir">
                        <KeyboardArrowUpIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={index === selectedPlayers.length - 1}
                        onClick={() => movePlayer(index, index + 1)}
                        aria-label="Bajar"
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => removePlayer(player.id)} aria-label="Quitar">
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>

      {selectedPlayerIds.length >= 2 && (
        <Fab variant="extended" color="secondary" onClick={createGame} sx={{ position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', right: 24, fontWeight: 700 }}>
          <PlayArrowIcon sx={{ mr: 1 }} />
          Empezar Partida ({selectedPlayerIds.length})
        </Fab>
      )}

      <Dialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false)
          setNewPlayerName('')
        }}
      >
        <DialogTitle fontWeight="bold">Añadir nuevo jugador</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder="Escribe nombre..."
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPlayerName.trim() !== '') handleAdd()
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddDialog(false)
              setNewPlayerName('')
            }}
          >
            Cancelar
          </Button>
          <Button variant="contained" disabled={newPlayerName.trim() === ''} onClick={handleAdd}>
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
