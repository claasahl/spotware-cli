import { JSDOM } from "jsdom";
import * as d3 from "d3";
import fs from "fs";

import { Trendbar } from "../utils";

function bar(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  trendbar?: Trendbar
) {
  const color = "rgb(117, 227, 66)";
  svg
    .append("rect")
    .attr("x", 100)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 80)
    .attr("style", `fill: ${color}`);
  svg
    .append("line")
    .attr("x1", 110)
    .attr("y1", 5)
    .attr("x2", 110)
    .attr("y2", 95)
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

bar(svg);

fs.writeFileSync("out.svg", body.html());
