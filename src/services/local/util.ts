import assert from "assert";
import { Symbol, Currency } from "../types";

function name(symbol: Symbol) {
  const matches = symbol.toString().match(/Symbol\((.*)\)/);
  assert.ok(
    matches,
    `couldn't extract name of currency ${symbol.toString()}`
  );
  assert.strictEqual(
    matches?.length,
    2,
    `there should have been exactly two matches, but ${matches?.length} was/were found`
  );
  return matches![1]
}

export function includesCurrency(symbol: Symbol, currency: Currency): boolean {
  const symbolName = name(symbol);
  const currencyName = name(currency);
  return symbolName !== "" && currencyName !== "" &&
    (symbolName.startsWith(currencyName) ||  symbolName.endsWith(currencyName));
}
