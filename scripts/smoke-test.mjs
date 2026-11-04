import { firefox } from 'playwright'

const BASE = 'http://localhost:4173'
const log = (m) => console.log('[smoke]', m)

async function main() {
  const browser = await firefox.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  try {
    log('goto home')
    await page.goto(BASE, { waitUntil: 'load' })
    await page.getByText('No hay partidas registradas').waitFor()
    log('empty state ok')

    await page.getByLabel('Jugadores').click()
    log('players page')
    await page.getByRole('button', { name: 'Añadir jugador' }).click()
    await page.getByLabel('Nombre').fill('Ana')
    await page.getByRole('button', { name: 'Añadir' }).click()
    await page.getByRole('button', { name: 'Añadir jugador' }).click()
    await page.getByLabel('Nombre').fill('Luis')
    await page.getByRole('button', { name: 'Añadir' }).click()
    await page.getByText('Ana').first().waitFor()
    await page.getByText('Luis').first().waitFor()
    log('players added')

    await page.getByLabel('Volver').click()
    await page.getByRole('button', { name: 'Nueva Partida' }).click()
    log('new game page')
    await page.getByText('Subida').click()
    await page.getByText('Bajada').click()
    await page.getByText('Siguiente').click()
    log('phases selected')

    await page.getByRole('button', { name: 'Ana' }).click()
    await page.getByRole('button', { name: 'Luis' }).click()
    await page.getByRole('button', { name: /Empezar Partida/ }).click()
    log('game created, navigating to game')

    await page.getByText('Preparados para la ronda').waitFor()
    await page.getByRole('button', { name: /Introducir predicciones/ }).click()
    log('round info -> predictions')

    // Round 1 of Subida with 2 players = 1 carta. Predicciones: total != 1.
    // Luis first (turn order index 1). Luis=1 -> Ana solo puede 1.
    await page.getByRole('button', { name: /^1$/ }).first().click()
    await page.getByRole('button', { name: /^1$/ }).first().click()
    log('predictions 1+1')

    log('reload to verify round draft')
    await page.reload({ waitUntil: 'load' })

    log('back to round info keeps predictions')
    await page.getByLabel('Volver').click()
    await page.getByText('Preparados para la ronda').waitFor()
    await page.getByRole('button', { name: /Introducir predicciones/ }).click()

    await page.getByRole('button', { name: 'Confirmar predicciones' }).click()
    await page.getByRole('button', { name: /Continuar con bazas reales/ }).waitFor()

    log('back from predictions summary')
    await page.getByLabel('Volver').click()
    await page.getByRole('button', { name: 'Confirmar predicciones' }).waitFor()
    await page.getByRole('button', { name: 'Confirmar predicciones' }).click()
    await page.getByRole('button', { name: /Continuar con bazas reales/ }).click()
    log('predictions confirmed')

    // Bazas reales deben sumar 1. Se permite elegir cualquier valor,
    // pero el total se valida al confirmar.
    await page.getByRole('button', { name: /^1$/ }).first().click()
    await page.getByRole('button', { name: /^1$/ }).first().click()
    await page.getByRole('button', { name: 'Confirmar bazas' }).click()
    await page.getByText('Las bazas deben sumar 1. Ahora suman 2.').waitFor()
    log('invalid actuals blocked')
    await page.getByRole('button', { name: /^0$/ }).first().click()
    await page.getByRole('button', { name: 'Confirmar bazas' }).click()
    log('actuals confirmed')

    await page.getByText('Resultado de la ronda').waitFor()
    const bodyText = await page.textContent('body')
    if (!bodyText.includes('Siguiente ronda')) throw new Error('missing "Siguiente ronda"')
    log('round scored ok')

    log('edit last round')
    await page.getByLabel('Acciones de la partida').click()
    await page.getByRole('menuitem', { name: 'Historial de rondas' }).click()
    await page.getByRole('button', { name: /Corregir ronda 1/ }).click()
    await page.getByText('Corrigiendo la última ronda').waitFor()
    await page.getByRole('button', { name: 'Confirmar predicciones' }).click()
    await page.getByRole('button', { name: /Continuar con bazas reales/ }).click()
    await page.getByRole('button', { name: 'Confirmar bazas' }).click()
    await page.getByText('Resultado de la ronda').waitFor()
    log('last round corrected')

    // Persistence check: reload home, game should appear as "En curso"
    await page.goto(BASE, { waitUntil: 'load' })
    await page.getByText('Tus Partidas').waitFor()
    await page.getByText('En curso').first().waitFor()
    log('persistence ok')

    // Finish the game and check results screen
    await page.getByText('En curso').first().click()
    await page.getByText('Preparados para la ronda').waitFor()
    await page.getByLabel('Acciones de la partida').click()
    await page.getByRole('menuitem', { name: 'Salir de la partida' }).click()
    await page.getByRole('button', { name: 'Finalizar' }).click()
    await page.getByText('¡CAMPEÓN DE LA POCHA!').waitFor()
    await page.getByText('Clasificación Final').waitFor()
    await page.getByText('Detalle por rondas').waitFor()
    log('game over ok')

    await page.getByRole('button', { name: 'Revancha' }).click()
    await page.getByText('Preparados para la ronda').waitFor()
    log('rematch ok')

    log('SMOKE TEST OK')
    if (errors.length) {
      console.log('CONSOLE ERRORS:', errors)
      process.exitCode = 1
    }
  } catch (e) {
    console.error('SMOKE TEST FAILED:', e.message)
    if (errors.length) console.log('CONSOLE ERRORS:', errors)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

main()
