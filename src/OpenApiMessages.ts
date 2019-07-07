import PBF from "pbf";

export enum ProtoOAPayloadType {
  PROTO_OA_APPLICATION_AUTH_REQ = 2100,
  PROTO_OA_APPLICATION_AUTH_RES = 2101,
  PROTO_OA_ACCOUNT_AUTH_REQ = 2102,
  PROTO_OA_ACCOUNT_AUTH_RES = 2103,
  PROTO_OA_VERSION_REQ = 2104,
  PROTO_OA_VERSION_RES = 2105,
  PROTO_OA_NEW_ORDER_REQ = 2106,
  PROTO_OA_TRAILING_SL_CHANGED_EVENT = 2107,
  PROTO_OA_CANCEL_ORDER_REQ = 2108,
  PROTO_OA_AMEND_ORDER_REQ = 2109,
  PROTO_OA_AMEND_POSITION_SLTP_REQ = 2110,
  PROTO_OA_CLOSE_POSITION_REQ = 2111,
  PROTO_OA_ASSET_LIST_REQ = 2112,
  PROTO_OA_ASSET_LIST_RES = 2113,
  PROTO_OA_SYMBOLS_LIST_REQ = 2114,
  PROTO_OA_SYMBOLS_LIST_RES = 2115,
  PROTO_OA_SYMBOL_BY_ID_REQ = 2116,
  PROTO_OA_SYMBOL_BY_ID_RES = 2117,
  PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ = 2118,
  PROTO_OA_SYMBOLS_FOR_CONVERSION_RES = 2119,
  PROTO_OA_SYMBOL_CHANGED_EVENT = 2120,
  PROTO_OA_TRADER_REQ = 2121,
  PROTO_OA_TRADER_RES = 2122,
  PROTO_OA_TRADER_UPDATE_EVENT = 2123,
  PROTO_OA_RECONCILE_REQ = 2124,
  PROTO_OA_RECONCILE_RES = 2125,
  PROTO_OA_EXECUTION_EVENT = 2126,
  PROTO_OA_SUBSCRIBE_SPOTS_REQ = 2127,
  PROTO_OA_SUBSCRIBE_SPOTS_RES = 2128,
  PROTO_OA_UNSUBSCRIBE_SPOTS_REQ = 2129,
  PROTO_OA_UNSUBSCRIBE_SPOTS_RES = 2130,
  PROTO_OA_SPOT_EVENT = 2131,
  PROTO_OA_ORDER_ERROR_EVENT = 2132,
  PROTO_OA_DEAL_LIST_REQ = 2133,
  PROTO_OA_DEAL_LIST_RES = 2134,
  PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ = 2135,
  PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ = 2136,
  PROTO_OA_GET_TRENDBARS_REQ = 2137,
  PROTO_OA_GET_TRENDBARS_RES = 2138,
  PROTO_OA_EXPECTED_MARGIN_REQ = 2139,
  PROTO_OA_EXPECTED_MARGIN_RES = 2140,
  PROTO_OA_MARGIN_CHANGED_EVENT = 2141,
  PROTO_OA_ERROR_RES = 2142,
  PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ = 2143,
  PROTO_OA_CASH_FLOW_HISTORY_LIST_RES = 2144,
  PROTO_OA_GET_TICKDATA_REQ = 2145,
  PROTO_OA_GET_TICKDATA_RES = 2146,
  PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT = 2147,
  PROTO_OA_CLIENT_DISCONNECT_EVENT = 2148,
  PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ = 2149,
  PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES = 2150,
  PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ = 2151,
  PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES = 2152,
  PROTO_OA_ASSET_CLASS_LIST_REQ = 2153,
  PROTO_OA_ASSET_CLASS_LIST_RES = 2154,
  PROTO_OA_DEPTH_EVENT = 2155,
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ = 2156,
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES = 2157,
  PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ = 2158,
  PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES = 2159,
  PROTO_OA_SYMBOL_CATEGORY_REQ = 2160,
  PROTO_OA_SYMBOL_CATEGORY_RES = 2161,
  PROTO_OA_ACCOUNT_LOGOUT_REQ = 2162,
  PROTO_OA_ACCOUNT_LOGOUT_RES = 2163,
  PROTO_OA_ACCOUNT_DISCONNECT_EVENT = 2164
}

export enum ProtoOADayOfWeek {
  NONE = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7
}

export enum ProtoOACommissionType {
  USD_PER_MIL_USD = 1,
  USD_PER_LOT = 2,
  PERCENTAGE = 3,
  QUOTE_CCY_PER_LOT = 4
}

export enum ProtoOASymbolDistanceType {
  SYMBOL_DISTANCE_IN_POINTS = 1,
  SYMBOL_DISTANCE_IN_PERCENTAGE = 2
}

export enum ProtoOAMinCommissionType {
  CURRENCY = 1,
  QUOTE_CURRENCY = 2
}

export enum ProtoOATradingMode {
  ENABLED = 0,
  DISABLED_WITHOUT_PENDINGS_EXECUTION = 1,
  DISABLED_WITH_PENDINGS_EXECUTION = 2,
  CLOSE_ONLY_MODE = 3
}

export enum ProtoOAAccessRights {
  FULL_ACCESS = 0,
  CLOSE_ONLY = 1,
  NO_TRADING = 2,
  NO_LOGIN = 3
}

export enum ProtoOATotalMarginCalculationType {
  MAX = 0,
  SUM = 1,
  NET = 2
}

export enum ProtoOAAccountType {
  HEDGED = 0,
  NETTED = 1,
  SPREAD_BETTING = 2
}

export enum ProtoOAPositionStatus {
  POSITION_STATUS_OPEN = 1,
  POSITION_STATUS_CLOSED = 2,
  POSITION_STATUS_CREATED = 3,
  POSITION_STATUS_ERROR = 4
}

export enum ProtoOATradeSide {
  BUY = 1,
  SELL = 2
}

export enum ProtoOAOrderType {
  MARKET = 1,
  LIMIT = 2,
  STOP = 3,
  STOP_LOSS_TAKE_PROFIT = 4,
  MARKET_RANGE = 5,
  STOP_LIMIT = 6
}

export enum ProtoOATimeInForce {
  GOOD_TILL_DATE = 1,
  GOOD_TILL_CANCEL = 2,
  IMMEDIATE_OR_CANCEL = 3,
  FILL_OR_KILL = 4,
  MARKET_ON_OPEN = 5
}

export enum ProtoOAOrderStatus {
  ORDER_STATUS_ACCEPTED = 1,
  ORDER_STATUS_FILLED = 2,
  ORDER_STATUS_REJECTED = 3,
  ORDER_STATUS_EXPIRED = 4,
  ORDER_STATUS_CANCELLED = 5
}

export enum ProtoOAOrderTriggerMethod {
  TRADE = 1,
  OPPOSITE = 2,
  DOUBLE_TRADE = 3,
  DOUBLE_OPPOSITE = 4
}

export enum ProtoOAExecutionType {
  ORDER_ACCEPTED = 2,
  ORDER_FILLED = 3,
  ORDER_REPLACED = 4,
  ORDER_CANCELLED = 5,
  ORDER_EXPIRED = 6,
  ORDER_REJECTED = 7,
  ORDER_CANCEL_REJECTED = 8,
  SWAP = 9,
  DEPOSIT_WITHDRAW = 10,
  ORDER_PARTIAL_FILL = 11,
  BONUS_DEPOSIT_WITHDRAW = 12
}

export enum ProtoOAChangeBonusType {
  BONUS_DEPOSIT = 0,
  BONUS_WITHDRAW = 1
}

export enum ProtoOAChangeBalanceType {
  BALANCE_DEPOSIT = 0,
  BALANCE_WITHDRAW = 1,
  BALANCE_DEPOSIT_STRATEGY_COMMISSION_INNER = 3,
  BALANCE_WITHDRAW_STRATEGY_COMMISSION_INNER = 4,
  BALANCE_DEPOSIT_IB_COMMISSIONS = 5,
  BALANCE_WITHDRAW_IB_SHARED_PERCENTAGE = 6,
  BALANCE_DEPOSIT_IB_SHARED_PERCENTAGE_FROM_SUB_IB = 7,
  BALANCE_DEPOSIT_IB_SHARED_PERCENTAGE_FROM_BROKER = 8,
  BALANCE_DEPOSIT_REBATE = 9,
  BALANCE_WITHDRAW_REBATE = 10,
  BALANCE_DEPOSIT_STRATEGY_COMMISSION_OUTER = 11,
  BALANCE_WITHDRAW_STRATEGY_COMMISSION_OUTER = 12,
  BALANCE_WITHDRAW_BONUS_COMPENSATION = 13,
  BALANCE_WITHDRAW_IB_SHARED_PERCENTAGE_TO_BROKER = 14,
  BALANCE_DEPOSIT_DIVIDENDS = 15,
  BALANCE_WITHDRAW_DIVIDENDS = 16,
  BALANCE_WITHDRAW_GSL_CHARGE = 17,
  BALANCE_WITHDRAW_ROLLOVER = 18,
  BALANCE_DEPOSIT_NONWITHDRAWABLE_BONUS = 19,
  BALANCE_WITHDRAW_NONWITHDRAWABLE_BONUS = 20,
  BALANCE_DEPOSIT_SWAP = 21,
  BALANCE_WITHDRAW_SWAP = 22,
  BALANCE_DEPOSIT_MANAGEMENT_FEE = 27,
  BALANCE_WITHDRAW_MANAGEMENT_FEE = 28,
  BALANCE_DEPOSIT_PERFORMANCE_FEE = 29,
  BALANCE_WITHDRAW_INACTIVITY_FEE = 35
}

export enum ProtoOADealStatus {
  FILLED = 2,
  PARTIALLY_FILLED = 3,
  REJECTED = 4,
  INTERNALLY_REJECTED = 5,
  ERROR = 6,
  MISSED = 7
}

export enum ProtoOATrendbarPeriod {
  M1 = 1,
  M2 = 2,
  M3 = 3,
  M4 = 4,
  M5 = 5,
  M10 = 6,
  M15 = 7,
  M30 = 8,
  H1 = 9,
  H4 = 10,
  H12 = 11,
  D1 = 12,
  W1 = 13,
  MN1 = 14
}

export enum ProtoOAQuoteType {
  BID = 1,
  ASK = 2
}

export enum ProtoOAClientPermissionScope {
  SCOPE_VIEW = 0,
  SCOPE_TRADE = 1
}

export enum ProtoOAErrorCode {
  OA_AUTH_TOKEN_EXPIRED = 1,
  ACCOUNT_NOT_AUTHORIZED = 2,
  ALREADY_LOGGED_IN = 14,
  CH_CLIENT_AUTH_FAILURE = 101,
  CH_CLIENT_NOT_AUTHENTICATED = 102,
  CH_CLIENT_ALREADY_AUTHENTICATED = 103,
  CH_ACCESS_TOKEN_INVALID = 104,
  CH_SERVER_NOT_REACHABLE = 105,
  CH_CTID_TRADER_ACCOUNT_NOT_FOUND = 106,
  CH_OA_CLIENT_NOT_FOUND = 107,
  REQUEST_FREQUENCY_EXCEEDED = 108,
  SERVER_IS_UNDER_MAINTENANCE = 109,
  CHANNEL_IS_BLOCKED = 110,
  CONNECTIONS_LIMIT_EXCEEDED = 67,
  NOT_SUBSCRIBED_TO_SPOTS = 112,
  ALREADY_SUBSCRIBED = 113,
  SYMBOL_NOT_FOUND = 114,
  UNKNOWN_SYMBOL = 115,
  INCORRECT_BOUNDARIES = 35,
  NO_QUOTES = 117,
  NOT_ENOUGH_MONEY = 118,
  MAX_EXPOSURE_REACHED = 119,
  POSITION_NOT_FOUND = 120,
  ORDER_NOT_FOUND = 121,
  POSITION_NOT_OPEN = 122,
  POSITION_LOCKED = 123,
  TOO_MANY_POSITIONS = 124,
  TRADING_BAD_VOLUME = 125,
  TRADING_BAD_STOPS = 126,
  TRADING_BAD_PRICES = 127,
  TRADING_BAD_STAKE = 128,
  PROTECTION_IS_TOO_CLOSE_TO_MARKET = 129,
  TRADING_BAD_EXPIRATION_DATE = 130,
  PENDING_EXECUTION = 131,
  TRADING_DISABLED = 132,
  TRADING_NOT_ALLOWED = 133,
  UNABLE_TO_CANCEL_ORDER = 134,
  UNABLE_TO_AMEND_ORDER = 135,
  SHORT_SELLING_NOT_ALLOWED = 136
}

// ProtoOAApplicationAuthReq ===================================

export interface ProtoOAApplicationAuthReq {
  payloadType?: ProtoOAPayloadType;
  clientId: string;
  clientSecret: string;
}

export class ProtoOAApplicationAuthReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAApplicationAuthReqUtils._readField,
      {
        clientId: "",
        clientSecret: ""
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAApplicationAuthReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.clientId = pbf.readString();
    if (tag === 3) obj.clientSecret = pbf.readString();
  }

  static write(obj: ProtoOAApplicationAuthReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.clientId) pbf.writeStringField(2, obj.clientId);
    if (pbf && obj.clientSecret) pbf.writeStringField(3, obj.clientSecret);
  }
}

// ProtoOAApplicationAuthRes ===================================

export interface ProtoOAApplicationAuthRes {
  payloadType?: ProtoOAPayloadType;
}

export class ProtoOAApplicationAuthResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(ProtoOAApplicationAuthResUtils._readField, {}, end);
  }

  private static _readField(
    tag: number,
    obj: ProtoOAApplicationAuthRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
  }

  static write(obj: ProtoOAApplicationAuthRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
  }
}

// ProtoOAAccountAuthReq =======================================

export interface ProtoOAAccountAuthReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  accessToken: string;
}

export class ProtoOAAccountAuthReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAccountAuthReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        accessToken: ""
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAAccountAuthReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.accessToken = pbf.readString();
  }

  static write(obj: ProtoOAAccountAuthReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.accessToken) pbf.writeStringField(3, obj.accessToken);
  }
}

// ProtoOAAccountAuthRes =======================================

export interface ProtoOAAccountAuthRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAAccountAuthResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAccountAuthResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAAccountAuthRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAAccountAuthRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAErrorRes =============================================

export interface ProtoOAErrorRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId?: number;
  errorCode: string;
  description?: string;
  maintenanceEndTimestamp?: number;
}

export class ProtoOAErrorResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAErrorResUtils._readField,
      {
        errorCode: ""
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAErrorRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.errorCode = pbf.readString();
    if (tag === 4) obj.description = pbf.readString();
    if (tag === 5) obj.maintenanceEndTimestamp = pbf.readVarint64();
  }

  static write(obj: ProtoOAErrorRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.errorCode) pbf.writeStringField(3, obj.errorCode);
    if (pbf && obj.description) pbf.writeStringField(4, obj.description);
    if (pbf && obj.maintenanceEndTimestamp)
      pbf.writeVarintField(5, obj.maintenanceEndTimestamp);
  }
}

// ProtoOAClientDisconnectEvent ================================

export interface ProtoOAClientDisconnectEvent {
  payloadType?: ProtoOAPayloadType;
  reason?: string;
}

export class ProtoOAClientDisconnectEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAClientDisconnectEventUtils._readField,
      {},
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAClientDisconnectEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.reason = pbf.readString();
  }

  static write(obj: ProtoOAClientDisconnectEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.reason) pbf.writeStringField(2, obj.reason);
  }
}

// ProtoOAAccountsTokenInvalidatedEvent ========================

export interface ProtoOAAccountsTokenInvalidatedEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountIds?: number;
  reason?: string;
}

export class ProtoOAAccountsTokenInvalidatedEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAccountsTokenInvalidatedEventUtils._readField,
      {},
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAccountsTokenInvalidatedEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountIds = pbf.readVarint64();
    if (tag === 3) obj.reason = pbf.readString();
  }

  static write(obj: ProtoOAAccountsTokenInvalidatedEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountIds)
      pbf.writeVarintField(2, obj.ctidTraderAccountIds);
    if (pbf && obj.reason) pbf.writeStringField(3, obj.reason);
  }
}

// ProtoOAVersionReq ===========================================

export interface ProtoOAVersionReq {
  payloadType?: ProtoOAPayloadType;
}

export class ProtoOAVersionReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(ProtoOAVersionReqUtils._readField, {}, end);
  }

  private static _readField(tag: number, obj: ProtoOAVersionReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
  }

  static write(obj: ProtoOAVersionReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
  }
}

// ProtoOAVersionRes ===========================================

export interface ProtoOAVersionRes {
  payloadType?: ProtoOAPayloadType;
  version: string;
}

export class ProtoOAVersionResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAVersionResUtils._readField,
      {
        version: ""
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAVersionRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.version = pbf.readString();
  }

  static write(obj: ProtoOAVersionRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.version) pbf.writeStringField(2, obj.version);
  }
}

// ProtoOANewOrderReq ==========================================

export interface ProtoOANewOrderReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId: number;
  orderType: ProtoOAOrderType;
  tradeSide: ProtoOATradeSide;
  volume: number;
  limitPrice?: number;
  stopPrice?: number;
  timeInForce?: ProtoOATimeInForce;
  expirationTimestamp?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  baseSlippagePrice?: number;
  slippageInPoints?: number;
  label?: string;
  positionId?: number;
  clientOrderId?: string;
  relativeStopLoss?: number;
  relativeTakeProfit?: number;
  guaranteedStopLoss?: boolean;
  trailingStopLoss?: boolean;
  stopTriggerMethod?: ProtoOAOrderTriggerMethod;
}

export class ProtoOANewOrderReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOANewOrderReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        symbolId: 0,
        orderType: ProtoOAOrderType.MARKET,
        tradeSide: ProtoOATradeSide.BUY,
        volume: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOANewOrderReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
    if (tag === 4) obj.orderType = pbf.readVarint();
    if (tag === 5) obj.tradeSide = pbf.readVarint();
    if (tag === 6) obj.volume = pbf.readVarint64();
    if (tag === 7) obj.limitPrice = pbf.readDouble();
    if (tag === 8) obj.stopPrice = pbf.readDouble();
    if (tag === 9) obj.timeInForce = pbf.readVarint();
    if (tag === 10) obj.expirationTimestamp = pbf.readVarint64();
    if (tag === 11) obj.stopLoss = pbf.readDouble();
    if (tag === 12) obj.takeProfit = pbf.readDouble();
    if (tag === 13) obj.comment = pbf.readString();
    if (tag === 14) obj.baseSlippagePrice = pbf.readDouble();
    if (tag === 15) obj.slippageInPoints = pbf.readVarint();
    if (tag === 16) obj.label = pbf.readString();
    if (tag === 17) obj.positionId = pbf.readVarint64();
    if (tag === 18) obj.clientOrderId = pbf.readString();
    if (tag === 19) obj.relativeStopLoss = pbf.readVarint64();
    if (tag === 20) obj.relativeTakeProfit = pbf.readVarint64();
    if (tag === 21) obj.guaranteedStopLoss = pbf.readBoolean();
    if (tag === 22) obj.trailingStopLoss = pbf.readBoolean();
    if (tag === 23) obj.stopTriggerMethod = pbf.readVarint();
  }

  static write(obj: ProtoOANewOrderReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
    if (pbf && obj.orderType) pbf.writeVarintField(4, obj.orderType);
    if (pbf && obj.tradeSide) pbf.writeVarintField(5, obj.tradeSide);
    if (pbf && obj.volume) pbf.writeVarintField(6, obj.volume);
    if (pbf && obj.limitPrice) pbf.writeDoubleField(7, obj.limitPrice);
    if (pbf && obj.stopPrice) pbf.writeDoubleField(8, obj.stopPrice);
    if (pbf && obj.timeInForce) pbf.writeVarintField(9, obj.timeInForce);
    if (pbf && obj.expirationTimestamp)
      pbf.writeVarintField(10, obj.expirationTimestamp);
    if (pbf && obj.stopLoss) pbf.writeDoubleField(11, obj.stopLoss);
    if (pbf && obj.takeProfit) pbf.writeDoubleField(12, obj.takeProfit);
    if (pbf && obj.comment) pbf.writeStringField(13, obj.comment);
    if (pbf && obj.baseSlippagePrice)
      pbf.writeDoubleField(14, obj.baseSlippagePrice);
    if (pbf && obj.slippageInPoints)
      pbf.writeVarintField(15, obj.slippageInPoints);
    if (pbf && obj.label) pbf.writeStringField(16, obj.label);
    if (pbf && obj.positionId) pbf.writeVarintField(17, obj.positionId);
    if (pbf && obj.clientOrderId) pbf.writeStringField(18, obj.clientOrderId);
    if (pbf && obj.relativeStopLoss)
      pbf.writeVarintField(19, obj.relativeStopLoss);
    if (pbf && obj.relativeTakeProfit)
      pbf.writeVarintField(20, obj.relativeTakeProfit);
    if (pbf && obj.guaranteedStopLoss)
      pbf.writeBooleanField(21, obj.guaranteedStopLoss);
    if (pbf && obj.trailingStopLoss)
      pbf.writeBooleanField(22, obj.trailingStopLoss);
    if (pbf && obj.stopTriggerMethod)
      pbf.writeVarintField(23, obj.stopTriggerMethod);
  }
}

// ProtoOAExecutionEvent =======================================

export interface ProtoOAExecutionEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  executionType: ProtoOAExecutionType;
  position?: ProtoOAPosition;
  order?: ProtoOAOrder;
  deal?: ProtoOADeal;
  bonusDepositWithdraw?: ProtoOABonusDepositWithdraw;
  depositWithdraw?: ProtoOADepositWithdraw;
  errorCode?: string;
  isServerEvent?: boolean;
}

export class ProtoOAExecutionEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAExecutionEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        executionType: ProtoOAExecutionType.ORDER_ACCEPTED
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAExecutionEvent, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.executionType = pbf.readVarint();
    if (tag === 4) obj.position = ProtoOAPositionUtils.read(pbf);
    if (tag === 5) obj.order = ProtoOAOrderUtils.read(pbf);
    if (tag === 6) obj.deal = ProtoOADealUtils.read(pbf);
    if (tag === 7)
      obj.bonusDepositWithdraw = ProtoOABonusDepositWithdrawUtils.read(pbf);
    if (tag === 8) obj.depositWithdraw = ProtoOADepositWithdrawUtils.read(pbf);
    if (tag === 9) obj.errorCode = pbf.readString();
    if (tag === 10) obj.isServerEvent = pbf.readBoolean();
  }

  static write(obj: ProtoOAExecutionEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.executionType) pbf.writeVarintField(3, obj.executionType);
    if (pbf && obj.position)
      pbf.writeMessage(4, ProtoOAPositionUtils.write, obj.position);
    if (pbf && obj.order)
      pbf.writeMessage(5, ProtoOAOrderUtils.write, obj.order);
    if (pbf && obj.deal) pbf.writeMessage(6, ProtoOADealUtils.write, obj.deal);
    if (pbf && obj.bonusDepositWithdraw)
      pbf.writeMessage(
        7,
        ProtoOABonusDepositWithdrawUtils.write,
        obj.bonusDepositWithdraw
      );
    if (pbf && obj.depositWithdraw)
      pbf.writeMessage(
        8,
        ProtoOADepositWithdrawUtils.write,
        obj.depositWithdraw
      );
    if (pbf && obj.errorCode) pbf.writeStringField(9, obj.errorCode);
    if (pbf && obj.isServerEvent) pbf.writeBooleanField(10, obj.isServerEvent);
  }
}

// ProtoOACancelOrderReq =======================================

export interface ProtoOACancelOrderReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  orderId: number;
}

export class ProtoOACancelOrderReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOACancelOrderReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        orderId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOACancelOrderReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.orderId = pbf.readVarint64();
  }

  static write(obj: ProtoOACancelOrderReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.orderId) pbf.writeVarintField(3, obj.orderId);
  }
}

// ProtoOAAmendOrderReq ========================================

export interface ProtoOAAmendOrderReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  orderId: number;
  volume?: number;
  limitPrice?: number;
  stopPrice?: number;
  expirationTimestamp?: number;
  stopLoss?: number;
  takeProfit?: number;
  slippageInPoints?: number;
  relativeStopLoss?: number;
  relativeTakeProfit?: number;
  guaranteedStopLoss?: boolean;
  trailingStopLoss?: boolean;
  stopTriggerMethod?: ProtoOAOrderTriggerMethod;
}

export class ProtoOAAmendOrderReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAmendOrderReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        orderId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAAmendOrderReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.orderId = pbf.readVarint64();
    if (tag === 4) obj.volume = pbf.readVarint64();
    if (tag === 5) obj.limitPrice = pbf.readDouble();
    if (tag === 6) obj.stopPrice = pbf.readDouble();
    if (tag === 7) obj.expirationTimestamp = pbf.readVarint64();
    if (tag === 8) obj.stopLoss = pbf.readDouble();
    if (tag === 9) obj.takeProfit = pbf.readDouble();
    if (tag === 10) obj.slippageInPoints = pbf.readVarint();
    if (tag === 11) obj.relativeStopLoss = pbf.readVarint64();
    if (tag === 12) obj.relativeTakeProfit = pbf.readVarint64();
    if (tag === 13) obj.guaranteedStopLoss = pbf.readBoolean();
    if (tag === 14) obj.trailingStopLoss = pbf.readBoolean();
    if (tag === 15) obj.stopTriggerMethod = pbf.readVarint();
  }

  static write(obj: ProtoOAAmendOrderReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.orderId) pbf.writeVarintField(3, obj.orderId);
    if (pbf && obj.volume) pbf.writeVarintField(4, obj.volume);
    if (pbf && obj.limitPrice) pbf.writeDoubleField(5, obj.limitPrice);
    if (pbf && obj.stopPrice) pbf.writeDoubleField(6, obj.stopPrice);
    if (pbf && obj.expirationTimestamp)
      pbf.writeVarintField(7, obj.expirationTimestamp);
    if (pbf && obj.stopLoss) pbf.writeDoubleField(8, obj.stopLoss);
    if (pbf && obj.takeProfit) pbf.writeDoubleField(9, obj.takeProfit);
    if (pbf && obj.slippageInPoints)
      pbf.writeVarintField(10, obj.slippageInPoints);
    if (pbf && obj.relativeStopLoss)
      pbf.writeVarintField(11, obj.relativeStopLoss);
    if (pbf && obj.relativeTakeProfit)
      pbf.writeVarintField(12, obj.relativeTakeProfit);
    if (pbf && obj.guaranteedStopLoss)
      pbf.writeBooleanField(13, obj.guaranteedStopLoss);
    if (pbf && obj.trailingStopLoss)
      pbf.writeBooleanField(14, obj.trailingStopLoss);
    if (pbf && obj.stopTriggerMethod)
      pbf.writeVarintField(15, obj.stopTriggerMethod);
  }
}

// ProtoOAAmendPositionSLTPReq =================================

export interface ProtoOAAmendPositionSLTPReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  positionId: number;
  stopLoss?: number;
  takeProfit?: number;
  guaranteedStopLoss?: boolean;
  trailingStopLoss?: boolean;
  stopLossTriggerMethod?: ProtoOAOrderTriggerMethod;
}

export class ProtoOAAmendPositionSLTPReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAmendPositionSLTPReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        positionId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAmendPositionSLTPReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.positionId = pbf.readVarint64();
    if (tag === 4) obj.stopLoss = pbf.readDouble();
    if (tag === 5) obj.takeProfit = pbf.readDouble();
    if (tag === 7) obj.guaranteedStopLoss = pbf.readBoolean();
    if (tag === 8) obj.trailingStopLoss = pbf.readBoolean();
    if (tag === 9) obj.stopLossTriggerMethod = pbf.readVarint();
  }

  static write(obj: ProtoOAAmendPositionSLTPReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.positionId) pbf.writeVarintField(3, obj.positionId);
    if (pbf && obj.stopLoss) pbf.writeDoubleField(4, obj.stopLoss);
    if (pbf && obj.takeProfit) pbf.writeDoubleField(5, obj.takeProfit);
    if (pbf && obj.guaranteedStopLoss)
      pbf.writeBooleanField(7, obj.guaranteedStopLoss);
    if (pbf && obj.trailingStopLoss)
      pbf.writeBooleanField(8, obj.trailingStopLoss);
    if (pbf && obj.stopLossTriggerMethod)
      pbf.writeVarintField(9, obj.stopLossTriggerMethod);
  }
}

// ProtoOAClosePositionReq =====================================

export interface ProtoOAClosePositionReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  positionId: number;
  volume: number;
}

export class ProtoOAClosePositionReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAClosePositionReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        positionId: 0,
        volume: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAClosePositionReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.positionId = pbf.readVarint64();
    if (tag === 4) obj.volume = pbf.readVarint64();
  }

  static write(obj: ProtoOAClosePositionReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.positionId) pbf.writeVarintField(3, obj.positionId);
    if (pbf && obj.volume) pbf.writeVarintField(4, obj.volume);
  }
}

// ProtoOATrailingSLChangedEvent ===============================

export interface ProtoOATrailingSLChangedEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  positionId: number;
  orderId: number;
  stopPrice: number;
  utcLastUpdateTimestamp: number;
}

export class ProtoOATrailingSLChangedEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATrailingSLChangedEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        positionId: 0,
        orderId: 0,
        stopPrice: 0,
        utcLastUpdateTimestamp: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOATrailingSLChangedEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.positionId = pbf.readVarint64();
    if (tag === 4) obj.orderId = pbf.readVarint64();
    if (tag === 5) obj.stopPrice = pbf.readDouble();
    if (tag === 6) obj.utcLastUpdateTimestamp = pbf.readVarint64();
  }

  static write(obj: ProtoOATrailingSLChangedEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.positionId) pbf.writeVarintField(3, obj.positionId);
    if (pbf && obj.orderId) pbf.writeVarintField(4, obj.orderId);
    if (pbf && obj.stopPrice) pbf.writeDoubleField(5, obj.stopPrice);
    if (pbf && obj.utcLastUpdateTimestamp)
      pbf.writeVarintField(6, obj.utcLastUpdateTimestamp);
  }
}

// ProtoOAAssetListReq =========================================

export interface ProtoOAAssetListReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAAssetListReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAssetListReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAAssetListReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAAssetListReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAAssetListRes =========================================

export interface ProtoOAAssetListRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  asset?: ProtoOAAsset;
}

export class ProtoOAAssetListResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAssetListResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAAssetListRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.asset = ProtoOAAssetUtils.read(pbf);
  }

  static write(obj: ProtoOAAssetListRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.asset)
      pbf.writeMessage(3, ProtoOAAssetUtils.write, obj.asset);
  }
}

// ProtoOASymbolsListReq =======================================

export interface ProtoOASymbolsListReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOASymbolsListReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolsListReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASymbolsListReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOASymbolsListReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOASymbolsListRes =======================================

export interface ProtoOASymbolsListRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbol?: ProtoOALightSymbol;
}

export class ProtoOASymbolsListResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolsListResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASymbolsListRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbol = ProtoOALightSymbolUtils.read(pbf);
  }

  static write(obj: ProtoOASymbolsListRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbol)
      pbf.writeMessage(3, ProtoOALightSymbolUtils.write, obj.symbol);
  }
}

// ProtoOASymbolByIdReq ========================================

export interface ProtoOASymbolByIdReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId?: number;
}

export class ProtoOASymbolByIdReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolByIdReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASymbolByIdReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOASymbolByIdReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
  }
}

// ProtoOASymbolByIdRes ========================================

export interface ProtoOASymbolByIdRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbol?: ProtoOASymbol;
}

export class ProtoOASymbolByIdResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolByIdResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASymbolByIdRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbol = ProtoOASymbolUtils.read(pbf);
  }

  static write(obj: ProtoOASymbolByIdRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbol)
      pbf.writeMessage(3, ProtoOASymbolUtils.write, obj.symbol);
  }
}

// ProtoOASymbolsForConversionReq ==============================

export interface ProtoOASymbolsForConversionReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  firstAssetId: number;
  lastAssetId: number;
}

export class ProtoOASymbolsForConversionReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolsForConversionReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        firstAssetId: 0,
        lastAssetId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASymbolsForConversionReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.firstAssetId = pbf.readVarint64();
    if (tag === 4) obj.lastAssetId = pbf.readVarint64();
  }

  static write(obj: ProtoOASymbolsForConversionReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.firstAssetId) pbf.writeVarintField(3, obj.firstAssetId);
    if (pbf && obj.lastAssetId) pbf.writeVarintField(4, obj.lastAssetId);
  }
}

// ProtoOASymbolsForConversionRes ==============================

export interface ProtoOASymbolsForConversionRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbol?: ProtoOALightSymbol;
}

export class ProtoOASymbolsForConversionResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolsForConversionResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASymbolsForConversionRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbol = ProtoOALightSymbolUtils.read(pbf);
  }

  static write(obj: ProtoOASymbolsForConversionRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbol)
      pbf.writeMessage(3, ProtoOALightSymbolUtils.write, obj.symbol);
  }
}

// ProtoOASymbolChangedEvent ===================================

export interface ProtoOASymbolChangedEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId?: number;
}

export class ProtoOASymbolChangedEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolChangedEventUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASymbolChangedEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOASymbolChangedEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
  }
}

// ProtoOAAssetClassListReq ====================================

export interface ProtoOAAssetClassListReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAAssetClassListReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAssetClassListReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAssetClassListReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAAssetClassListReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAAssetClassListRes ====================================

export interface ProtoOAAssetClassListRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  assetClass?: ProtoOAAssetClass;
}

export class ProtoOAAssetClassListResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAssetClassListResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAssetClassListRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.assetClass = ProtoOAAssetClassUtils.read(pbf);
  }

  static write(obj: ProtoOAAssetClassListRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.assetClass)
      pbf.writeMessage(3, ProtoOAAssetClassUtils.write, obj.assetClass);
  }
}

// ProtoOATraderReq ============================================

export interface ProtoOATraderReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOATraderReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATraderReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOATraderReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOATraderReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOATraderRes ============================================

export interface ProtoOATraderRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  trader: ProtoOATrader;
}

export class ProtoOATraderResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATraderResUtils._readField,
      {
        ctidTraderAccountId: 0,
        trader: { balance: 0, ctidTraderAccountId: 0, depositAssetId: 0 }
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOATraderRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.trader = ProtoOATraderUtils.read(pbf);
  }

  static write(obj: ProtoOATraderRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.trader)
      pbf.writeMessage(3, ProtoOATraderUtils.write, obj.trader);
  }
}

// ProtoOATraderUpdatedEvent ===================================

export interface ProtoOATraderUpdatedEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  trader: ProtoOATrader;
}

export class ProtoOATraderUpdatedEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATraderUpdatedEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        trader: { balance: 0, ctidTraderAccountId: 0, depositAssetId: 0 }
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOATraderUpdatedEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.trader = ProtoOATraderUtils.read(pbf);
  }

  static write(obj: ProtoOATraderUpdatedEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.trader)
      pbf.writeMessage(3, ProtoOATraderUtils.write, obj.trader);
  }
}

// ProtoOAReconcileReq =========================================

export interface ProtoOAReconcileReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAReconcileReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAReconcileReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAReconcileReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAReconcileReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAReconcileRes =========================================

export interface ProtoOAReconcileRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  position?: ProtoOAPosition;
  order?: ProtoOAOrder;
}

export class ProtoOAReconcileResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAReconcileResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAReconcileRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.position = ProtoOAPositionUtils.read(pbf);
    if (tag === 4) obj.order = ProtoOAOrderUtils.read(pbf);
  }

  static write(obj: ProtoOAReconcileRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.position)
      pbf.writeMessage(3, ProtoOAPositionUtils.write, obj.position);
    if (pbf && obj.order)
      pbf.writeMessage(4, ProtoOAOrderUtils.write, obj.order);
  }
}

// ProtoOAOrderErrorEvent ======================================

export interface ProtoOAOrderErrorEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  errorCode: string;
  orderId?: number;
  positionId?: number;
  description?: string;
}

export class ProtoOAOrderErrorEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAOrderErrorEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        errorCode: ""
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAOrderErrorEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 5) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 2) obj.errorCode = pbf.readString();
    if (tag === 3) obj.orderId = pbf.readVarint64();
    if (tag === 6) obj.positionId = pbf.readVarint64();
    if (tag === 7) obj.description = pbf.readString();
  }

  static write(obj: ProtoOAOrderErrorEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(5, obj.ctidTraderAccountId);
    if (pbf && obj.errorCode) pbf.writeStringField(2, obj.errorCode);
    if (pbf && obj.orderId) pbf.writeVarintField(3, obj.orderId);
    if (pbf && obj.positionId) pbf.writeVarintField(6, obj.positionId);
    if (pbf && obj.description) pbf.writeStringField(7, obj.description);
  }
}

// ProtoOADealListReq ==========================================

export interface ProtoOADealListReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  fromTimestamp: number;
  toTimestamp: number;
  maxRows?: number;
}

export class ProtoOADealListReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOADealListReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        fromTimestamp: 0,
        toTimestamp: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOADealListReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.fromTimestamp = pbf.readVarint64();
    if (tag === 4) obj.toTimestamp = pbf.readVarint64();
    if (tag === 5) obj.maxRows = pbf.readVarint();
  }

  static write(obj: ProtoOADealListReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.fromTimestamp) pbf.writeVarintField(3, obj.fromTimestamp);
    if (pbf && obj.toTimestamp) pbf.writeVarintField(4, obj.toTimestamp);
    if (pbf && obj.maxRows) pbf.writeVarintField(5, obj.maxRows);
  }
}

// ProtoOADealListRes ==========================================

export interface ProtoOADealListRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  deal?: ProtoOADeal;
  hasMore: boolean;
}

export class ProtoOADealListResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOADealListResUtils._readField,
      {
        ctidTraderAccountId: 0,
        hasMore: false
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOADealListRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.deal = ProtoOADealUtils.read(pbf);
    if (tag === 4) obj.hasMore = pbf.readBoolean();
  }

  static write(obj: ProtoOADealListRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.deal) pbf.writeMessage(3, ProtoOADealUtils.write, obj.deal);
    if (pbf && obj.hasMore) pbf.writeBooleanField(4, obj.hasMore);
  }
}

// ProtoOAExpectedMarginReq ====================================

export interface ProtoOAExpectedMarginReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId: number;
  volume?: number;
}

export class ProtoOAExpectedMarginReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAExpectedMarginReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        symbolId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAExpectedMarginReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
    if (tag === 4) obj.volume = pbf.readVarint64();
  }

  static write(obj: ProtoOAExpectedMarginReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
    if (pbf && obj.volume) pbf.writeVarintField(4, obj.volume);
  }
}

// ProtoOAExpectedMarginRes ====================================

export interface ProtoOAExpectedMarginRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  margin?: ProtoOAExpectedMargin;
}

export class ProtoOAExpectedMarginResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAExpectedMarginResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAExpectedMarginRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.margin = ProtoOAExpectedMarginUtils.read(pbf);
  }

  static write(obj: ProtoOAExpectedMarginRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.margin)
      pbf.writeMessage(3, ProtoOAExpectedMarginUtils.write, obj.margin);
  }
}

// ProtoOAMarginChangedEvent ===================================

export interface ProtoOAMarginChangedEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  positionId: number;
  usedMargin: number;
}

export class ProtoOAMarginChangedEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAMarginChangedEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        positionId: 0,
        usedMargin: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAMarginChangedEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.positionId = pbf.readVarint64();
    if (tag === 4) obj.usedMargin = pbf.readVarint64();
  }

  static write(obj: ProtoOAMarginChangedEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.positionId) pbf.writeVarintField(3, obj.positionId);
    if (pbf && obj.usedMargin) pbf.writeVarintField(4, obj.usedMargin);
  }
}

// ProtoOACashFlowHistoryListReq ===============================

export interface ProtoOACashFlowHistoryListReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  fromTimestamp: number;
  toTimestamp: number;
}

export class ProtoOACashFlowHistoryListReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOACashFlowHistoryListReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        fromTimestamp: 0,
        toTimestamp: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOACashFlowHistoryListReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.fromTimestamp = pbf.readVarint64();
    if (tag === 4) obj.toTimestamp = pbf.readVarint64();
  }

  static write(obj: ProtoOACashFlowHistoryListReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.fromTimestamp) pbf.writeVarintField(3, obj.fromTimestamp);
    if (pbf && obj.toTimestamp) pbf.writeVarintField(4, obj.toTimestamp);
  }
}

// ProtoOACashFlowHistoryListRes ===============================

export interface ProtoOACashFlowHistoryListRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  depositWithdraw?: ProtoOADepositWithdraw;
}

export class ProtoOACashFlowHistoryListResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOACashFlowHistoryListResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOACashFlowHistoryListRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.depositWithdraw = ProtoOADepositWithdrawUtils.read(pbf);
  }

  static write(obj: ProtoOACashFlowHistoryListRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.depositWithdraw)
      pbf.writeMessage(
        3,
        ProtoOADepositWithdrawUtils.write,
        obj.depositWithdraw
      );
  }
}

// ProtoOAGetAccountListByAccessTokenReq =======================

export interface ProtoOAGetAccountListByAccessTokenReq {
  payloadType?: ProtoOAPayloadType;
  accessToken: string;
}

export class ProtoOAGetAccountListByAccessTokenReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetAccountListByAccessTokenReqUtils._readField,
      {
        accessToken: ""
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAGetAccountListByAccessTokenReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.accessToken = pbf.readString();
  }

  static write(obj: ProtoOAGetAccountListByAccessTokenReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.accessToken) pbf.writeStringField(2, obj.accessToken);
  }
}

// ProtoOAGetAccountListByAccessTokenRes =======================

export interface ProtoOAGetAccountListByAccessTokenRes {
  payloadType?: ProtoOAPayloadType;
  accessToken: string;
  permissionScope?: ProtoOAClientPermissionScope;
  ctidTraderAccount?: ProtoOACtidTraderAccount;
}

export class ProtoOAGetAccountListByAccessTokenResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetAccountListByAccessTokenResUtils._readField,
      {
        accessToken: ""
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAGetAccountListByAccessTokenRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.accessToken = pbf.readString();
    if (tag === 3) obj.permissionScope = pbf.readVarint();
    if (tag === 4)
      obj.ctidTraderAccount = ProtoOACtidTraderAccountUtils.read(pbf);
  }

  static write(obj: ProtoOAGetAccountListByAccessTokenRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.accessToken) pbf.writeStringField(2, obj.accessToken);
    if (pbf && obj.permissionScope)
      pbf.writeVarintField(3, obj.permissionScope);
    if (pbf && obj.ctidTraderAccount)
      pbf.writeMessage(
        4,
        ProtoOACtidTraderAccountUtils.write,
        obj.ctidTraderAccount
      );
  }
}

// ProtoOASubscribeSpotsReq ====================================

export interface ProtoOASubscribeSpotsReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId?: number;
}

export class ProtoOASubscribeSpotsReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASubscribeSpotsReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASubscribeSpotsReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOASubscribeSpotsReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
  }
}

// ProtoOASubscribeSpotsRes ====================================

export interface ProtoOASubscribeSpotsRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOASubscribeSpotsResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASubscribeSpotsResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASubscribeSpotsRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOASubscribeSpotsRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAUnsubscribeSpotsReq ==================================

export interface ProtoOAUnsubscribeSpotsReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId?: number;
}

export class ProtoOAUnsubscribeSpotsReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAUnsubscribeSpotsReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAUnsubscribeSpotsReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOAUnsubscribeSpotsReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
  }
}

// ProtoOAUnsubscribeSpotsRes ==================================

export interface ProtoOAUnsubscribeSpotsRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAUnsubscribeSpotsResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAUnsubscribeSpotsResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAUnsubscribeSpotsRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAUnsubscribeSpotsRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOASpotEvent ============================================

export interface ProtoOASpotEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId: number;
  bid?: number;
  ask?: number;
  trendbar?: ProtoOATrendbar;
}

export class ProtoOASpotEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASpotEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        symbolId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASpotEvent, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
    if (tag === 4) obj.bid = pbf.readVarint64();
    if (tag === 5) obj.ask = pbf.readVarint64();
    if (tag === 6) obj.trendbar = ProtoOATrendbarUtils.read(pbf);
  }

  static write(obj: ProtoOASpotEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
    if (pbf && obj.bid) pbf.writeVarintField(4, obj.bid);
    if (pbf && obj.ask) pbf.writeVarintField(5, obj.ask);
    if (pbf && obj.trendbar)
      pbf.writeMessage(6, ProtoOATrendbarUtils.write, obj.trendbar);
  }
}

// ProtoOASubscribeLiveTrendbarReq =============================

export interface ProtoOASubscribeLiveTrendbarReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  period: ProtoOATrendbarPeriod;
  symbolId: number;
}

export class ProtoOASubscribeLiveTrendbarReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASubscribeLiveTrendbarReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        period: ProtoOATrendbarPeriod.M1,
        symbolId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASubscribeLiveTrendbarReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.period = pbf.readVarint();
    if (tag === 4) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOASubscribeLiveTrendbarReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.period) pbf.writeVarintField(3, obj.period);
    if (pbf && obj.symbolId) pbf.writeVarintField(4, obj.symbolId);
  }
}

// ProtoOAUnsubscribeLiveTrendbarReq ===========================

export interface ProtoOAUnsubscribeLiveTrendbarReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  period: ProtoOATrendbarPeriod;
  symbolId: number;
}

export class ProtoOAUnsubscribeLiveTrendbarReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAUnsubscribeLiveTrendbarReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        period: ProtoOATrendbarPeriod.M1,
        symbolId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAUnsubscribeLiveTrendbarReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.period = pbf.readVarint();
    if (tag === 4) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOAUnsubscribeLiveTrendbarReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.period) pbf.writeVarintField(3, obj.period);
    if (pbf && obj.symbolId) pbf.writeVarintField(4, obj.symbolId);
  }
}

// ProtoOAGetTrendbarsReq ======================================

export interface ProtoOAGetTrendbarsReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  fromTimestamp: number;
  toTimestamp: number;
  period: ProtoOATrendbarPeriod;
  symbolId: number;
}

export class ProtoOAGetTrendbarsReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetTrendbarsReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        fromTimestamp: 0,
        toTimestamp: 0,
        period: ProtoOATrendbarPeriod.M1,
        symbolId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAGetTrendbarsReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.fromTimestamp = pbf.readVarint64();
    if (tag === 4) obj.toTimestamp = pbf.readVarint64();
    if (tag === 5) obj.period = pbf.readVarint();
    if (tag === 6) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOAGetTrendbarsReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.fromTimestamp) pbf.writeVarintField(3, obj.fromTimestamp);
    if (pbf && obj.toTimestamp) pbf.writeVarintField(4, obj.toTimestamp);
    if (pbf && obj.period) pbf.writeVarintField(5, obj.period);
    if (pbf && obj.symbolId) pbf.writeVarintField(6, obj.symbolId);
  }
}

// ProtoOAGetTrendbarsRes ======================================

export interface ProtoOAGetTrendbarsRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  period: ProtoOATrendbarPeriod;
  timestamp: number;
  trendbar?: ProtoOATrendbar;
  symbolId?: number;
}

export class ProtoOAGetTrendbarsResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetTrendbarsResUtils._readField,
      {
        ctidTraderAccountId: 0,
        period: ProtoOATrendbarPeriod.M1,
        timestamp: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAGetTrendbarsRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.period = pbf.readVarint();
    if (tag === 4) obj.timestamp = pbf.readVarint64();
    if (tag === 5) obj.trendbar = ProtoOATrendbarUtils.read(pbf);
    if (tag === 6) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOAGetTrendbarsRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.period) pbf.writeVarintField(3, obj.period);
    if (pbf && obj.timestamp) pbf.writeVarintField(4, obj.timestamp);
    if (pbf && obj.trendbar)
      pbf.writeMessage(5, ProtoOATrendbarUtils.write, obj.trendbar);
    if (pbf && obj.symbolId) pbf.writeVarintField(6, obj.symbolId);
  }
}

// ProtoOAGetTickDataReq =======================================

export interface ProtoOAGetTickDataReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId: number;
  type: ProtoOAQuoteType;
  fromTimestamp: number;
  toTimestamp: number;
}

export class ProtoOAGetTickDataReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetTickDataReqUtils._readField,
      {
        ctidTraderAccountId: 0,
        symbolId: 0,
        type: ProtoOAQuoteType.BID,
        fromTimestamp: 0,
        toTimestamp: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAGetTickDataReq, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
    if (tag === 4) obj.type = pbf.readVarint();
    if (tag === 5) obj.fromTimestamp = pbf.readVarint64();
    if (tag === 6) obj.toTimestamp = pbf.readVarint64();
  }

  static write(obj: ProtoOAGetTickDataReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
    if (pbf && obj.type) pbf.writeVarintField(4, obj.type);
    if (pbf && obj.fromTimestamp) pbf.writeVarintField(5, obj.fromTimestamp);
    if (pbf && obj.toTimestamp) pbf.writeVarintField(6, obj.toTimestamp);
  }
}

// ProtoOAGetTickDataRes =======================================

export interface ProtoOAGetTickDataRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  tickData?: ProtoOATickData;
  hasMore: boolean;
}

export class ProtoOAGetTickDataResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetTickDataResUtils._readField,
      {
        ctidTraderAccountId: 0,
        hasMore: false
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAGetTickDataRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.tickData = ProtoOATickDataUtils.read(pbf);
    if (tag === 4) obj.hasMore = pbf.readBoolean();
  }

  static write(obj: ProtoOAGetTickDataRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.tickData)
      pbf.writeMessage(3, ProtoOATickDataUtils.write, obj.tickData);
    if (pbf && obj.hasMore) pbf.writeBooleanField(4, obj.hasMore);
  }
}

// ProtoOAGetCtidProfileByTokenReq =============================

export interface ProtoOAGetCtidProfileByTokenReq {
  payloadType?: ProtoOAPayloadType;
  accessToken: string;
}

export class ProtoOAGetCtidProfileByTokenReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetCtidProfileByTokenReqUtils._readField,
      {
        accessToken: ""
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAGetCtidProfileByTokenReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.accessToken = pbf.readString();
  }

  static write(obj: ProtoOAGetCtidProfileByTokenReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.accessToken) pbf.writeStringField(2, obj.accessToken);
  }
}

// ProtoOAGetCtidProfileByTokenRes =============================

export interface ProtoOAGetCtidProfileByTokenRes {
  payloadType?: ProtoOAPayloadType;
  profile: ProtoOACtidProfile;
}

export class ProtoOAGetCtidProfileByTokenResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAGetCtidProfileByTokenResUtils._readField,
      {
        profile: { userId: 0 }
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAGetCtidProfileByTokenRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.profile = ProtoOACtidProfileUtils.read(pbf);
  }

  static write(obj: ProtoOAGetCtidProfileByTokenRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.profile)
      pbf.writeMessage(2, ProtoOACtidProfileUtils.write, obj.profile);
  }
}

// ProtoOADepthEvent ===========================================

export interface ProtoOADepthEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId: number;
  newQuotes?: ProtoOADepthQuote;
  deletedQuotes?: number;
}

export class ProtoOADepthEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOADepthEventUtils._readField,
      {
        ctidTraderAccountId: 0,
        symbolId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOADepthEvent, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
    if (tag === 4) obj.newQuotes = ProtoOADepthQuoteUtils.read(pbf);
    if (tag === 5) obj.deletedQuotes = pbf.readVarint64();
  }

  static write(obj: ProtoOADepthEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
    if (pbf && obj.newQuotes)
      pbf.writeMessage(4, ProtoOADepthQuoteUtils.write, obj.newQuotes);
    if (pbf && obj.deletedQuotes) pbf.writeVarintField(5, obj.deletedQuotes);
  }
}

// ProtoOASubscribeDepthQuotesReq ==============================

export interface ProtoOASubscribeDepthQuotesReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId?: number;
}

export class ProtoOASubscribeDepthQuotesReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASubscribeDepthQuotesReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASubscribeDepthQuotesReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOASubscribeDepthQuotesReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
  }
}

// ProtoOASubscribeDepthQuotesRes ==============================

export interface ProtoOASubscribeDepthQuotesRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOASubscribeDepthQuotesResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASubscribeDepthQuotesResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASubscribeDepthQuotesRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOASubscribeDepthQuotesRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAUnsubscribeDepthQuotesReq ============================

export interface ProtoOAUnsubscribeDepthQuotesReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolId?: number;
}

export class ProtoOAUnsubscribeDepthQuotesReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAUnsubscribeDepthQuotesReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAUnsubscribeDepthQuotesReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolId = pbf.readVarint64();
  }

  static write(obj: ProtoOAUnsubscribeDepthQuotesReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolId) pbf.writeVarintField(3, obj.symbolId);
  }
}

// ProtoOAUnsubscribeDepthQuotesRes ============================

export interface ProtoOAUnsubscribeDepthQuotesRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAUnsubscribeDepthQuotesResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAUnsubscribeDepthQuotesResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAUnsubscribeDepthQuotesRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAUnsubscribeDepthQuotesRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOASymbolCategoryListReq ================================

export interface ProtoOASymbolCategoryListReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOASymbolCategoryListReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolCategoryListReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASymbolCategoryListReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOASymbolCategoryListReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOASymbolCategoryListRes ================================

export interface ProtoOASymbolCategoryListRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
  symbolCategory?: ProtoOASymbolCategory;
}

export class ProtoOASymbolCategoryListResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolCategoryListResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOASymbolCategoryListRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 3) obj.symbolCategory = ProtoOASymbolCategoryUtils.read(pbf);
  }

  static write(obj: ProtoOASymbolCategoryListRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
    if (pbf && obj.symbolCategory)
      pbf.writeMessage(3, ProtoOASymbolCategoryUtils.write, obj.symbolCategory);
  }
}

// ProtoOAAccountLogoutReq =====================================

export interface ProtoOAAccountLogoutReq {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAAccountLogoutReqUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAccountLogoutReqUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAccountLogoutReq,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAAccountLogoutReq, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAAccountLogoutRes =====================================

export interface ProtoOAAccountLogoutRes {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAAccountLogoutResUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAccountLogoutResUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAccountLogoutRes,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAAccountLogoutRes, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAAccountDisconnectEvent ===============================

export interface ProtoOAAccountDisconnectEvent {
  payloadType?: ProtoOAPayloadType;
  ctidTraderAccountId: number;
}

export class ProtoOAAccountDisconnectEventUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAccountDisconnectEventUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAAccountDisconnectEvent,
    pbf: PBF
  ) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    if (tag === 2) obj.ctidTraderAccountId = pbf.readVarint64();
  }

  static write(obj: ProtoOAAccountDisconnectEvent, pbf?: PBF) {
    if (pbf && obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(2, obj.ctidTraderAccountId);
  }
}

// ProtoOAAsset ================================================

export interface ProtoOAAsset {
  assetId: number;
  name: string;
  displayName?: string;
}

export class ProtoOAAssetUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAAssetUtils._readField,
      {
        assetId: 0,
        name: ""
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAAsset, pbf: PBF) {
    if (tag === 1) obj.assetId = pbf.readVarint64();
    if (tag === 2) obj.name = pbf.readString();
    if (tag === 3) obj.displayName = pbf.readString();
  }

  static write(obj: ProtoOAAsset, pbf?: PBF) {
    if (pbf && obj.assetId) pbf.writeVarintField(1, obj.assetId);
    if (pbf && obj.name) pbf.writeStringField(2, obj.name);
    if (pbf && obj.displayName) pbf.writeStringField(3, obj.displayName);
  }
}

// ProtoOASymbol ===============================================

export interface ProtoOASymbol {
  symbolId: number;
  digits: number;
  pipPosition: number;
  enableShortSelling?: boolean;
  guaranteedStopLoss?: boolean;
  swapRollover3Days?: ProtoOADayOfWeek;
  swapLong?: number;
  swapShort?: number;
  maxVolume?: number;
  minVolume?: number;
  stepVolume?: number;
  maxExposure?: number;
  schedule?: ProtoOAInterval;
  commission: number;
  commissionType?: ProtoOACommissionType;
  slDistance?: number;
  tpDistance?: number;
  gslDistance?: number;
  gslCharge?: number;
  distanceSetIn?: ProtoOASymbolDistanceType;
  minCommission?: number;
  minCommissionType?: ProtoOAMinCommissionType;
  minCommissionAsset?: string;
  rolloverCommission?: number;
  skipRolloverDays?: number;
  scheduleTimeZone?: string;
  tradingMode?: ProtoOATradingMode;
  rolloverCommission3Days?: ProtoOADayOfWeek;
}

export class ProtoOASymbolUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolUtils._readField,
      {
        symbolId: 0,
        digits: 0,
        pipPosition: 0,
        commission: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASymbol, pbf: PBF) {
    if (tag === 1) obj.symbolId = pbf.readVarint64();
    if (tag === 2) obj.digits = pbf.readVarint();
    if (tag === 3) obj.pipPosition = pbf.readVarint();
    if (tag === 4) obj.enableShortSelling = pbf.readBoolean();
    if (tag === 5) obj.guaranteedStopLoss = pbf.readBoolean();
    if (tag === 6) obj.swapRollover3Days = pbf.readVarint();
    if (tag === 7) obj.swapLong = pbf.readDouble();
    if (tag === 8) obj.swapShort = pbf.readDouble();
    if (tag === 9) obj.maxVolume = pbf.readVarint64();
    if (tag === 10) obj.minVolume = pbf.readVarint64();
    if (tag === 11) obj.stepVolume = pbf.readVarint64();
    if (tag === 12) obj.maxExposure = pbf.readVarint64();
    if (tag === 13) obj.schedule = ProtoOAIntervalUtils.read(pbf);
    if (tag === 14) obj.commission = pbf.readVarint64();
    if (tag === 15) obj.commissionType = pbf.readVarint();
    if (tag === 16) obj.slDistance = pbf.readVarint();
    if (tag === 17) obj.tpDistance = pbf.readVarint();
    if (tag === 18) obj.gslDistance = pbf.readVarint();
    if (tag === 19) obj.gslCharge = pbf.readVarint64();
    if (tag === 20) obj.distanceSetIn = pbf.readVarint();
    if (tag === 21) obj.minCommission = pbf.readVarint64();
    if (tag === 22) obj.minCommissionType = pbf.readVarint();
    if (tag === 23) obj.minCommissionAsset = pbf.readString();
    if (tag === 24) obj.rolloverCommission = pbf.readVarint64();
    if (tag === 25) obj.skipRolloverDays = pbf.readVarint();
    if (tag === 26) obj.scheduleTimeZone = pbf.readString();
    if (tag === 27) obj.tradingMode = pbf.readVarint();
    if (tag === 28) obj.rolloverCommission3Days = pbf.readVarint();
  }

  static write(obj: ProtoOASymbol, pbf?: PBF) {
    if (pbf && obj.symbolId) pbf.writeVarintField(1, obj.symbolId);
    if (pbf && obj.digits) pbf.writeVarintField(2, obj.digits);
    if (pbf && obj.pipPosition) pbf.writeVarintField(3, obj.pipPosition);
    if (pbf && obj.enableShortSelling)
      pbf.writeBooleanField(4, obj.enableShortSelling);
    if (pbf && obj.guaranteedStopLoss)
      pbf.writeBooleanField(5, obj.guaranteedStopLoss);
    if (pbf && obj.swapRollover3Days)
      pbf.writeVarintField(6, obj.swapRollover3Days);
    if (pbf && obj.swapLong) pbf.writeDoubleField(7, obj.swapLong);
    if (pbf && obj.swapShort) pbf.writeDoubleField(8, obj.swapShort);
    if (pbf && obj.maxVolume) pbf.writeVarintField(9, obj.maxVolume);
    if (pbf && obj.minVolume) pbf.writeVarintField(10, obj.minVolume);
    if (pbf && obj.stepVolume) pbf.writeVarintField(11, obj.stepVolume);
    if (pbf && obj.maxExposure) pbf.writeVarintField(12, obj.maxExposure);
    if (pbf && obj.schedule)
      pbf.writeMessage(13, ProtoOAIntervalUtils.write, obj.schedule);
    if (pbf && obj.commission) pbf.writeVarintField(14, obj.commission);
    if (pbf && obj.commissionType) pbf.writeVarintField(15, obj.commissionType);
    if (pbf && obj.slDistance) pbf.writeVarintField(16, obj.slDistance);
    if (pbf && obj.tpDistance) pbf.writeVarintField(17, obj.tpDistance);
    if (pbf && obj.gslDistance) pbf.writeVarintField(18, obj.gslDistance);
    if (pbf && obj.gslCharge) pbf.writeVarintField(19, obj.gslCharge);
    if (pbf && obj.distanceSetIn) pbf.writeVarintField(20, obj.distanceSetIn);
    if (pbf && obj.minCommission) pbf.writeVarintField(21, obj.minCommission);
    if (pbf && obj.minCommissionType)
      pbf.writeVarintField(22, obj.minCommissionType);
    if (pbf && obj.minCommissionAsset)
      pbf.writeStringField(23, obj.minCommissionAsset);
    if (pbf && obj.rolloverCommission)
      pbf.writeVarintField(24, obj.rolloverCommission);
    if (pbf && obj.skipRolloverDays)
      pbf.writeVarintField(25, obj.skipRolloverDays);
    if (pbf && obj.scheduleTimeZone)
      pbf.writeStringField(26, obj.scheduleTimeZone);
    if (pbf && obj.tradingMode) pbf.writeVarintField(27, obj.tradingMode);
    if (pbf && obj.rolloverCommission3Days)
      pbf.writeVarintField(28, obj.rolloverCommission3Days);
  }
}

// ProtoOALightSymbol ==========================================

export interface ProtoOALightSymbol {
  symbolId: number;
  symbolName?: string;
  enabled?: boolean;
  baseAssetId?: number;
  quoteAssetId?: number;
  symbolCategoryId?: number;
  description?: string;
}

export class ProtoOALightSymbolUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOALightSymbolUtils._readField,
      {
        symbolId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOALightSymbol, pbf: PBF) {
    if (tag === 1) obj.symbolId = pbf.readVarint64();
    if (tag === 2) obj.symbolName = pbf.readString();
    if (tag === 3) obj.enabled = pbf.readBoolean();
    if (tag === 4) obj.baseAssetId = pbf.readVarint64();
    if (tag === 5) obj.quoteAssetId = pbf.readVarint64();
    if (tag === 6) obj.symbolCategoryId = pbf.readVarint64();
    if (tag === 7) obj.description = pbf.readString();
  }

  static write(obj: ProtoOALightSymbol, pbf?: PBF) {
    if (pbf && obj.symbolId) pbf.writeVarintField(1, obj.symbolId);
    if (pbf && obj.symbolName) pbf.writeStringField(2, obj.symbolName);
    if (pbf && obj.enabled) pbf.writeBooleanField(3, obj.enabled);
    if (pbf && obj.baseAssetId) pbf.writeVarintField(4, obj.baseAssetId);
    if (pbf && obj.quoteAssetId) pbf.writeVarintField(5, obj.quoteAssetId);
    if (pbf && obj.symbolCategoryId)
      pbf.writeVarintField(6, obj.symbolCategoryId);
    if (pbf && obj.description) pbf.writeStringField(7, obj.description);
  }
}

// ProtoOASymbolCategory =======================================

export interface ProtoOASymbolCategory {
  id: number;
  assetClassId: number;
  name: string;
}

export class ProtoOASymbolCategoryUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOASymbolCategoryUtils._readField,
      {
        id: 0,
        assetClassId: 0,
        name: ""
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOASymbolCategory, pbf: PBF) {
    if (tag === 1) obj.id = pbf.readVarint64();
    if (tag === 2) obj.assetClassId = pbf.readVarint64();
    if (tag === 3) obj.name = pbf.readString();
  }

  static write(obj: ProtoOASymbolCategory, pbf?: PBF) {
    if (pbf && obj.id) pbf.writeVarintField(1, obj.id);
    if (pbf && obj.assetClassId) pbf.writeVarintField(2, obj.assetClassId);
    if (pbf && obj.name) pbf.writeStringField(3, obj.name);
  }
}

// ProtoOAInterval =============================================

export interface ProtoOAInterval {
  startSecond: number;
  endSecond: number;
}

export class ProtoOAIntervalUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAIntervalUtils._readField,
      {
        startSecond: 0,
        endSecond: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAInterval, pbf: PBF) {
    if (tag === 3) obj.startSecond = pbf.readVarint();
    if (tag === 4) obj.endSecond = pbf.readVarint();
  }

  static write(obj: ProtoOAInterval, pbf?: PBF) {
    if (pbf && obj.startSecond) pbf.writeVarintField(3, obj.startSecond);
    if (pbf && obj.endSecond) pbf.writeVarintField(4, obj.endSecond);
  }
}

// ProtoOATrader ===============================================

export interface ProtoOATrader {
  ctidTraderAccountId: number;
  balance: number;
  balanceVersion?: number;
  managerBonus?: number;
  ibBonus?: number;
  nonWithdrawableBonus?: number;
  accessRights?: ProtoOAAccessRights;
  depositAssetId: number;
  swapFree?: boolean;
  leverageInCents?: number;
  totalMarginCalculationType?: ProtoOATotalMarginCalculationType;
  maxLeverage?: number;
  frenchRisk?: boolean;
  traderLogin?: number;
  accountType?: ProtoOAAccountType;
  brokerName?: string;
  registrationTimestamp?: number;
}

export class ProtoOATraderUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATraderUtils._readField,
      {
        ctidTraderAccountId: 0,
        balance: 0,
        depositAssetId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOATrader, pbf: PBF) {
    if (tag === 1) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 2) obj.balance = pbf.readVarint64();
    if (tag === 3) obj.balanceVersion = pbf.readVarint64();
    if (tag === 4) obj.managerBonus = pbf.readVarint64();
    if (tag === 5) obj.ibBonus = pbf.readVarint64();
    if (tag === 6) obj.nonWithdrawableBonus = pbf.readVarint64();
    if (tag === 7) obj.accessRights = pbf.readVarint();
    if (tag === 8) obj.depositAssetId = pbf.readVarint64();
    if (tag === 9) obj.swapFree = pbf.readBoolean();
    if (tag === 10) obj.leverageInCents = pbf.readVarint();
    if (tag === 11) obj.totalMarginCalculationType = pbf.readVarint();
    if (tag === 12) obj.maxLeverage = pbf.readVarint();
    if (tag === 13) obj.frenchRisk = pbf.readBoolean();
    if (tag === 14) obj.traderLogin = pbf.readVarint64();
    if (tag === 15) obj.accountType = pbf.readVarint();
    if (tag === 16) obj.brokerName = pbf.readString();
    if (tag === 17) obj.registrationTimestamp = pbf.readVarint64();
  }

  static write(obj: ProtoOATrader, pbf?: PBF) {
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(1, obj.ctidTraderAccountId);
    if (pbf && obj.balance) pbf.writeVarintField(2, obj.balance);
    if (pbf && obj.balanceVersion) pbf.writeVarintField(3, obj.balanceVersion);
    if (pbf && obj.managerBonus) pbf.writeVarintField(4, obj.managerBonus);
    if (pbf && obj.ibBonus) pbf.writeVarintField(5, obj.ibBonus);
    if (pbf && obj.nonWithdrawableBonus)
      pbf.writeVarintField(6, obj.nonWithdrawableBonus);
    if (pbf && obj.accessRights) pbf.writeVarintField(7, obj.accessRights);
    if (pbf && obj.depositAssetId) pbf.writeVarintField(8, obj.depositAssetId);
    if (pbf && obj.swapFree) pbf.writeBooleanField(9, obj.swapFree);
    if (pbf && obj.leverageInCents)
      pbf.writeVarintField(10, obj.leverageInCents);
    if (pbf && obj.totalMarginCalculationType)
      pbf.writeVarintField(11, obj.totalMarginCalculationType);
    if (pbf && obj.maxLeverage) pbf.writeVarintField(12, obj.maxLeverage);
    if (pbf && obj.frenchRisk) pbf.writeBooleanField(13, obj.frenchRisk);
    if (pbf && obj.traderLogin) pbf.writeVarintField(14, obj.traderLogin);
    if (pbf && obj.accountType) pbf.writeVarintField(15, obj.accountType);
    if (pbf && obj.brokerName) pbf.writeStringField(16, obj.brokerName);
    if (pbf && obj.registrationTimestamp)
      pbf.writeVarintField(17, obj.registrationTimestamp);
  }
}

// ProtoOAPosition =============================================

export interface ProtoOAPosition {
  positionId: number;
  tradeData: ProtoOATradeData;
  positionStatus: ProtoOAPositionStatus;
  swap: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  utcLastUpdateTimestamp?: number;
  commission?: number;
  marginRate?: number;
  mirroringCommission?: number;
  guaranteedStopLoss?: boolean;
  usedMargin?: number;
  stopLossTriggerMethod?: ProtoOAOrderTriggerMethod;
}

export class ProtoOAPositionUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAPositionUtils._readField,
      {
        positionId: 0,
        tradeData: { symbolId: 0, volume: 0, tradeSide: ProtoOATradeSide.BUY },
        positionStatus: ProtoOAPositionStatus.POSITION_STATUS_OPEN,
        swap: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAPosition, pbf: PBF) {
    if (tag === 1) obj.positionId = pbf.readVarint64();
    if (tag === 2) obj.tradeData = ProtoOATradeDataUtils.read(pbf);
    if (tag === 3) obj.positionStatus = pbf.readVarint();
    if (tag === 4) obj.swap = pbf.readVarint64();
    if (tag === 5) obj.price = pbf.readDouble();
    if (tag === 6) obj.stopLoss = pbf.readDouble();
    if (tag === 7) obj.takeProfit = pbf.readDouble();
    if (tag === 8) obj.utcLastUpdateTimestamp = pbf.readVarint64();
    if (tag === 9) obj.commission = pbf.readVarint64();
    if (tag === 10) obj.marginRate = pbf.readDouble();
    if (tag === 11) obj.mirroringCommission = pbf.readVarint64();
    if (tag === 12) obj.guaranteedStopLoss = pbf.readBoolean();
    if (tag === 13) obj.usedMargin = pbf.readVarint64();
    if (tag === 14) obj.stopLossTriggerMethod = pbf.readVarint();
  }

  static write(obj: ProtoOAPosition, pbf?: PBF) {
    if (pbf && obj.positionId) pbf.writeVarintField(1, obj.positionId);
    if (pbf && obj.tradeData)
      pbf.writeMessage(2, ProtoOATradeDataUtils.write, obj.tradeData);
    if (pbf && obj.positionStatus) pbf.writeVarintField(3, obj.positionStatus);
    if (pbf && obj.swap) pbf.writeVarintField(4, obj.swap);
    if (pbf && obj.price) pbf.writeDoubleField(5, obj.price);
    if (pbf && obj.stopLoss) pbf.writeDoubleField(6, obj.stopLoss);
    if (pbf && obj.takeProfit) pbf.writeDoubleField(7, obj.takeProfit);
    if (pbf && obj.utcLastUpdateTimestamp)
      pbf.writeVarintField(8, obj.utcLastUpdateTimestamp);
    if (pbf && obj.commission) pbf.writeVarintField(9, obj.commission);
    if (pbf && obj.marginRate) pbf.writeDoubleField(10, obj.marginRate);
    if (pbf && obj.mirroringCommission)
      pbf.writeVarintField(11, obj.mirroringCommission);
    if (pbf && obj.guaranteedStopLoss)
      pbf.writeBooleanField(12, obj.guaranteedStopLoss);
    if (pbf && obj.usedMargin) pbf.writeVarintField(13, obj.usedMargin);
    if (pbf && obj.stopLossTriggerMethod)
      pbf.writeVarintField(14, obj.stopLossTriggerMethod);
  }
}

// ProtoOATradeData ============================================

export interface ProtoOATradeData {
  symbolId: number;
  volume: number;
  tradeSide: ProtoOATradeSide;
  openTimestamp?: number;
  label?: string;
  guaranteedStopLoss?: boolean;
}

export class ProtoOATradeDataUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATradeDataUtils._readField,
      {
        symbolId: 0,
        volume: 0,
        tradeSide: ProtoOATradeSide.BUY
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOATradeData, pbf: PBF) {
    if (tag === 1) obj.symbolId = pbf.readVarint64();
    if (tag === 2) obj.volume = pbf.readVarint64();
    if (tag === 3) obj.tradeSide = pbf.readVarint();
    if (tag === 4) obj.openTimestamp = pbf.readVarint64();
    if (tag === 5) obj.label = pbf.readString();
    if (tag === 6) obj.guaranteedStopLoss = pbf.readBoolean();
  }

  static write(obj: ProtoOATradeData, pbf?: PBF) {
    if (pbf && obj.symbolId) pbf.writeVarintField(1, obj.symbolId);
    if (pbf && obj.volume) pbf.writeVarintField(2, obj.volume);
    if (pbf && obj.tradeSide) pbf.writeVarintField(3, obj.tradeSide);
    if (pbf && obj.openTimestamp) pbf.writeVarintField(4, obj.openTimestamp);
    if (pbf && obj.label) pbf.writeStringField(5, obj.label);
    if (pbf && obj.guaranteedStopLoss)
      pbf.writeBooleanField(6, obj.guaranteedStopLoss);
  }
}

// ProtoOAOrder ================================================

export interface ProtoOAOrder {
  orderId: number;
  tradeData: ProtoOATradeData;
  orderType: ProtoOAOrderType;
  orderStatus: ProtoOAOrderStatus;
  expirationTimestamp?: number;
  executionPrice?: number;
  executedVolume?: number;
  utcLastUpdateTimestamp?: number;
  baseSlippagePrice?: number;
  slippageInPoints?: number;
  closingOrder?: boolean;
  limitPrice?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  clientOrderId?: string;
  timeInForce?: ProtoOATimeInForce;
  positionId?: number;
  relativeStopLoss?: number;
  relativeTakeProfit?: number;
  isStopOut?: boolean;
  trailingStopLoss?: boolean;
  stopTriggerMethod?: ProtoOAOrderTriggerMethod;
}

export class ProtoOAOrderUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAOrderUtils._readField,
      {
        orderId: 0,
        tradeData: { symbolId: 0, volume: 0, tradeSide: ProtoOATradeSide.BUY },
        orderType: ProtoOAOrderType.MARKET,
        orderStatus: ProtoOAOrderStatus.ORDER_STATUS_ACCEPTED
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAOrder, pbf: PBF) {
    if (tag === 1) obj.orderId = pbf.readVarint64();
    if (tag === 2) obj.tradeData = ProtoOATradeDataUtils.read(pbf);
    if (tag === 3) obj.orderType = pbf.readVarint();
    if (tag === 4) obj.orderStatus = pbf.readVarint();
    if (tag === 6) obj.expirationTimestamp = pbf.readVarint64();
    if (tag === 7) obj.executionPrice = pbf.readDouble();
    if (tag === 8) obj.executedVolume = pbf.readVarint64();
    if (tag === 9) obj.utcLastUpdateTimestamp = pbf.readVarint64();
    if (tag === 10) obj.baseSlippagePrice = pbf.readDouble();
    if (tag === 11) obj.slippageInPoints = pbf.readVarint64();
    if (tag === 12) obj.closingOrder = pbf.readBoolean();
    if (tag === 13) obj.limitPrice = pbf.readDouble();
    if (tag === 14) obj.stopPrice = pbf.readDouble();
    if (tag === 15) obj.stopLoss = pbf.readDouble();
    if (tag === 16) obj.takeProfit = pbf.readDouble();
    if (tag === 17) obj.clientOrderId = pbf.readString();
    if (tag === 18) obj.timeInForce = pbf.readVarint();
    if (tag === 19) obj.positionId = pbf.readVarint64();
    if (tag === 20) obj.relativeStopLoss = pbf.readVarint64();
    if (tag === 21) obj.relativeTakeProfit = pbf.readVarint64();
    if (tag === 22) obj.isStopOut = pbf.readBoolean();
    if (tag === 23) obj.trailingStopLoss = pbf.readBoolean();
    if (tag === 24) obj.stopTriggerMethod = pbf.readVarint();
  }

  static write(obj: ProtoOAOrder, pbf?: PBF) {
    if (pbf && obj.orderId) pbf.writeVarintField(1, obj.orderId);
    if (pbf && obj.tradeData)
      pbf.writeMessage(2, ProtoOATradeDataUtils.write, obj.tradeData);
    if (pbf && obj.orderType) pbf.writeVarintField(3, obj.orderType);
    if (pbf && obj.orderStatus) pbf.writeVarintField(4, obj.orderStatus);
    if (pbf && obj.expirationTimestamp)
      pbf.writeVarintField(6, obj.expirationTimestamp);
    if (pbf && obj.executionPrice) pbf.writeDoubleField(7, obj.executionPrice);
    if (pbf && obj.executedVolume) pbf.writeVarintField(8, obj.executedVolume);
    if (pbf && obj.utcLastUpdateTimestamp)
      pbf.writeVarintField(9, obj.utcLastUpdateTimestamp);
    if (pbf && obj.baseSlippagePrice)
      pbf.writeDoubleField(10, obj.baseSlippagePrice);
    if (pbf && obj.slippageInPoints)
      pbf.writeVarintField(11, obj.slippageInPoints);
    if (pbf && obj.closingOrder) pbf.writeBooleanField(12, obj.closingOrder);
    if (pbf && obj.limitPrice) pbf.writeDoubleField(13, obj.limitPrice);
    if (pbf && obj.stopPrice) pbf.writeDoubleField(14, obj.stopPrice);
    if (pbf && obj.stopLoss) pbf.writeDoubleField(15, obj.stopLoss);
    if (pbf && obj.takeProfit) pbf.writeDoubleField(16, obj.takeProfit);
    if (pbf && obj.clientOrderId) pbf.writeStringField(17, obj.clientOrderId);
    if (pbf && obj.timeInForce) pbf.writeVarintField(18, obj.timeInForce);
    if (pbf && obj.positionId) pbf.writeVarintField(19, obj.positionId);
    if (pbf && obj.relativeStopLoss)
      pbf.writeVarintField(20, obj.relativeStopLoss);
    if (pbf && obj.relativeTakeProfit)
      pbf.writeVarintField(21, obj.relativeTakeProfit);
    if (pbf && obj.isStopOut) pbf.writeBooleanField(22, obj.isStopOut);
    if (pbf && obj.trailingStopLoss)
      pbf.writeBooleanField(23, obj.trailingStopLoss);
    if (pbf && obj.stopTriggerMethod)
      pbf.writeVarintField(24, obj.stopTriggerMethod);
  }
}

// ProtoOABonusDepositWithdraw =================================

export interface ProtoOABonusDepositWithdraw {
  operationType: ProtoOAChangeBonusType;
  bonusHistoryId: number;
  managerBonus: number;
  managerDelta: number;
  ibBonus: number;
  ibDelta: number;
  changeBonusTimestamp: number;
  externalNote?: string;
  introducingBrokerId?: number;
}

export class ProtoOABonusDepositWithdrawUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOABonusDepositWithdrawUtils._readField,
      {
        operationType: ProtoOAChangeBonusType.BONUS_DEPOSIT,
        bonusHistoryId: 0,
        managerBonus: 0,
        managerDelta: 0,
        ibBonus: 0,
        ibDelta: 0,
        changeBonusTimestamp: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOABonusDepositWithdraw,
    pbf: PBF
  ) {
    if (tag === 1) obj.operationType = pbf.readVarint();
    if (tag === 2) obj.bonusHistoryId = pbf.readVarint64();
    if (tag === 3) obj.managerBonus = pbf.readVarint64();
    if (tag === 4) obj.managerDelta = pbf.readVarint64();
    if (tag === 5) obj.ibBonus = pbf.readVarint64();
    if (tag === 6) obj.ibDelta = pbf.readVarint64();
    if (tag === 7) obj.changeBonusTimestamp = pbf.readVarint64();
    if (tag === 8) obj.externalNote = pbf.readString();
    if (tag === 9) obj.introducingBrokerId = pbf.readVarint64();
  }

  static write(obj: ProtoOABonusDepositWithdraw, pbf?: PBF) {
    if (pbf && obj.operationType) pbf.writeVarintField(1, obj.operationType);
    if (pbf && obj.bonusHistoryId) pbf.writeVarintField(2, obj.bonusHistoryId);
    if (pbf && obj.managerBonus) pbf.writeVarintField(3, obj.managerBonus);
    if (pbf && obj.managerDelta) pbf.writeVarintField(4, obj.managerDelta);
    if (pbf && obj.ibBonus) pbf.writeVarintField(5, obj.ibBonus);
    if (pbf && obj.ibDelta) pbf.writeVarintField(6, obj.ibDelta);
    if (pbf && obj.changeBonusTimestamp)
      pbf.writeVarintField(7, obj.changeBonusTimestamp);
    if (pbf && obj.externalNote) pbf.writeStringField(8, obj.externalNote);
    if (pbf && obj.introducingBrokerId)
      pbf.writeVarintField(9, obj.introducingBrokerId);
  }
}

// ProtoOADepositWithdraw ======================================

export interface ProtoOADepositWithdraw {
  operationType: ProtoOAChangeBalanceType;
  balanceHistoryId: number;
  balance: number;
  delta: number;
  changeBalanceTimestamp: number;
  externalNote?: string;
  balanceVersion?: number;
  equity?: number;
}

export class ProtoOADepositWithdrawUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOADepositWithdrawUtils._readField,
      {
        operationType: ProtoOAChangeBalanceType.BALANCE_DEPOSIT,
        balanceHistoryId: 0,
        balance: 0,
        delta: 0,
        changeBalanceTimestamp: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOADepositWithdraw,
    pbf: PBF
  ) {
    if (tag === 1) obj.operationType = pbf.readVarint();
    if (tag === 2) obj.balanceHistoryId = pbf.readVarint64();
    if (tag === 3) obj.balance = pbf.readVarint64();
    if (tag === 4) obj.delta = pbf.readVarint64();
    if (tag === 5) obj.changeBalanceTimestamp = pbf.readVarint64();
    if (tag === 6) obj.externalNote = pbf.readString();
    if (tag === 7) obj.balanceVersion = pbf.readVarint64();
    if (tag === 8) obj.equity = pbf.readVarint64();
  }

  static write(obj: ProtoOADepositWithdraw, pbf?: PBF) {
    if (pbf && obj.operationType) pbf.writeVarintField(1, obj.operationType);
    if (pbf && obj.balanceHistoryId)
      pbf.writeVarintField(2, obj.balanceHistoryId);
    if (pbf && obj.balance) pbf.writeVarintField(3, obj.balance);
    if (pbf && obj.delta) pbf.writeVarintField(4, obj.delta);
    if (pbf && obj.changeBalanceTimestamp)
      pbf.writeVarintField(5, obj.changeBalanceTimestamp);
    if (pbf && obj.externalNote) pbf.writeStringField(6, obj.externalNote);
    if (pbf && obj.balanceVersion) pbf.writeVarintField(7, obj.balanceVersion);
    if (pbf && obj.equity) pbf.writeVarintField(8, obj.equity);
  }
}

// ProtoOADeal =================================================

export interface ProtoOADeal {
  dealId: number;
  orderId: number;
  positionId: number;
  volume: number;
  filledVolume: number;
  symbolId: number;
  createTimestamp: number;
  executionTimestamp: number;
  utcLastUpdateTimestamp?: number;
  executionPrice?: number;
  tradeSide: ProtoOATradeSide;
  dealStatus: ProtoOADealStatus;
  marginRate?: number;
  commission?: number;
  baseToUsdConversionRate?: number;
  closePositionDetail?: ProtoOAClosePositionDetail;
}

export class ProtoOADealUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOADealUtils._readField,
      {
        dealId: 0,
        orderId: 0,
        positionId: 0,
        volume: 0,
        filledVolume: 0,
        symbolId: 0,
        createTimestamp: 0,
        executionTimestamp: 0,
        tradeSide: ProtoOATradeSide.BUY,
        dealStatus: ProtoOADealStatus.FILLED
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOADeal, pbf: PBF) {
    if (tag === 1) obj.dealId = pbf.readVarint64();
    if (tag === 2) obj.orderId = pbf.readVarint64();
    if (tag === 3) obj.positionId = pbf.readVarint64();
    if (tag === 4) obj.volume = pbf.readVarint64();
    if (tag === 5) obj.filledVolume = pbf.readVarint64();
    if (tag === 6) obj.symbolId = pbf.readVarint64();
    if (tag === 7) obj.createTimestamp = pbf.readVarint64();
    if (tag === 8) obj.executionTimestamp = pbf.readVarint64();
    if (tag === 9) obj.utcLastUpdateTimestamp = pbf.readVarint64();
    if (tag === 10) obj.executionPrice = pbf.readDouble();
    if (tag === 11) obj.tradeSide = pbf.readVarint();
    if (tag === 12) obj.dealStatus = pbf.readVarint();
    if (tag === 13) obj.marginRate = pbf.readDouble();
    if (tag === 14) obj.commission = pbf.readVarint64();
    if (tag === 15) obj.baseToUsdConversionRate = pbf.readDouble();
    if (tag === 16)
      obj.closePositionDetail = ProtoOAClosePositionDetailUtils.read(pbf);
  }

  static write(obj: ProtoOADeal, pbf?: PBF) {
    if (pbf && obj.dealId) pbf.writeVarintField(1, obj.dealId);
    if (pbf && obj.orderId) pbf.writeVarintField(2, obj.orderId);
    if (pbf && obj.positionId) pbf.writeVarintField(3, obj.positionId);
    if (pbf && obj.volume) pbf.writeVarintField(4, obj.volume);
    if (pbf && obj.filledVolume) pbf.writeVarintField(5, obj.filledVolume);
    if (pbf && obj.symbolId) pbf.writeVarintField(6, obj.symbolId);
    if (pbf && obj.createTimestamp)
      pbf.writeVarintField(7, obj.createTimestamp);
    if (pbf && obj.executionTimestamp)
      pbf.writeVarintField(8, obj.executionTimestamp);
    if (pbf && obj.utcLastUpdateTimestamp)
      pbf.writeVarintField(9, obj.utcLastUpdateTimestamp);
    if (pbf && obj.executionPrice) pbf.writeDoubleField(10, obj.executionPrice);
    if (pbf && obj.tradeSide) pbf.writeVarintField(11, obj.tradeSide);
    if (pbf && obj.dealStatus) pbf.writeVarintField(12, obj.dealStatus);
    if (pbf && obj.marginRate) pbf.writeDoubleField(13, obj.marginRate);
    if (pbf && obj.commission) pbf.writeVarintField(14, obj.commission);
    if (pbf && obj.baseToUsdConversionRate)
      pbf.writeDoubleField(15, obj.baseToUsdConversionRate);
    if (pbf && obj.closePositionDetail)
      pbf.writeMessage(
        16,
        ProtoOAClosePositionDetailUtils.write,
        obj.closePositionDetail
      );
  }
}

// ProtoOAClosePositionDetail ==================================

export interface ProtoOAClosePositionDetail {
  entryPrice: number;
  grossProfit: number;
  swap: number;
  commission: number;
  balance: number;
  quoteToDepositConversionRate?: number;
  closedVolume?: number;
  balanceVersion?: number;
}

export class ProtoOAClosePositionDetailUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAClosePositionDetailUtils._readField,
      {
        entryPrice: 0,
        grossProfit: 0,
        swap: 0,
        commission: 0,
        balance: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOAClosePositionDetail,
    pbf: PBF
  ) {
    if (tag === 1) obj.entryPrice = pbf.readDouble();
    if (tag === 2) obj.grossProfit = pbf.readVarint64();
    if (tag === 3) obj.swap = pbf.readVarint64();
    if (tag === 4) obj.commission = pbf.readVarint64();
    if (tag === 5) obj.balance = pbf.readVarint64();
    if (tag === 6) obj.quoteToDepositConversionRate = pbf.readDouble();
    if (tag === 7) obj.closedVolume = pbf.readVarint64();
    if (tag === 8) obj.balanceVersion = pbf.readVarint64();
  }

  static write(obj: ProtoOAClosePositionDetail, pbf?: PBF) {
    if (pbf && obj.entryPrice) pbf.writeDoubleField(1, obj.entryPrice);
    if (pbf && obj.grossProfit) pbf.writeVarintField(2, obj.grossProfit);
    if (pbf && obj.swap) pbf.writeVarintField(3, obj.swap);
    if (pbf && obj.commission) pbf.writeVarintField(4, obj.commission);
    if (pbf && obj.balance) pbf.writeVarintField(5, obj.balance);
    if (pbf && obj.quoteToDepositConversionRate)
      pbf.writeDoubleField(6, obj.quoteToDepositConversionRate);
    if (pbf && obj.closedVolume) pbf.writeVarintField(7, obj.closedVolume);
    if (pbf && obj.balanceVersion) pbf.writeVarintField(8, obj.balanceVersion);
  }
}

// ProtoOATrendbar =============================================

export interface ProtoOATrendbar {
  volume: number;
  period?: ProtoOATrendbarPeriod;
  low?: number;
  deltaOpen?: number;
  deltaClose?: number;
  deltaHigh?: number;
  utcTimestampInMinutes?: number;
}

export class ProtoOATrendbarUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATrendbarUtils._readField,
      {
        volume: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOATrendbar, pbf: PBF) {
    if (tag === 3) obj.volume = pbf.readVarint64();
    if (tag === 4) obj.period = pbf.readVarint();
    if (tag === 5) obj.low = pbf.readVarint64();
    if (tag === 6) obj.deltaOpen = pbf.readVarint64();
    if (tag === 7) obj.deltaClose = pbf.readVarint64();
    if (tag === 8) obj.deltaHigh = pbf.readVarint64();
    if (tag === 9) obj.utcTimestampInMinutes = pbf.readVarint();
  }

  static write(obj: ProtoOATrendbar, pbf?: PBF) {
    if (pbf && obj.volume) pbf.writeVarintField(3, obj.volume);
    if (pbf && obj.period) pbf.writeVarintField(4, obj.period);
    if (pbf && obj.low) pbf.writeVarintField(5, obj.low);
    if (pbf && obj.deltaOpen) pbf.writeVarintField(6, obj.deltaOpen);
    if (pbf && obj.deltaClose) pbf.writeVarintField(7, obj.deltaClose);
    if (pbf && obj.deltaHigh) pbf.writeVarintField(8, obj.deltaHigh);
    if (pbf && obj.utcTimestampInMinutes)
      pbf.writeVarintField(9, obj.utcTimestampInMinutes);
  }
}

// ProtoOAExpectedMargin =======================================

export interface ProtoOAExpectedMargin {
  volume: number;
  buyMargin: number;
  sellMargin: number;
}

export class ProtoOAExpectedMarginUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOAExpectedMarginUtils._readField,
      {
        volume: 0,
        buyMargin: 0,
        sellMargin: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOAExpectedMargin, pbf: PBF) {
    if (tag === 1) obj.volume = pbf.readVarint64();
    if (tag === 2) obj.buyMargin = pbf.readVarint64();
    if (tag === 3) obj.sellMargin = pbf.readVarint64();
  }

  static write(obj: ProtoOAExpectedMargin, pbf?: PBF) {
    if (pbf && obj.volume) pbf.writeVarintField(1, obj.volume);
    if (pbf && obj.buyMargin) pbf.writeVarintField(2, obj.buyMargin);
    if (pbf && obj.sellMargin) pbf.writeVarintField(3, obj.sellMargin);
  }
}

// ProtoOATickData =============================================

export interface ProtoOATickData {
  timestamp: number;
  tick: number;
}

export class ProtoOATickDataUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOATickDataUtils._readField,
      {
        timestamp: 0,
        tick: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOATickData, pbf: PBF) {
    if (tag === 1) obj.timestamp = pbf.readVarint64();
    if (tag === 2) obj.tick = pbf.readVarint64();
  }

  static write(obj: ProtoOATickData, pbf?: PBF) {
    if (pbf && obj.timestamp) pbf.writeVarintField(1, obj.timestamp);
    if (pbf && obj.tick) pbf.writeVarintField(2, obj.tick);
  }
}

// ProtoOACtidProfile ==========================================

export interface ProtoOACtidProfile {
  userId: number;
}

export class ProtoOACtidProfileUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOACtidProfileUtils._readField,
      {
        userId: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOACtidProfile, pbf: PBF) {
    if (tag === 1) obj.userId = pbf.readVarint64();
  }

  static write(obj: ProtoOACtidProfile, pbf?: PBF) {
    if (pbf && obj.userId) pbf.writeVarintField(1, obj.userId);
  }
}

// ProtoOACtidTraderAccount ====================================

export interface ProtoOACtidTraderAccount {
  ctidTraderAccountId: number;
  isLive?: boolean;
  traderLogin?: number;
}

export class ProtoOACtidTraderAccountUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOACtidTraderAccountUtils._readField,
      {
        ctidTraderAccountId: 0
      },
      end
    );
  }

  private static _readField(
    tag: number,
    obj: ProtoOACtidTraderAccount,
    pbf: PBF
  ) {
    if (tag === 1) obj.ctidTraderAccountId = pbf.readVarint64();
    if (tag === 2) obj.isLive = pbf.readBoolean();
    if (tag === 3) obj.traderLogin = pbf.readVarint64();
  }

  static write(obj: ProtoOACtidTraderAccount, pbf?: PBF) {
    if (pbf && obj.ctidTraderAccountId)
      pbf.writeVarintField(1, obj.ctidTraderAccountId);
    if (pbf && obj.isLive) pbf.writeBooleanField(2, obj.isLive);
    if (pbf && obj.traderLogin) pbf.writeVarintField(3, obj.traderLogin);
  }
}

// ProtoOAAssetClass ===========================================

export interface ProtoOAAssetClass {
  id?: number;
  name?: string;
}

export class ProtoOAAssetClassUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(ProtoOAAssetClassUtils._readField, {}, end);
  }

  private static _readField(tag: number, obj: ProtoOAAssetClass, pbf: PBF) {
    if (tag === 1) obj.id = pbf.readVarint64();
    if (tag === 2) obj.name = pbf.readString();
  }

  static write(obj: ProtoOAAssetClass, pbf?: PBF) {
    if (pbf && obj.id) pbf.writeVarintField(1, obj.id);
    if (pbf && obj.name) pbf.writeStringField(2, obj.name);
  }
}

// ProtoOADepthQuote ===========================================

export interface ProtoOADepthQuote {
  id: number;
  size: number;
  bid?: number;
  ask?: number;
}

export class ProtoOADepthQuoteUtils {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoOADepthQuoteUtils._readField,
      {
        id: 0,
        size: 0
      },
      end
    );
  }

  private static _readField(tag: number, obj: ProtoOADepthQuote, pbf: PBF) {
    if (tag === 1) obj.id = pbf.readVarint64();
    if (tag === 3) obj.size = pbf.readVarint64();
    if (tag === 4) obj.bid = pbf.readVarint64();
    if (tag === 5) obj.ask = pbf.readVarint64();
  }

  static write(obj: ProtoOADepthQuote, pbf?: PBF) {
    if (pbf && obj.id) pbf.writeVarintField(1, obj.id);
    if (pbf && obj.size) pbf.writeVarintField(3, obj.size);
    if (pbf && obj.bid) pbf.writeVarintField(4, obj.bid);
    if (pbf && obj.ask) pbf.writeVarintField(5, obj.ask);
  }
}
