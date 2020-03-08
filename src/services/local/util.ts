import assert from "assert";
import { Symbol, Currency } from "../types";

export function includesCurrency(symbol: Symbol, currency: Currency): boolean {
  const matches = currency.toString().match(/Symbol\((.*)\)/);
  assert.ok(
    matches,
    `couldn't extract name of currency ${currency.toString()}`
  );
  assert.strictEqual(
    matches?.length,
    2,
    `there should have been exactly two matches, but ${matches?.length} was/were found`
  );
  const name = matches![1]
  return symbol.toString().includes(name);
}
