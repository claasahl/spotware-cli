import { Options as BacktestOptions } from "../backtest";

export type ExperimentBacktestOptions = Pick<
  BacktestOptions,
  "strategy" | "done" | "period" | "symbol" | "forsight"
>;
export type ExperimentOptions = Pick<
  BacktestOptions,
  "symbol" | "period" | "forsight"
>;

export type Experiment = (
  options: ExperimentOptions,
  backtest: (options: ExperimentBacktestOptions) => Promise<void>
) => Promise<void>;
