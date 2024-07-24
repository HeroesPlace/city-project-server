import db from '../../../database/postgresql/index.js'
import { getClient } from '../../../database/redis/index.js'
import { getOthersSessions } from '../index.js'

import { getFrame, getBorder, foundOtherPlayers, getCharacterListCoords } from './map.js'

const onCharacterSpawn = async ({ socket }) => {
  const client = getClient()

  const coords = await client.hgetall(`coords:characters:${socket.characterId}`)

  const othersCoords = await getCharacterListCoords(getOthersSessions(socket))
  const others = await foundOtherPlayers({ x: coords.x, y: coords.y }, othersCoords)

  const bottomLayerFrame = getFrame(0, coords.x, coords.y)
  const worldLayerFrame = getFrame(1, coords.x, coords.y)
  const aboveLayerFrame = getFrame(2, coords.x, coords.y)

  socket.emit('character_spawn', {
    layers: [
      bottomLayerFrame,
      worldLayerFrame,
      aboveLayerFrame
    ],
    others
  })
}

const onCharacterMove = async ({ socket, content }) => {
  const client = getClient()

  moveCharacter(socket.characterId, content.direction)

  const coords = await client.hgetall(`coords:characters:${socket.characterId}`)

  const othersCoords = await getCharacterListCoords(getOthersSessions(socket))
  const others = await foundOtherPlayers({ x: coords.x, y: coords.y }, othersCoords)

  const bottomLayerBorder = getBorder(0, coords.x, coords.y, content.direction)
  const worldLayerBorder = getBorder(1, coords.x, coords.y, content.direction)
  const aboveLayerBorder = getBorder(2, coords.x, coords.y, content.direction)

  socket.emit('character_move', {
    direction: content.direction,
    layers: [
      bottomLayerBorder,
      worldLayerBorder,
      aboveLayerBorder
    ],
    others
  })
}

const moveCharacter = async (characterId, direction) => {
  const client = getClient()
  const path = `coords:characters:${characterId}`

  if (direction === 'right' || direction === 'left') {
    await client.hincrby(path, 'x', (direction === 'right') ? 1 : -1)
  }

  if (direction === 'up' || direction === 'down') {
    await client.hincrby(path, 'y', (direction === 'down') ? 1 : -1)
  }
}

export {
  onCharacterSpawn,
  onCharacterMove
}
