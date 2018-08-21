import { MemoryEventStore } from "@event-store/memory";
import { expect } from "chai";
import { EventStoreRepository } from "../src";
import * as Calculator from "./Calculator";

describe("processing commands", () => {
  let eventStore: MemoryEventStore<Calculator.Event>;
  let repository: EventStoreRepository<Calculator.State, Calculator.Command, Calculator.Event>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<Calculator.Event>((e) => e.id);
    repository = new EventStoreRepository(Calculator.accept, Calculator.process, eventStore);
  });

  describe("when the command is successful", () => {
    it("should accept the event", async () => {
      const calc = await repository.fetch("0");

      calc.process(Calculator.add("0", 8));
      calc.process(Calculator.divide("0", 2));

      await repository.save(calc);

      const page = await eventStore.fetch("0");

      expect(page.events).eqls([
        Calculator.added("0", 8),
        Calculator.divided("0", 2),
      ]);
    });
  });

  describe("when the command is unsuccessful", () => {
    it("should throw an error", async () => {
      const calc = await repository.fetch("0");

      calc.process(Calculator.add("0", 8));

      try {
        calc.process(Calculator.divide("0", 0));
      } catch (err) {
        expect(err.name).equals("DivideByZeroError");
      }

      expect(calc.state).equals(8);

      expect(calc.events).eqls([
        Calculator.added("0", 8),
      ]);
    });
  });
});
