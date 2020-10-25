import { JSDOM } from "jsdom";
import * as d3 from "d3";
import fs from "fs";

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);

const body = d3.select(dom.window.document.querySelector("body"));
const svg = body
  .append("svg")
  .attr("width", 100)
  .attr("height", 100)
  .attr("xmlns", "http://www.w3.org/2000/svg");
svg
  .append("rect")
  .attr("x", 10)
  .attr("y", 10)
  .attr("width", 80)
  .attr("height", 80)
  .style("fill", "orange");

fs.writeFileSync("out.svg", body.html());