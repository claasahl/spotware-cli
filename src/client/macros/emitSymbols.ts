import {
  ProtoOAAssetClass,
  ProtoOALightSymbol,
  ProtoOASymbolCategory,
} from "@claasahl/spotware-adapter";

import { Events } from "../events";

export interface Options {
  events: Events;
  ctidTraderAccountId: number;
  classes: ProtoOAAssetClass[];
  categories: ProtoOASymbolCategory[];
  symbols: ProtoOALightSymbol[];
}

export async function macro(options: Options): Promise<void> {
  const { events, ctidTraderAccountId } = options;
  const classes = new Map<number, ProtoOAAssetClass>();
  options.classes.forEach((c) => {
    if (c.id) {
      classes.set(c.id, c);
    }
  });
  const categories = new Map<number, ProtoOASymbolCategory>();
  options.categories.forEach((c) => categories.set(c.id, c));
  for (const symbol of options.symbols) {
    if (!symbol.symbolCategoryId) {
      continue;
    }
    const category = categories.get(symbol.symbolCategoryId);
    if (!category?.assetClassId) {
      continue;
    }
    const clazz = classes.get(category.assetClassId);
    if (!clazz?.name) {
      continue;
    }
    events.emit("symbol", {
      ctidTraderAccountId,
      symbolId: symbol.symbolId,
      symbolName: symbol.symbolName || "",
      assetClass: clazz.name,
    });
  }
}
