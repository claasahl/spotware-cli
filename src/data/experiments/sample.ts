import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { SymbolDataProcessor } from "../runner/types";
import { download } from "../trendbars";
import * as utils from "../../utils";

const processor: SymbolDataProcessor = async (socket, data) => {
  if (data.assetClass.name !== "Forex") {
    return;
  }
  if (data.symbol.symbolName?.includes(data.depositAsset.name)) {
    return;
  }
  const ctidTraderAccountId = data.trader.ctidTraderAccountId;
  const symbolId = data.symbol.symbolId;
  const period = ProtoOATrendbarPeriod.D1;
  const smaVolume = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: 100,
    property: (d) => d.volume,
  });
  socket.on("data", smaVolume);
  await download(socket, {
    ctidTraderAccountId,
    symbolId,
    period,
    fromDate: new Date("2020-10-01T00:00:00.000Z"),
    toDate: new Date("2020-11-01T00:00:00.000Z"),
    cb: () => {},
  });
  socket.off("data", smaVolume);
};
export default processor;
