import { EventStore, SnapshotStore, Subject } from "@event-store/memory";
import { Accept } from "./Accept";
import { Aggregate } from "./Aggregate";
import { Process } from "./Process";

export class EventStoreRepository<State, Command, Event> {
  public constructor(
    private accept: Accept<State, Event>,
    private process: Process<State, Command, Event>,
    private eventStore: EventStore<Event>,
    private snapshotStore: SnapshotStore<State>,
  ) {}

  public async fetch(subject: Subject) {
    const snapshot = await this.snapshotStore.fetch(subject);

    let key = snapshot ? snapshot.key : undefined;
    let state = snapshot ? snapshot.state : undefined;

    for (;;) {
      const page = await this.eventStore.fetch(subject, key);

      key = page.next;

      if (page.events.length === 0) {
        return new Aggregate<State, Command, Event>(
          this.accept,
          this.process,
          subject,
          state,
          key,
        );
      }

      state = page.events.reduce(this.accept, state);
    }
  }

  public async save(aggregate: Aggregate<State, Command, Event>) {
    const { subject, events, key, state } = aggregate;

    if (events.length > 0) {
      const { next } = await this.eventStore.append(events, key);

      if (state) {
        await this.snapshotStore.save(subject, { key: next, state });
      }
    }
  }
}
