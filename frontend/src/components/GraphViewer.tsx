import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { colors } from '../lib/design'
import { GraphNode, GraphEdge } from '../types'

export interface GraphViewerProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const GraphViewer: React.FC<GraphViewerProps> = ({ nodes, edges }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    // Force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges as any).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))

    // Drag behavior
    const drag = d3.drag<any, any>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', colors.border.default)
      .attr('stroke-width', 1)

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(drag)

    node.append('circle')
      .attr('r', (d) => 12)
      .attr('fill', (d) => colors.graph[d.type as keyof typeof colors.graph] || colors.accent.gold)
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 2)

    node.append('text')
      .text((d) => d.label)
      .attr('x', 16)
      .attr('y', 4)
      .attr('fill', colors.text.secondary)
      .style('font-size', '10px')
      .style('font-weight', '600')

    // Simulation updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // Zoom/Pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    return () => {
      simulation.stop()
    }
  }, [nodes, edges])

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950/50 rounded-3xl border border-white/5">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      <div className="absolute bottom-4 left-4 flex gap-4">
        {Object.entries(colors.graph).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
