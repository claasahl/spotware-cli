import { Options as BacktestOptions } from "../backtest";

export type Experiment = (
  options: Pick<BacktestOptions, "symbol" | "period">,
  backtest: (
    options: Pick<BacktestOptions, "strategy" | "done">
  ) => Promise<void>
) => Promise<void>;
