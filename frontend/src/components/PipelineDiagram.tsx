import React from 'react'
import { colors } from '../lib/design'

export const PipelineDiagram: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <svg viewBox="0 0 800 200" className="w-full h-auto">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.accent.gold} stopOpacity="0" />
            <stop offset="50%" stopColor={colors.accent.gold} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.accent.gold} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connections with animated dash offset */}
        <g stroke={colors.border.default} strokeWidth="2" fill="none">
          <path d="M100 100 L200 100" />
          <path d="M250 100 L350 100" />
          <path d="M400 100 L500 100" />
          <path d="M550 100 L650 100" />
        </g>

        {/* Animated flow */}
        <g stroke={colors.accent.gold} strokeWidth="2" fill="none" strokeDasharray="10 20">
          <path d="M100 100 L200 100">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M250 100 L350 100">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M400 100 L500 100">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M550 100 L650 100">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Nodes */}
        {[
          { x: 100, label: 'PDF', icon: '📄' },
          { x: 225, label: 'Chunks', icon: '✂️' },
          { x: 375, label: 'NER + Embed', icon: '🧠' },
          { x: 525, label: 'Graph + Vector', icon: '🕸️' },
          { x: 675, label: 'Answer', icon: '✨' },
        ].map((node, i) => (
          <g key={i}>
            <circle 
              cx={node.x} cy="100" r="30" 
              fill={colors.bg.secondary} 
              stroke={colors.border.accent} 
              strokeWidth="2"
              filter="url(#glow)"
            >
              <animate attributeName="r" values="30;32;30" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x={node.x} y="105" textAnchor="middle" fontSize="20">{node.icon}</text>
            <text x={node.x} y="150" textAnchor="middle" fill={colors.text.secondary} fontSize="12" fontWeight="bold">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
