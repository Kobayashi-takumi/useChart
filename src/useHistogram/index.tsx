import React, { useState } from "react"
import * as d3 from "d3"
import { get, isArray } from "lodash"

export const useHistogram = (props: {
  entryPoint: string
  dataset: Array<{ label: string; volume: number }>
  title?: string
  className?: string
  option?: {
    width?: number
    height?: number
    padding?: number | Array<number>
    max_bar_width?: number
    notTooltip?: boolean
    label_rotate?: {
      rotate?: number
      x?: number
      y?: number
    }
    y_axsis_label?: string
    y_ticks?: number
  }
}) => {
  const [_svg, setSvg] = useState<d3.Selection<
    SVGSVGElement,
    unknown,
    HTMLElement,
    any
  > | null>(null)
  const [_tooltip, setTooltip] = useState<d3.Selection<
    HTMLDivElement,
    unknown,
    HTMLElement,
    any
  > | null>(null)
  const defaultPadding = 30
  const getPadding = (data: number | Array<number>): Array<number> => {
    if (typeof data === "number") return [data, data, data, data]
    if (isArray(data) && data.length === 1)
      return [data[0], data[0], data[0], data[0]]
    if (isArray(data) && data.length === 2)
      return [data[0], data[1], data[0], data[1]]
    if (isArray(data) && data.length === 3)
      return [data[0], data[1], data[2], 0]
    if (isArray(data) && data.length === 4)
      return [data[0], data[1], data[2], data[3]]
    return [defaultPadding, defaultPadding, defaultPadding, defaultPadding]
  }
  const { entryPoint, dataset, title, className, option } = props
  const width = get(option, "width") || 300
  const height = get(option, "height") || 300
  const [padding_top, padding_right, padding_bottom, padding_left] = getPadding(
    get(option, "padding")
  )
  const max_bar_width = get(option, "max_bar_width") || 30
  const rotate = get(option, ["label_rotate", "rotate"], 0)
  const x = get(option, ["label_rotate", "x"], 0)
  const y = get(option, ["label_rotate", "y"], 0)
  const notTooltip = get(option, "notTooltip", false)

  const drawChart = () => {
    if (_svg) {
      _svg.remove()
      _tooltip.remove()
    }
    const tooltip = d3.select(entryPoint).append("div").classed("tooltip", true)
    const svg = d3
      .select(entryPoint)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .classed("histogram-area", true)
    if (className) svg.classed(className, true)
    setSvg(svg)
    setTooltip(tooltip)

    const [minValue, maxValue] = d3.extent(dataset, (d) => d.volume)
    const graphHeight = height - padding_bottom

    // Y軸
    const yScale = d3
      .scaleLinear()
      .range([graphHeight, padding_top])
      .domain([minValue < 0 ? minValue : 0, maxValue > 0 ? maxValue : 0])
    const _yAxis = d3.axisLeft(yScale)
    if (get(option, "y_ticks")) _yAxis.ticks(get(option, "y_ticks"))
    const yAxis = svg.append("g").call(_yAxis)

    // y軸のwidth
    const yAxisWidth = !padding_left
      ? yAxis.node().getBBox().width
      : padding_left

    // X軸
    const xScale = d3
      .scaleBand()
      .rangeRound([yAxisWidth, width - padding_right])
      .padding(0.2)
      .domain(
        dataset.map((d) => {
          return d.label
        })
      )
    const xAxis = svg.append("g").call(d3.axisBottom(xScale))

    // メモリの位置情報
    xAxis
      .attr("transform", `translate(0, ${height - padding_bottom})`)
      .classed("x-axis", true)
    yAxis
      .attr("transform", `translate(${yAxisWidth}, 0)`)
      .classed("y-axis", true)

    if (rotate)
      svg
        .selectAll(".x-axis text")
        .attr("transform", `translate(${x}, ${y})rotate(${rotate})`)

    // barのwidth。
    // 設定した最大値より大きい場合、設定した最大値を使用。
    const barWidth =
      xScale.bandwidth() <= max_bar_width ? xScale.bandwidth() : max_bar_width

    const mouseOverEvent = (d: any) => {
      tooltip
        .html(`<div><span>${d.name}</span><span>${d.volume}</span></div>`)
        .style("top", `${d3.event.pageY + 5}px`)
        .style("left", `${d3.event.pageX + 5}px`)
        .style("visibility", "visible")
    }
    const mouseOutEvent = () => {
      tooltip.style("visibility", "hidden")
    }

    const rect = svg
      .append("g")
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", (d) => {
        // x座標は、xScaleを使用して求める。
        // その際に、xScalegが設定したbarの最大値より大きい場合、xScaleで求めた位置から右に、「　xScale.bandwidth()の半分 - 設定した最大値の半分　」をずらすことで中心になる。
        if (barWidth === max_bar_width)
          return xScale(d.label) + xScale.bandwidth() / 2 - max_bar_width / 2
        return xScale(d.label)
      })
      .attr("y", (d) => {
        //   y軸は値が0以下なら0を始点に、描画を始める。
        // +1しているのは、stroke分が0のラインと重なって見えるため。
        if (d.volume > 0) return yScale(d.volume)
        return yScale(0) + 1
      })
      .attr("width", (d) => barWidth)
      .attr("class", (d) => {
        if (d.volume < 0) return "down"
        return "up"
      })
      .classed("bar-chart-data", true)

    //   hover & ツールチップ関係を追加している。
    if (!notTooltip)
      rect
        .on("mousemove", (d, i, node) => {
          const targetRect = d3.select(node[i])
          targetRect.classed("hover", true)
          mouseOverEvent(d)
        })
        .on("mouseout", (d, i, node) => {
          const targetRect = d3.select(node[i])
          targetRect.classed("hover", false)
          mouseOutEvent()
        })

    // マイナスがある場合、0の位置が一番下でなくなるため、チャート内にラインを引く。
    if (minValue < 0) {
      svg
        .append("line")
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("x1", yAxisWidth)
        .attr("x2", width - padding_right)
        .classed("zero-line", true)
    }

    if (title) {
      const text = svg.append("text").text(title)
      const textWidth = text.node().getBBox().width
      const textHeight = text.node().getBBox().height
      // ラベルの位置は、グラフ部分の中央にしている。
      // （全体のwidth - y軸ラベル領域　-　右のpadding分）/　2　←　グラフ部分のサイズ
      // 　textWidth / 2 ←　始点をラベルの半分の領域分ずらすことで、ラベルの中央が、グラフの中央に一致するようにしている。
      // yAxisWidth　←　+することで、y軸のラベル分し始点をずらすことで、グラフの中央値が得られる。
      // width / 2 - textWidth / 2 ←　これにすることで、グラフ全体の中央（ｙ軸含めた）にラベルが配置されるようになる。
      text
        .attr(
          "transform",
          `translate(${
            (width - yAxisWidth - padding_right) / 2 -
            textWidth / 2 +
            yAxisWidth
          }, ${padding_top / 2})`
        )
        .classed("title", true)
    }

    if (get(option, "y_axsis_label")) {
      svg
        .append("text")
        .text(get(option, "y_axsis_label"))
        .classed("y_axsis_label", true)
        .attr(
          "transform",
          `translate(${yAxisWidth + 4}, ${padding_top})rotate(90)`
        )
    }

    // 高さ　＆　アニメーション
    rect
      .attr("height", 0)
      .attr("transform", (d) => {
        let y = Math.abs(yScale(0) - yScale(d.volume))
        return `translate(0, ${y || 0})`
      })
      .transition()
      .delay((d, i) => {
        return i * 100
      })
      .duration(700)
      .ease(d3.easeExpInOut)
      .attr("height", (d) => {
        // 高さは、マイナスがあるので、絶対値 - 0の位置　をyScaleに渡して計算。
        if (d.volume < 0 && d.volume === minValue)
          return Math.abs(yScale(d.volume || 0) - yScale(0)) - 3
        return Math.abs(yScale(d.volume || 0) - yScale(0))
      })
      .attr("transform", function (d) {
        // アニメーションは、下から上に行われるので、プラスの場合はy軸にtranslateを与える。
        if (d.volume < 0) return
        return `translate(0, 0)`
      })
  }

  return drawChart
}
