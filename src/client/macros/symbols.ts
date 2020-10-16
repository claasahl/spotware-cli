import {
  ProtoOAAssetClass,
  ProtoOALightSymbol,
  ProtoOASymbolCategory,
} from "@claasahl/spotware-adapter";

import * as R from "../requests";
import { CustomSpotwareSocket } from "../CustomSpotwareSocket";

export interface Options {
  ctidTraderAccountId: number;
}

export interface Result {
  classes: ProtoOAAssetClass[];
  categories: ProtoOASymbolCategory[];
  symbols: ProtoOALightSymbol[];
}

export async function macro(
  socket: CustomSpotwareSocket,
  options: Options
): Promise<Result> {
  const { ctidTraderAccountId } = options;
  const { assetClass: classes } = await R.PROTO_OA_ASSET_CLASS_LIST_REQ(
    socket,
    { ctidTraderAccountId }
  );
  const {
    symbolCategory: categories,
  } = await R.PROTO_OA_SYMBOL_CATEGORY_REQ(socket, { ctidTraderAccountId });
  const { symbol: symbols } = await R.PROTO_OA_SYMBOLS_LIST_REQ(socket, {
    ctidTraderAccountId,
  });
  return { classes, categories, symbols };
}
