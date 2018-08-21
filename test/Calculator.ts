export interface Event {
  readonly type: "Added" | "Subtracted" | "Multiplied" | "Divided";
  readonly id: string;
  readonly amount: number;
}

export const added = (id: string, amount: number): Event =>
  ({ type: "Added", id, amount });

export const subtracted = (id: string, amount: number): Event =>
  ({ type: "Subtracted", id, amount });

export const multiplied = (id: string, amount: number): Event =>
  ({ type: "Multiplied", id, amount });

export const divided = (id: string, amount: number): Event =>
  ({ type: "Divided", id, amount });

export interface Command {
  readonly type: "Add" | "Subtract" | "Multiply" | "Divide";
  readonly id: string;
  readonly amount: number;
}

export const add = (id: string, amount: number): Command =>
  ({ type: "Add", id, amount });

export const subtract = (id: string, amount: number): Command =>
  ({ type: "Subtract", id, amount });

export const multiply = (id: string, amount: number): Command =>
  ({ type: "Multiply", id, amount });

export const divide = (id: string, amount: number): Command =>
  ({ type: "Divide", id, amount });

export type State = number;

const DEFAULT_STATE: State = 0;

export function accept(state = DEFAULT_STATE, event: Event): State {
  switch (event.type) {
    case "Added":
      return state + event.amount;

    case "Subtracted":
      return state - event.amount;

    case "Multiplied":
      return state * event.amount;

    case "Divided":
      return state / event.amount;
  }
}

export class DivideByZeroError extends Error {
  public name = "DivideByZeroError";
  public message = "Cannot divide by zero";
}

export function process(_ = DEFAULT_STATE, command: Command): Event[] {
  switch (command.type) {
    case "Add":
      return [ added(command.id, command.amount) ];

    case "Subtract":
      return [ subtracted(command.id, command.amount) ];

    case "Multiply":
      return [ multiplied(command.id, command.amount) ];

    case "Divide":
      if (command.amount === 0) {
        throw new DivideByZeroError();
      }

      return [ divided(command.id, command.amount) ];
  }
}
