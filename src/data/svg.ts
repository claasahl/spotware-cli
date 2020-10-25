import { JSDOM } from "jsdom";
import * as d3 from "d3";
import fs from "fs";
import { bullish, upper, lower } from "indicators";

import { Trendbar } from "../utils";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

const BAR_WIDTH_FULL = 20;
const BAR_WIDTH_HALF = 10;

const BULLISH_COLOR = "rgb(117, 227, 66)";
const BEARISH_COLOR = "rgb(255, 0, 66)";

function bar(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  trendbar: Trendbar
) {
  const color = bullish(trendbar) ? BULLISH_COLOR : BEARISH_COLOR;
  const price = d3
    .scaleLinear()
    .domain([trendbar.low, trendbar.high])
    .rangeRound([105, 5]);
  const x = 110;
  svg
    .append("rect")
    .attr("x", x - BAR_WIDTH_HALF)
    .attr("y", price(upper(trendbar)) || -100)
    .attr("width", BAR_WIDTH_FULL)
    .attr(
      "height",
      (price(upper(trendbar)) || -100) - (price(lower(trendbar)) || -100)
    )
    .attr("style", `fill: ${color}; stroke: ${color}; stroke-width: 2`);
  svg
    .append("line")
    .attr("x1", x)
    .attr("y1", price(trendbar.high) || -100)
    .attr("x2", x)
    .attr("y2", price(trendbar.low) || -100)
    .attr("style", `stroke: ${color}; stroke-width: 2`);
}

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);

const htmlBody = d3.select(dom.window.document.querySelector("body"));
const svg = htmlBody
  .append("svg")
  .attr("width", 1000)
  .attr("height", 1000)
  .attr("xmlns", "http://www.w3.org/2000/svg");
svg
  .append("rect")
  .attr("x", 10)
  .attr("y", 10)
  .attr("width", 80)
  .attr("height", 80)
  .style("fill", "orange");

const trendbar: Trendbar = {
  open: 10,
  high: 40,
  low: 5,
  close: 10,
  volume: 1,
  period: ProtoOATrendbarPeriod.D1,
  timestamp: Date.now(),
};
bar(svg, trendbar);

fs.writeFileSync("out.svg", htmlBody.html());
