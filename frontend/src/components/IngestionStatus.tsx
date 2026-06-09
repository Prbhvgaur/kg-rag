import React, { useEffect, useState } from 'react'
import { colors } from '../lib/design'
import { IngestionJob, StepStatus } from '../types'
import { api } from '../lib/api'

interface IngestionStatusProps {
  jobId: string
  onComplete: () => void
}

export const IngestionStatus: React.FC<IngestionStatusProps> = ({ jobId, onComplete }) => {
  const [job, setJob] = useState<IngestionJob | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const poll = async () => {
      const response = await api.jobs.status(jobId)
      if (response.success && response.data) {
        setJob(response.data)
        if (response.data.status === 'complete') {
          clearInterval(interval)
          setTimeout(onComplete, 2000)
        } else if (response.data.status === 'error') {
          clearInterval(interval)
        }
      }
    }

    poll()
    interval = setInterval(poll, 2000)

    return () => clearInterval(interval)
  }, [jobId, onComplete])

  if (!job) return null

  const steps = [
    { key: 'pdf_extraction', label: 'PDF Extracted' },
    { key: 'chunking', label: 'Chunking' },
    { key: 'ner_embedding', label: 'NER + Embedding' },
    { key: 'graph_storage', label: 'Graph Built' },
    { key: 'vector_indexing', label: 'Vector Indexing' },
  ]

  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: colors.bg.secondary, borderColor: colors.border.default }}>
      <h3 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: colors.text.muted }}>
        Ingestion Pipeline
      </h3>

      <div className="space-y-4">
        {steps.map((step) => {
          const status = job.steps[step.key as keyof typeof job.steps] as StepStatus
          return (
            <div key={step.key} className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>{step.label}</span>
              <StatusBadge status={status} />
            </div>
          )
        })}
      </div>

      {job.status === 'complete' && job.result && (
        <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-sm font-bold text-green-500">Pipeline Complete!</p>
          <p className="text-xs text-green-500/70 mt-1">
            {job.result.chunk_count} chunks indexed • {job.result.entity_count} entities extracted
          </p>
        </div>
      )}

      {job.status === 'error' && (
        <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-sm font-bold text-red-500">Pipeline Failed</p>
          <p className="text-xs text-red-500/70 mt-1">{job.error}</p>
        </div>
      )}
    </div>
  )
}

const StatusBadge: React.FC<{ status: StepStatus }> = ({ status }) => {
  switch (status) {
    case 'complete':
      return <span className="text-xs font-bold text-green-500">✓ Done</span>
    case 'in_progress':
      return (
        <span className="flex items-center gap-2 text-xs font-bold text-amber-500">
          <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Running
        </span>
      )
    case 'error':
      return <span className="text-xs font-bold text-red-500">✕ Failed</span>
    default:
      return <span className="text-xs font-bold text-slate-500">○ Pending</span>
  }
}
