import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import { set } from "lodash"

export type dataset = Array<{
  x: number
  y: number
  r: number
  label: string
}>

export const useBubbleChart = (props: {
  dataset: dataset
  entryPoint: string
}) => {
  const { entryPoint } = props
  const [_svg, setSvg] = useState<d3.Selection<
    SVGSVGElement,
    unknown,
    HTMLElement,
    any
  > | null>(null)
  const [dataset, setDataset] = useState(props.dataset)
  const width = 500
  const height = 500

  const drawChart = () => {
    const svg = d3
      .select(entryPoint)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    setSvg(svg)

    const node = d3
      .select("svg")
      .selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("r", (d) => {
        return d.r * 10
      })
      .classed("bubble", true)

    const simulation = d3
      .forceSimulation()
      .force(
        "collide",
        d3
          .forceCollide<any>()
          .radius((d) => {
            return d.r * 10
          })
          .strength(1.0)
          .iterations(50)
      )
      .force("charge", d3.forceManyBody().strength(5))
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x(width / 2)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y(height / 2)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))

    simulation.nodes(dataset).on("tick", () => {
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)
    })

    const dragStarted = (d: any) => {
      if (!d3.event.active) simulation.alpha(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    const dragged = (d: any) => {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    const dragEnded = (d: any) => {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
    const dragEvnet = d3
      .drag<any, any>()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
    node.call(dragEvnet)

    node.on("click", (d, i) => {
      let _r = d.r
      if (_r <= 5) _r++
      if (_r >= 6) _r = 1
      const data = set(dataset, [i, "r"], _r)
      svg
        .selectAll("circle")
        .data(dataset)
        .attr("r", (d) => {
          return d.r * 10
        })
        .classed("bubble", true)

      simulation.nodes(dataset).on("tick", () => {
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)
      })
    })

    const tooltip = d3.select(entryPoint).append("div").classed("tooltip", true)

    const mouseOverEvent = (d: any) => {
      tooltip
        .html(`<div><span>${d.label}</span><span>${d.r}</span></div>`)
        .style("top", `${d3.event.pageY + 5}px`)
        .style("left", `${d3.event.pageX + 5}px`)
        .style("visibility", "visible")
        .style("z-index", 99999)
    }
    const mouseOutEvent = () => {
      tooltip.style("visibility", "hidden").style("z-index", 0)
    }

    node
      .on("mousemove", (d, i, n) => {
        const target = d3.select(n[i])
        target.classed("hover", true)
        mouseOverEvent(d)
      })
      .on("mouseout", (d, i, n) => {
        const target = d3.select(n[i])
        target.classed("hover", false)
        mouseOutEvent()
      })
  }

  return drawChart
}
