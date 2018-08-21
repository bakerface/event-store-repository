import { Key } from "@event-store/memory";
import { Accept } from "./Accept";
import { Process } from "./Process";

export class Aggregate<State, Command, Event> {
  public constructor(
    private acceptor: Accept<State, Event>,
    private processor: Process<State, Command, Event>,
    public state: State | undefined,
    public key: Key | undefined,
    public events: Event[] = [],
  ) {}

  public process(command: Command) {
    const events = this.processor(this.state, command);

    this.events = this.events.concat(events);
    this.state = events.reduce(this.acceptor, this.state);

    return this;
  }
}
