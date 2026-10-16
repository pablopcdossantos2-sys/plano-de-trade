import test from "node:test";
import assert from "node:assert/strict";
import { normalizedTradeDate, parseDelimitedRows, parseJournalRows } from "../src/journalImport.ts";

test("normaliza datas brasileiras com ou sem horario", () => {
  assert.equal(normalizedTradeDate("16/10/2026"), "2026-10-16");
  assert.equal(normalizedTradeDate("16/10/2026 09:05"), "2026-10-16");
  assert.equal(normalizedTradeDate("05/10/2026 10:00:00"), "2026-10-05");
});

test("aceita ISO com horario e rejeita datas invalidas ou ambiguas", () => {
  assert.equal(normalizedTradeDate("2026-10-16T09:05:00"), "2026-10-16");
  assert.equal(normalizedTradeDate("31/02/2026 09:05"), "");
  assert.equal(normalizedTradeDate("10/16/2026"), "");
  assert.equal(normalizedTradeDate("texto qualquer"), "");
});

test("CSV preserva quebra de linha dentro de campo entre aspas", () => {
  const csv = [
    "data;ativo;notes",
    '16/10/2026 09:05;WINFUT;"primeira linha',
    'segunda linha"',
    '16/10/2026 10:00;WDOFUT;"sem quebra"',
  ].join("\n");

  const rows = parseDelimitedRows(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].data, "16/10/2026 09:05");
  assert.equal(rows[0].ativo, "WINFUT");
  assert.equal(rows[0].notes, "primeira linha\nsegunda linha");
  assert.equal(rows[1].ativo, "WDOFUT");
});

test("CSV aceita aspas escapadas e delimitador por virgula", () => {
  const csv = 'date,asset,notes\n2026-10-16,WINFUT,"rompeu ""e voltou"""';
  const rows = parseDelimitedRows(csv);
  assert.deepEqual(rows, [{
    date: "2026-10-16",
    asset: "WINFUT",
    notes: 'rompeu "e voltou"',
  }]);
});


test("importacao JSON aceita array direto, trades e data", () => {
  assert.deepEqual(
    parseJournalRows('[{"data":"16/10/2026","ativo":"WINFUT"}]'),
    [{ data: "16/10/2026", ativo: "WINFUT" }],
  );

  assert.deepEqual(
    parseJournalRows('{"trades":[{"date":"2026-10-16","asset":"WDOFUT"}]}'),
    [{ date: "2026-10-16", asset: "WDOFUT" }],
  );

  assert.deepEqual(
    parseJournalRows('{"data":[{"tradingDate":"2026-10-16","asset":"WINFUT"}]}'),
    [{ tradingDate: "2026-10-16", asset: "WINFUT" }],
  );
});

test("importacao JSON ignora elementos que nao sao objetos de trade", () => {
  assert.deepEqual(
    parseJournalRows('[null,1,"texto",["array"],{"data":"16/10/2026","ativo":"WINFUT"}]'),
    [{ data: "16/10/2026", ativo: "WINFUT" }],
  );
});
