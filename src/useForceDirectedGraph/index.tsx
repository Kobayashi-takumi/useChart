import React from "react"
import * as d3 from "d3"

const useForceDirectedGraph = () => {
  const dataset = {
    nodes: [
      {
        id: 0,
        group: "Cited Works",
        radius: 2,
        citing_patents_count: 2,
      },
      {
        id: 1,
        group: "Cited Works",
        radius: 2,
        citing_patents_count: 2,
      },
      {
        id: 2,
        group: "Cited Works",
        radius: 2,
        citing_patents_count: 2,
      },
    ],
    links: [
      {
        source: 0,
        target: "109-294-662-661-65X",
        value: 2,
      },
      {
        source: 0,
        target: "074-937-457-594-345",
        value: 2,
      },
    ],
  }

  const drawChart = () => {}
}
