import { MemoryEventStore, MemorySnapshotStore } from "@event-store/memory";
import { expect } from "chai";
import { EventStoreRepository } from "../src";
import * as Calculator from "./Calculator";

describe("fetching events", () => {
  let eventStore: MemoryEventStore<Calculator.Event>;
  let snapshotStore: MemorySnapshotStore<Calculator.State>;
  let repository: EventStoreRepository<Calculator.State, Calculator.Command, Calculator.Event>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<Calculator.Event>((e) => e.id, 1);
    snapshotStore = new MemorySnapshotStore<Calculator.State>();

    repository = new EventStoreRepository(
      Calculator.accept,
      Calculator.process,
      eventStore,
      snapshotStore,
    );
  });

  describe("when there are no events", () => {
    it("can fetch", async () => {
      const calc = await repository.fetch("0");

      expect(calc.state).equals(undefined);
      expect(calc.key).equals("0");
    });

    it("should not store snapshot", async () => {
      await repository.fetch("0");
      const snapshot = await snapshotStore.fetch("0");

      expect(snapshot).equals(undefined);
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

    it("should store snapshot", async () => {
      await repository.fetch("0");
      await repository.fetch("1");

      const zero = await snapshotStore.fetch("0");
      const one = await snapshotStore.fetch("1");

      expect(zero).eqls({
        key: "2",
        state: 1,
      });

      expect(one).eqls({
        key: "1",
        state: 3,
      });
    });
  });

  describe("when there are snapshots", () => {
    beforeEach(async () => {
      await eventStore.append([
        Calculator.added("0", 2),
      ]);

      await snapshotStore.save("0", {
        key: "1",
        state: 2,
      });

      await eventStore.append([
        Calculator.subtracted("0", 1),
      ], "1");
    });

    it("should check for future events", async () => {
      const zero = await repository.fetch("0");

      expect(zero.state).eqls(1);
      expect(zero.key).eqls("2");
    });

    it("should update the snapshot", async () => {
      await repository.fetch("0");

      const zero = await snapshotStore.fetch("0");

      expect(zero).eqls({
        key: "2",
        state: 1,
      });
    });
  });
});
