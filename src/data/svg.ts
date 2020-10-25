import { JSDOM } from "jsdom";
import * as d3 from "d3";
import fs from "fs";

import { Trendbar } from "../utils";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

const BAR_WIDTH_FULL = 20;
const BAR_WIDTH_HALF = 10;

function bar(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  trendbar: Trendbar
) {
  const color = "rgb(117, 227, 66)";
  const x = 110;
  svg
    .append("rect")
    .attr("x", x - BAR_WIDTH_HALF)
    .attr("y", trendbar.open)
    .attr("width", BAR_WIDTH_FULL)
    .attr("height", trendbar.close)
    .attr("style", `fill: ${color}`);
  svg
    .append("line")
    .attr("x1", x)
    .attr("y1", trendbar.high)
    .attr("x2", x)
    .attr("y2", trendbar.low)
    .attr("style", `stroke: ${color}; stroke-width: 2`);
}

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);

const body = d3.select(dom.window.document.querySelector("body"));
const svg = body
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
  close: 22,
  volume: 1,
  period: ProtoOATrendbarPeriod.D1,
  timestamp: Date.now(),
};
bar(svg, trendbar);

fs.writeFileSync("out.svg", body.html());
