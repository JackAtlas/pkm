export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION]

export const DIRECTION = Object.freeze({
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
  DOWN: 'DOWN',
  NONE: 'NONE'
})
