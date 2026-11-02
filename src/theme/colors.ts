export const feltColors = {
  feltDark: '#0A2612',
  feltGreen: '#124320',
  feltMedium: '#1B582D',
  feltLight: '#2B7841',
  feltSurfaceLight: '#E8F2EA',
  feltSurfaceDark: '#152D1C',
  goldPrimary: '#FFC82C',
  goldDark: '#D49E00',
  rankGold: '#FFD700',
  rankGoldLight: '#FFF6D6',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  cardWhite: '#FAFAF7',
  cardDarkSurface: '#1E2821',
  cardRed: '#D32F2F',
  cardBlack: '#1A1A1A',
  successGreen: '#2E7D32',
  errorRed: '#D32F2F',
  winnerAmber: '#F5A623',
  outlineLight: '#81A987',
  outlineDark: '#385E40',
  onSurfaceVariantLight: '#1E3523',
  onSurfaceVariantDark: '#B8D8BC'
} as const

export const playerPalette = [
  '#C62828',
  '#1565C0',
  '#6A1B9A',
  '#00695C',
  '#E65100',
  '#283593',
  '#AD1457',
  '#4E342E',
  '#546E7A',
  '#9E9D24'
] as const

export function playerColorFor(playerId: number | null | undefined): string {
  if (playerId == null) return feltColors.feltMedium
  return playerPalette[Math.abs(Math.trunc(playerId)) % playerPalette.length]
}
