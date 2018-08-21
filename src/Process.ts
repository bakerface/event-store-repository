export type Process<State, Command, Event> = (state: State | undefined, command: Command) => Event[];
