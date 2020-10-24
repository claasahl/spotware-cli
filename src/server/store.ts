import {
  ProtoOAAssetClass,
  ProtoOACtidTraderAccount,
  ProtoOALightSymbol,
  ProtoOASymbol,
  ProtoOASymbolCategory,
  ProtoOATrader,
} from "@claasahl/spotware-adapter";

export interface Account {
  accessTokens: string[];
  account: ProtoOACtidTraderAccount;
  trader: ProtoOATrader;
  assetClasses: ProtoOAAssetClass[];
  categories: ProtoOASymbolCategory[];
  symbols: (ProtoOALightSymbol & ProtoOASymbol)[];
  subscriptions: {
    [symbolId: number]: NodeJS.Timeout;
  };
}
function account(ctidTraderAccountId: number): Account {
  return {
    accessTokens: [],
    account: {
      ctidTraderAccountId,
      isLive: false,
      traderLogin: 1111111,
    },
    trader: {
      ctidTraderAccountId,
      balance: 1000,
      // balanceVersion?: number;
      // managerBonus?: number;
      // ibBonus?: number;
      // nonWithdrawableBonus?: number;
      // accessRights?: ProtoOAAccessRights;
      depositAssetId: 23,
      // swapFree?: boolean;
      // leverageInCents?: number;
      // totalMarginCalculationType?: ProtoOATotalMarginCalculationType;
      // maxLeverage?: number;
      // frenchRisk?: boolean;
      // traderLogin?: number;
      // accountType?: ProtoOAAccountType;
      // brokerName?: string;
      // registrationTimestamp?: number;
      // isLimitedRisk?: boolean;
      // limitedRiskMarginCalculationStrategy?: ProtoOALimitedRiskMarginCalculationStrategy;
      // moneyDigits?: number;
    },
    assetClasses: [
      { id: 1, name: "Forex" },
      { id: 2, name: "Metals" },
      { id: 3, name: "Crypto Currency" },
      { id: 4, name: "Literally Anything" },
    ],
    categories: [
      { id: 1, name: "Category #1.1", assetClassId: 1 },
      { id: 2, name: "Category #1.2", assetClassId: 1 },
      { id: 3, name: "Category #2.1", assetClassId: 2 },
      { id: 4, name: "Category #2.2", assetClassId: 2 },
      { id: 5, name: "Category #3.1", assetClassId: 3 },
      { id: 6, name: "Category #3.2", assetClassId: 3 },
      { id: 7, name: "Category #4", assetClassId: 4 },
    ],
    symbols: [
      {
        symbolId: 1,
        symbolName: "BTC/EUR",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: true,
        symbolCategoryId: 1,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
      {
        symbolId: 2,
        symbolName: "SYMBOL2",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: true,
        symbolCategoryId: 2,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
      {
        symbolId: 3,
        symbolName: "SYMBOL3",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: false,
        symbolCategoryId: 3,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
      {
        symbolId: 4,
        symbolName: "SYMBOL4",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: false,
        symbolCategoryId: 4,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
    ],
    subscriptions: {},
  };
}

export const STORE: {
  [ctidTraderAccountId: number]: Account;
} = {
  123456: account(123456),
};
