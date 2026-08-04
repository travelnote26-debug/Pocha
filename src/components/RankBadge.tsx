import { Box } from '@mui/material'
import { feltColors as c } from '../theme/colors'

const COLORS: Record<number, { bg: string; border: string }> = {
  0: { bg: c.rankGold, border: '#FFF3A0' },
  1: { bg: c.silver, border: '#EFEFEF' },
  2: { bg: c.bronze, border: '#E89A50' }
}

interface RankBadgeProps {
  rank: number
}

export function RankBadge({ rank }: RankBadgeProps) {
  const colors = COLORS[rank] ?? { bg: 'transparent', border: 'rgba(128,128,128,0.4)' }
  const isMedal = rank in COLORS
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        minWidth: 32,
        borderRadius: '50%',
        bgcolor: colors.bg,
        border: `1.5px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14,
        color: isMedal ? '#1A1A1A' : 'text.secondary',
        boxShadow: isMedal ? 2 : 'none'
      }}
    >
      {rank + 1}
    </Box>
  )
}
