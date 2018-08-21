import { MemoryEventStore } from "@event-store/memory";
import { expect } from "chai";
import { EventStoreRepository } from "../src";
import * as Calculator from "./Calculator";

describe("fetching events", () => {
  let eventStore: MemoryEventStore<Calculator.Event>;
  let repository: EventStoreRepository<Calculator.State, Calculator.Command, Calculator.Event>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<Calculator.Event>((e) => e.id, 1);
    repository = new EventStoreRepository(Calculator.accept, Calculator.process, eventStore);
  });

  describe("when there are no events", () => {
    it("can fetch", async () => {
      const calc = await repository.fetch("0");

      expect(calc.state).equals(undefined);
      expect(calc.key).equals("0");
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

    it("should accept the events", async () => {
      const zero = await repository.fetch("0");
      const one = await repository.fetch("1");

      expect(zero.state).eqls(1);
      expect(zero.key).eqls("2");

      expect(one.state).eqls(3);
      expect(one.key).eqls("1");
    });
  });
});
