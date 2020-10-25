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

  const xScale = 200;
  const [min, max] = price.domain();
  svg
    .append("line")
    .attr("x1", xScale)
    .attr("y1", price(min) || -100)
    .attr("x2", xScale)
    .attr("y2", price(max) || -100)
    .attr("style", `stroke: rgb(0,0,0); stroke-width: 2`);
  svg
    .append("line")
    .attr("x1", xScale - BAR_WIDTH_HALF)
    .attr("y1", price(min) || -100)
    .attr("x2", xScale)
    .attr("y2", price(min) || -100)
    .attr("style", `stroke: rgb(0,0,0); stroke-width: 2`);
  svg
    .append("line")
    .attr("x1", xScale - BAR_WIDTH_HALF)
    .attr("y1", price(max) || -100)
    .attr("x2", xScale)
    .attr("y2", price(max) || -100)
    .attr("style", `stroke: rgb(0,0,0); stroke-width: 2`);
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

// based on https://observablehq.com/@d3/candlestick-chart
async function main() {
  const height = 600;
  const width = 400;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };

  const parseDate = d3.utcParse("%Y-%m-%d");
  const csvData = await fs.promises.readFile("aapl-2.csv");
  const data = d3
    .csvParse(csvData.toString(), (d) => {
      const date = parseDate(d["Date"] || "") || new Date();
      return {
        date,
        high: d["High"] || "",
        low: d["Low"] || "",
        open: d["Open"] || "",
        close: d["Close"] || "",
      };
    })
    .slice(-120);
  console.log(data);

  const formatChange = (() => {
    const f = d3.format("+.2%");
    return (y0: number, y1: number) => f((y1 - y0) / y0);
  })();
  const formatValue = d3.format(".2f");
  const formatDate = d3.utcFormat("%B %-d, %Y");

  const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickFormat(d3.format("$~f"))
          .tickValues(d3.scaleLinear().domain(y.domain()).ticks())
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("stroke-opacity", 0.2)
          .attr("x2", width - margin.left - margin.right)
      )
      .call((g) => g.select(".domain").remove());

  const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(
            d3.utcMonday
              .every(width > 720 ? 1 : 2)
              .range(data[0].date, data[data.length - 1].date)
          )
          .tickFormat(d3.utcFormat("%-m/%-d"))
      )
      .call((g) => g.select(".domain").remove());

  const y = d3
    .scaleLog()
    .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
    .rangeRound([height - margin.bottom, margin.top]);

  const x = d3
    .scaleBand()
    .domain(
      d3.utcDay
        .range(data[0].date, +data[data.length - 1].date + 1)
        .filter((d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6)
    )
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const chart = (() => {
    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

    const g = svg
      .append("g")
      .attr("stroke-linecap", "round")
      .attr("stroke", "black")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", (d) => `translate(${x(d.date)},0)`);

    g.append("line")
      .attr("y1", (d) => y(d.low))
      .attr("y2", (d) => y(d.high));

    g.append("line")
      .attr("y1", (d) => y(d.open))
      .attr("y2", (d) => y(d.close))
      .attr("stroke-width", x.bandwidth())
      .attr("stroke", (d) =>
        d.open > d.close
          ? d3.schemeSet1[0]
          : d.close > d.open
          ? d3.schemeSet1[2]
          : d3.schemeSet1[8]
      );

    g.append("title").text(
      (d) => `${formatDate(d.date)}
    Open: ${formatValue(d.open)}
    Close: ${formatValue(d.close)} (${formatChange(d.open, d.close)})
    Low: ${formatValue(d.low)}
    High: ${formatValue(d.high)}`
    );

    return svg.node();
  })();
}
main();
