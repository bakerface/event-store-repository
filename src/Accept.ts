export type Accept<State, Event> = (state: State | undefined, event: Event) => State;
