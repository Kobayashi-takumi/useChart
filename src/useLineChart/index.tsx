import React from "react"
import * as d3 from "d3"

export const useLineChart = (props: { entryPoint: string }) => {
  const { entryPoint } = props
  const width = 500
  const height = 250
  const padding = 30
  const dataset = [
    {
      date: "2019/1/1",
      value: 70,
    },
    {
      date: "2019/1/2",
      value: 70,
    },
    {
      date: "2019/1/3",
      value: 70,
    },
    {
      date: "2019/1/4",
      value: 70,
    },
    {
      date: "2019/1/5",
      value: 70,
    },
    {
      date: "2019/1/6",
      value: 70,
    },
  ]
  const drawChart = () => {
    const _dataset = dataset.map((d) => {
      return { label: d.date, value: d.value }
    })
    const svg = d3
      .select(entryPoint)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
    const minValue = d3.min(_dataset, (d) => d.value)
    const maxValue = d3.max(_dataset, (d) => d.value)
    const yScale = d3
      .scaleLinear()
      .domain([minValue > 0 ? 0 : minValue, maxValue])
      .range([height - padding, padding])
    const yAxis = svg.append("g").call(d3.axisLeft(yScale))
    const yAxisWidth = yAxis.node().getBBox().width
    const xScale = d3
      .scaleBand()
      .domain(_dataset.map((d) => d.label))
      .range([yAxisWidth, width])
    const xAxis = svg.append("g").call(d3.axisBottom(xScale))
    yAxis.attr("transform", `translate(${yAxisWidth}, ${0})`)
    xAxis.attr("transform", `translate(${0}, ${height - padding})`)
    // const line = d3.line().defined(d => d.value).x((d,i ) => xScale(d[i].label))
    // const path = svg.append("path").datum(_dataset)
  }
  return drawChart
}
