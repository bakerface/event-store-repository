import { MemoryEventStore } from "@event-store/memory";
import { expect } from "chai";
import { EventStoreRepository } from "../src";
import * as Calculator from "./Calculator";

describe("saving events", () => {
  let eventStore: MemoryEventStore<Calculator.Event>;
  let repository: EventStoreRepository<Calculator.State, Calculator.Command, Calculator.Event>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<Calculator.Event>((e) => e.id);
    repository = new EventStoreRepository(Calculator.accept, Calculator.process, eventStore);
  });

  describe("when there are no events", () => {
    it("can save the aggregate", async () => {
      const calc = await repository.fetch("0");

      calc.process(Calculator.add("0", 1));

      await repository.save(calc);

      const page = await eventStore.fetch("0");

      expect(page.events).eqls([
        Calculator.added("0", 1),
      ]);
    });
  });

  describe("when there are events", () => {
    beforeEach(async () => {
      await eventStore.append([
        Calculator.added("0", 2),
        Calculator.subtracted("0", 1),
      ]);

      await eventStore.append([
        Calculator.added("1", 3),
      ]);
    });

    it("can save the aggregate", async () => {
      const calc = await repository.fetch("0");

      calc.process(Calculator.add("0", 1));

      await repository.save(calc);

      const page = await eventStore.fetch("0");

      expect(page.events).eqls([
        Calculator.added("0", 2),
        Calculator.subtracted("0", 1),
        Calculator.added("0", 1),
      ]);
    });
  });
});
