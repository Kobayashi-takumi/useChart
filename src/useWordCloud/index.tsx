import React from "react"
import * as d3 from "d3"
import d3Cloud from "d3-cloud"
import { get } from "lodash"

export const useWordCloud = (props: {
  entryPoint: string
  option?: { width?: number; height?: number }
}) => {
  const { entryPoint, option } = props
  const width = get(option, "width", 500)
  const height = get(option, "height", 500)
  const dataset = [
    { word: "aaaa", count: 9 },
    { word: "bbbb", count: 3 },
    { word: "cccc", count: 2 },
    { word: "dddd", count: 9 },
    { word: "eeee", count: 6 },
    { word: "ffff", count: 4 },
    { word: "gggg", count: 2 },
    { word: "hhhh", count: 8 },
    { word: "aaaa", count: 9 },
    { word: "bbbb", count: 3 },
    { word: "cccc", count: 2 },
    { word: "dddd", count: 9 },
    { word: "eeee", count: 6 },
    { word: "ffff", count: 4 },
    { word: "gggg", count: 2 },
    { word: "hhhh", count: 1 },
  ]

  const drawChart = () => {
    const random = d3.randomIrwinHall(2)
    const countMax = d3.max(dataset, (d) => d.count)
    const sizeScale = d3.scaleLinear().domain([0, countMax]).range([10, 100])
    const words = dataset.map((d) => {
      return {
        text: d.word,
        size: sizeScale(d.count),
      }
    })

    const draw = (_words: any) => {
      const svg = d3
        .select(entryPoint)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
      const texts = svg
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("text")
        .data(_words)
        .enter()
        .append("text")
        .style("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .text((d: any) => {
          return d.text
        })
        .attr(
          "transform",
          (d: any) => `translate(${d.x}, ${d.y})rotate(${d.rotate})`
        )
      texts
        .style("font-size", (d: any) => {
          return "0px"
        })
        .transition()
        .duration(500)
        .ease(d3.easeSinInOut)
        .style("font-size", (d: any) => {
          return `${d.size}px`
        })
    }

    d3Cloud()
      .size([width, height])
      .words(words)
      .rotate(() => {
        return (~~(Math.random() * 6) - 3) * 30
      })
      .font("Impact")
      .fontSize((d) => d.size)
      .on("end", draw)
      .start()
  }

  return drawChart
}
