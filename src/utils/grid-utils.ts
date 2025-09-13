import { DIRECTION, Direction } from '@/common/direction'
import { Coordinate } from '@/types/typedef'
import { exhaustiveGuard } from './guard'
import { TILE_SIZE } from '@/config'

export function getTargetPositionFromGameObjectPositionAndDirection(
  currentPosition: Coordinate,
  direction: Direction
) {
  const targetPosition = { ...currentPosition }
  switch (direction) {
    case DIRECTION.UP:
      targetPosition.y -= TILE_SIZE
      break
    case DIRECTION.DOWN:
      targetPosition.y += TILE_SIZE
      break
    case DIRECTION.LEFT:
      targetPosition.x -= TILE_SIZE
      break
    case DIRECTION.RIGHT:
      targetPosition.x += TILE_SIZE
      break
    case DIRECTION.NONE:
      break
    default:
      exhaustiveGuard(direction)
  }

  return targetPosition
}
