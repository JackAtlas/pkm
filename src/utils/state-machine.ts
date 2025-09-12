interface State {
  name: string
  onEnter?: () => void
}

export class StateMachine {
  _states: Map<string, State>
  _currentState: State | undefined
  _id: string
  _context: object | undefined
  _isChangingState: boolean
  _chaningStateQueue: string[]

  constructor(id: string, context?: object) {
    this._id = id
    this._context = context
    this._isChangingState = false
    this._chaningStateQueue = []
    this._currentState = undefined
    this._states = new Map()
  }

  get currentStateName(): string | undefined {
    return this._currentState?.name
  }

  update() {
    const next = this._chaningStateQueue.shift()
    if (next !== undefined) {
      this.setState(next)
    }
  }

  setState(name: string) {
    const methodName = 'setState'

    if (!this._states.has(name)) {
      console.warn(
        `[${StateMachine.name}-${this._id}:${methodName}] tried to change to unknown state: ${name}`
      )
      return
    }

    if (this._isCurrentState(name)) {
      return
    }

    if (this._isChangingState) {
      this._chaningStateQueue.push(name)
      return
    }

    this._isChangingState = true
    console.log(
      `[${StateMachine.name}-${
        this._id
      }:${methodName}] changed from ${
        this._currentState?.name ?? 'none'
      } to ${name}`
    )

    this._currentState = this._states.get(name)

    if (this._currentState?.onEnter) {
      console.log(
        `[${StateMachine.name}-${this._id}:${methodName}] ${this._currentState.name} onEnter invoked`
      )
      this._currentState?.onEnter()
    }

    this._isChangingState = false
  }

  addState(state: State) {
    this._states.set(state.name, {
      name: state.name,
      onEnter: this._context
        ? state.onEnter?.bind(this._context)
        : state.onEnter
    })
  }

  _isCurrentState(name: string): boolean {
    if (!this._currentState) {
      return false
    }
    return this._currentState?.name === name
  }
}
