import test from "node:test";
import assert from "node:assert/strict";
import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEY,
  clearStorageLoadGuard,
  initialState,
  loadStateResult,
  parseBackup,
  saveState,
} from "../src/storage.ts";

class MemoryStorage {
  #values = new Map();

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }

  key(index) {
    return [...this.#values.keys()][index] ?? null;
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  setItem(key, value) {
    this.#values.set(String(key), String(value));
  }
}

function installStorage() {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
}

test("migra estado v7 vazio para o schema atual sem perder configuracoes", () => {
  installStorage();
  const current = initialState();
  const legacy = {
    ...current,
    schemaVersion: 7,
    trainingRecords: undefined,
    setupExamples: undefined,
  };
  delete legacy.trainingRecords;
  delete legacy.setupExamples;

  const migrated = parseBackup(JSON.stringify(legacy));
  assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(migrated.trainingRecords, []);
  assert.deepEqual(migrated.setupExamples, []);
  assert.deepEqual(migrated.settings.assets, current.settings.assets);
});

test("falha de leitura preserva o conteudo original e bloqueia sobrescrita", () => {
  installStorage();
  const original = JSON.stringify({ schemaVersion: 999, payload: "nao sobrescrever" });
  localStorage.setItem(STORAGE_KEY, original);

  const result = loadStateResult();

  assert.ok(result.error);
  assert.ok(result.recoveryKey);
  assert.equal(localStorage.getItem(STORAGE_KEY), original);
  assert.equal(localStorage.getItem(result.recoveryKey), original);
  assert.throws(() => saveState(initialState()), /NÃO serão sobrescritos|modo protegido/i);
  assert.equal(localStorage.getItem(STORAGE_KEY), original);

  clearStorageLoadGuard();
});

test("estado valido continua salvando normalmente", () => {
  installStorage();
  clearStorageLoadGuard();
  const state = initialState();

  saveState(state);

  const saved = localStorage.getItem(STORAGE_KEY);
  assert.ok(saved);
  const parsed = JSON.parse(saved);
  assert.equal(parsed.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(parsed.settings.assets, state.settings.assets);
});
