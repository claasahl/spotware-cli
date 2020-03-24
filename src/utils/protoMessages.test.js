const {
  ProtoPayloadType,
  ProtoOAPayloadType
} = require("@claasahl/spotware-adapter");
const pm = require("../../build/utils/protoMessages");

describe("", () => {
  test("5 / PROTO_MESSAGE", () => {
    const { payloadType } = pm.pm5();
    expect(payloadType).toBe(ProtoPayloadType.PROTO_MESSAGE);
  });
  test("50 / ERROR_RES", () => {
    const { payloadType } = pm.pm50();
    expect(payloadType).toBe(ProtoPayloadType.ERROR_RES);
  });
  test("51 / HEARTBEAT_EVENT", () => {
    const { payloadType } = pm.pm51();
    expect(payloadType).toBe(ProtoPayloadType.HEARTBEAT_EVENT);
  });
  test("2100 / PROTO_OA_APPLICATION_AUTH_REQ", () => {
    const { payloadType } = pm.pm2100();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ);
  });
  test("2101 / PROTO_OA_APPLICATION_AUTH_RES", () => {
    const { payloadType } = pm.pm2101();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES);
  });
  test("2102 / PROTO_OA_ACCOUNT_AUTH_REQ", () => {
    const { payloadType } = pm.pm2102();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ);
  });
  test("2103 / PROTO_OA_ACCOUNT_AUTH_RES", () => {
    const { payloadType } = pm.pm2103();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES);
  });
  test("2104 / PROTO_OA_VERSION_REQ", () => {
    const { payloadType } = pm.pm2104();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_VERSION_REQ);
  });
  test("2105 / PROTO_OA_VERSION_RES", () => {
    const { payloadType } = pm.pm2105();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_VERSION_RES);
  });
  test("2106 / PROTO_OA_NEW_ORDER_REQ", () => {
    const { payloadType } = pm.pm2106();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_NEW_ORDER_REQ);
  });
  test("2107 / PROTO_OA_TRAILING_SL_CHANGED_EVENT", () => {
    const { payloadType } = pm.pm2107();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_TRAILING_SL_CHANGED_EVENT
    );
  });
  test("2108 / PROTO_OA_CANCEL_ORDER_REQ", () => {
    const { payloadType } = pm.pm2108();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_CANCEL_ORDER_REQ);
  });
  test("2109 / PROTO_OA_AMEND_ORDER_REQ", () => {
    const { payloadType } = pm.pm2109();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_AMEND_ORDER_REQ);
  });
  test("2110 / PROTO_OA_AMEND_POSITION_SLTP_REQ", () => {
    const { payloadType } = pm.pm2110();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_AMEND_POSITION_SLTP_REQ
    );
  });
  test("2111 / PROTO_OA_CLOSE_POSITION_REQ", () => {
    const { payloadType } = pm.pm2111();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_CLOSE_POSITION_REQ);
  });
  test("2112 / PROTO_OA_ASSET_LIST_REQ", () => {
    const { payloadType } = pm.pm2112();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ);
  });
  test("2113 / PROTO_OA_ASSET_LIST_RES", () => {
    const { payloadType } = pm.pm2113();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES);
  });
  test("2114 / PROTO_OA_SYMBOLS_LIST_REQ", () => {
    const { payloadType } = pm.pm2114();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ);
  });
  test("2115 / PROTO_OA_SYMBOLS_LIST_RES", () => {
    const { payloadType } = pm.pm2115();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES);
  });
  test("2116 / PROTO_OA_SYMBOL_BY_ID_REQ", () => {
    const { payloadType } = pm.pm2116();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_REQ);
  });
  test("2117 / PROTO_OA_SYMBOL_BY_ID_RES", () => {
    const { payloadType } = pm.pm2117();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_RES);
  });
  test("2118 / PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ", () => {
    const { payloadType } = pm.pm2118();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ
    );
  });
  test("2119 / PROTO_OA_SYMBOLS_FOR_CONVERSION_RES", () => {
    const { payloadType } = pm.pm2119();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_RES
    );
  });
  test("2120 / PROTO_OA_SYMBOL_CHANGED_EVENT", () => {
    const { payloadType } = pm.pm2120();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOL_CHANGED_EVENT);
  });
  test("2121 / PROTO_OA_TRADER_REQ", () => {
    const { payloadType } = pm.pm2121();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_TRADER_REQ);
  });
  test("2122 / PROTO_OA_TRADER_RES", () => {
    const { payloadType } = pm.pm2122();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_TRADER_RES);
  });
  test("2123 / PROTO_OA_TRADER_UPDATE_EVENT", () => {
    const { payloadType } = pm.pm2123();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_TRADER_UPDATE_EVENT);
  });
  test("2124 / PROTO_OA_RECONCILE_REQ", () => {
    const { payloadType } = pm.pm2124();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_RECONCILE_REQ);
  });
  test("2125 / PROTO_OA_RECONCILE_RES", () => {
    const { payloadType } = pm.pm2125();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_RECONCILE_RES);
  });
  test("2126 / PROTO_OA_EXECUTION_EVENT", () => {
    const { payloadType } = pm.pm2126();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT);
  });
  test("2127 / PROTO_OA_SUBSCRIBE_SPOTS_REQ", () => {
    const { payloadType } = pm.pm2127();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ);
  });
  test("2128 / PROTO_OA_SUBSCRIBE_SPOTS_RES", () => {
    const { payloadType } = pm.pm2128();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES);
  });
  test("2129 / PROTO_OA_UNSUBSCRIBE_SPOTS_REQ", () => {
    const { payloadType } = pm.pm2129();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ);
  });
  test("2130 / PROTO_OA_UNSUBSCRIBE_SPOTS_RES", () => {
    const { payloadType } = pm.pm2130();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_RES);
  });
  test("2131 / PROTO_OA_SPOT_EVENT", () => {
    const { payloadType } = pm.pm2131();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SPOT_EVENT);
  });
  test("2132 / PROTO_OA_ORDER_ERROR_EVENT", () => {
    const { payloadType } = pm.pm2132();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ORDER_ERROR_EVENT);
  });
  test("2133 / PROTO_OA_DEAL_LIST_REQ", () => {
    const { payloadType } = pm.pm2133();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ);
  });
  test("2134 / PROTO_OA_DEAL_LIST_RES", () => {
    const { payloadType } = pm.pm2134();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES);
  });
  test("2135 / PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ", () => {
    const { payloadType } = pm.pm2135();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ
    );
  });
  test("2136 / PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ", () => {
    const { payloadType } = pm.pm2136();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ
    );
  });
  test("2137 / PROTO_OA_GET_TRENDBARS_REQ", () => {
    const { payloadType } = pm.pm2137();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_REQ);
  });
  test("2138 / PROTO_OA_GET_TRENDBARS_RES", () => {
    const { payloadType } = pm.pm2138();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES);
  });
  test("2139 / PROTO_OA_EXPECTED_MARGIN_REQ", () => {
    const { payloadType } = pm.pm2139();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ);
  });
  test("2140 / PROTO_OA_EXPECTED_MARGIN_RES", () => {
    const { payloadType } = pm.pm2140();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES);
  });
  test("2141 / PROTO_OA_MARGIN_CHANGED_EVENT", () => {
    const { payloadType } = pm.pm2141();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_MARGIN_CHANGED_EVENT);
  });
  test("2142 / PROTO_OA_ERROR_RES", () => {
    const { payloadType } = pm.pm2142();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ERROR_RES);
  });
  test("2143 / PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ", () => {
    const { payloadType } = pm.pm2143();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ
    );
  });
  test("2144 / PROTO_OA_CASH_FLOW_HISTORY_LIST_RES", () => {
    const { payloadType } = pm.pm2144();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_RES
    );
  });
  test("2145 / PROTO_OA_GET_TICKDATA_REQ", () => {
    const { payloadType } = pm.pm2145();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ);
  });
  test("2146 / PROTO_OA_GET_TICKDATA_RES", () => {
    const { payloadType } = pm.pm2146();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES);
  });
  test("2147 / PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT", () => {
    const { payloadType } = pm.pm2147();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT
    );
  });
  test("2148 / PROTO_OA_CLIENT_DISCONNECT_EVENT", () => {
    const { payloadType } = pm.pm2148();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_CLIENT_DISCONNECT_EVENT
    );
  });
  test("2149 / PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ", () => {
    const { payloadType } = pm.pm2149();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ
    );
  });
  test("2150 / PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES", () => {
    const { payloadType } = pm.pm2150();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES
    );
  });
  test("2151 / PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ", () => {
    const { payloadType } = pm.pm2151();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ
    );
  });
  test("2152 / PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES", () => {
    const { payloadType } = pm.pm2152();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES
    );
  });
  test("2153 / PROTO_OA_ASSET_CLASS_LIST_REQ", () => {
    const { payloadType } = pm.pm2153();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ);
  });
  test("2154 / PROTO_OA_ASSET_CLASS_LIST_RES", () => {
    const { payloadType } = pm.pm2154();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES);
  });
  test("2155 / PROTO_OA_DEPTH_EVENT", () => {
    const { payloadType } = pm.pm2155();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_DEPTH_EVENT);
  });
  test("2156 / PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ", () => {
    const { payloadType } = pm.pm2156();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ
    );
  });
  test("2157 / PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES", () => {
    const { payloadType } = pm.pm2157();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES
    );
  });
  test("2158 / PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ", () => {
    const { payloadType } = pm.pm2158();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ
    );
  });
  test("2159 / PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES", () => {
    const { payloadType } = pm.pm2159();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES
    );
  });
  test("2160 / PROTO_OA_SYMBOL_CATEGORY_REQ", () => {
    const { payloadType } = pm.pm2160();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ);
  });
  test("2161 / PROTO_OA_SYMBOL_CATEGORY_RES", () => {
    const { payloadType } = pm.pm2161();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES);
  });
  test("2162 / PROTO_OA_ACCOUNT_LOGOUT_REQ", () => {
    const { payloadType } = pm.pm2162();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_REQ);
  });
  test("2163 / PROTO_OA_ACCOUNT_LOGOUT_RES", () => {
    const { payloadType } = pm.pm2163();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_RES);
  });
  test("2164 / PROTO_OA_ACCOUNT_DISCONNECT_EVENT", () => {
    const { payloadType } = pm.pm2164();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_ACCOUNT_DISCONNECT_EVENT
    );
  });
  test("2165 / PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES", () => {
    const { payloadType } = pm.pm2165();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES
    );
  });
  test("2166 / PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_RES", () => {
    const { payloadType } = pm.pm2166();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_RES
    );
  });
  test("2167 / PROTO_OA_MARGIN_CALL_LIST_REQ", () => {
    const { payloadType } = pm.pm2167();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_REQ);
  });
  test("2168 / PROTO_OA_MARGIN_CALL_LIST_RES", () => {
    const { payloadType } = pm.pm2168();
    expect(payloadType).toBe(ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_RES);
  });
  test("2169 / PROTO_OA_MARGIN_CALL_UPDATE_REQ", () => {
    const { payloadType } = pm.pm2169();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_REQ
    );
  });
  test("2170 / PROTO_OA_MARGIN_CALL_UPDATE_RES", () => {
    const { payloadType } = pm.pm2170();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_RES
    );
  });
  test("2171 / PROTO_OA_MARGIN_CALL_UPDATE_EVENT", () => {
    const { payloadType } = pm.pm2171();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_EVENT
    );
  });
  test("2172 / PROTO_OA_MARGIN_CALL_TRIGGER_EVENT", () => {
    const { payloadType } = pm.pm2172();
    expect(payloadType).toBe(
      ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_TRIGGER_EVENT
    );
  });
  test("should cover all payloadTypes", () => {
    const protoOAPayloadTypes = Object.keys(ProtoOAPayloadType)
      .map(k => ProtoOAPayloadType[k])
      .filter(k => typeof k === "number");
    const protoPayloadTypes = Object.keys(ProtoPayloadType)
      .map(k => ProtoPayloadType[k])
      .filter(k => typeof k === "number");
    const functionNames = [...protoPayloadTypes, ...protoOAPayloadTypes].map(
      payloadType => `pm${payloadType}`
    );

    functionNames.forEach(functionName => {
      expect(typeof pm[functionName]).toBe("function");
    });
  });
  test("should cover only(!) payloadTypes", () => {
    const protoOAPayloadTypes = Object.keys(ProtoOAPayloadType)
      .map(k => ProtoOAPayloadType[k])
      .filter(k => typeof k === "number");
    const protoPayloadTypes = Object.keys(ProtoPayloadType)
      .map(k => ProtoPayloadType[k])
      .filter(k => typeof k === "number");
    const functionNames = [...protoPayloadTypes, ...protoOAPayloadTypes].map(
      payloadType => `pm${payloadType}`
    );

    const implementedFunctions = Object.keys(pm);
    const additionalFunctions = implementedFunctions.filter(
      functionName => !functionNames.includes(functionName)
    );
    expect(additionalFunctions.length).toBe(0);
  });
});
