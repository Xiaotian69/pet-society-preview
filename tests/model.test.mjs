import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validatePet,
  createRecord,
  saveRecord,
  createStore,
  questions,
} from "../model.mjs";

const pet = {
  name: "豆豆",
  species: "dog",
  breed: "不清楚",
  age: "2 岁",
  sex: "unknown",
  weight: "不清楚",
};
test("profile requires explicit answers and a valid species", () => {
  assert.ok(validatePet({}).length);
  assert.deepEqual(validatePet(pet), []);
  assert.ok(validatePet({ ...pet, species: "bird" }).length);
  assert.ok(validatePet({ ...pet, name: "  " }).length);
});
test("incomplete or invalid observations cannot become a completed record", () => {
  assert.throws(() => createRecord(pet, "vomiting", []));
  assert.throws(() =>
    createRecord(pet, "invalid", ["不清楚", "不清楚", "不清楚"]),
  );
  assert.throws(() =>
    createRecord(pet, "vomiting", ["invalid", "不清楚", "不清楚"]),
  );
});
test("unknown remains unknown; records contain observations and no diagnosis", () => {
  const record = createRecord(
    pet,
    "vomiting",
    questions.map(() => "不清楚"),
  );
  assert.equal(record.demo, true);
  assert.equal(record.answers.length, 3);
  assert.ok(record.answers.every((a) => a.value === "不清楚"));
  assert.equal(record.diagnosis, undefined);
  assert.notEqual(record.pet, pet);
});
test("saving the same result does not duplicate history", () => {
  const record = createRecord(
    pet,
    "vomiting",
    questions.map(() => "不清楚"),
  );
  assert.equal(saveRecord(saveRecord([], record), record).length, 1);
});
test("corrupt or unavailable local storage recovers with an in-memory fallback", () => {
  const store = createStore({
    getItem() {
      return "{bad";
    },
    setItem() {
      throw Error("blocked");
    },
  });
  assert.deepEqual(store.read("history", []), []);
  store.write("history", [{ id: "demo" }]);
  assert.deepEqual(store.read("history", []), [{ id: "demo" }]);
  assert.equal(store.persistent, false);
});
