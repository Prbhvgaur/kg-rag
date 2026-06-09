import React, { useState, useRef, useEffect } from 'react'
import { colors } from '../lib/design'
import { QueryResult } from '../types'
import { useQuery } from '../hooks/useQuery'

export const QueryInterface: React.FC = () => {
  const [question, setQuestion] = useState('')
  const { ask, result, loading, error } = useQuery()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const chips = [
    "What are the main entities?",
    "Summarize the key relationships",
    "List the critical findings"
  ]

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!question.trim() || loading) return
    ask(question)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [question])

  return (
    <div className="flex flex-col h-full bg-slate-950/20">
      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        {!result && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-4xl mb-6 shadow-2xl">🔍</div>
            <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Awaiting Analysis</h2>
            <p className="text-sm font-medium text-slate-500 max-w-sm">The Knowledge Graph is ready to traverse your KGDocument nodes and retrieve grounded context.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-8 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20" />
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded-full w-1/3" />
              <div className="h-4 bg-white/5 rounded-full w-full" />
              <div className="h-4 bg-white/5 rounded-full w-full" />
              <div className="h-4 bg-white/5 rounded-full w-2/3" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Synthesized Answer</span>
              <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <p className="text-xl text-slate-200 leading-[1.6] font-medium">{result.answer}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Grounded Sources</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {result.sources.map((source, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group">
                    <p className="text-sm text-slate-400 italic leading-relaxed mb-4">"...{source.text}..."</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-[9px] font-black text-amber-500 uppercase tracking-widest">Chunk {source.chunk_index}</span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{source.document_name}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Index Match: {(source.score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.graph_path && result.graph_path.length > 0 && (
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Knowledge Cross-Reference</span>
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 overflow-x-auto">
                    <div className="flex items-center gap-4 min-w-max">
                    {result.graph_path.map((edge, i) => (
                        <React.Fragment key={i}>
                        <div className="flex flex-col items-center">
                            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                                {edge.from}
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-40">
                             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">[{edge.relation}]</span>
                             <div className="w-12 h-px bg-amber-500/50" />
                        </div>
                        {i === result.graph_path!.length - 1 && (
                            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                            {edge.to}
                            </span>
                        )}
                        </React.Fragment>
                    ))}
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {chips.map(chip => (
            <button 
              key={chip}
              onClick={() => setQuestion(chip)}
              className="whitespace-nowrap px-4 py-2 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur-xl transition duration-700"></div>
          <textarea
            ref={textareaRef}
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Interrogate the graph..."
            className="relative w-full bg-slate-900/80 border border-white/10 rounded-2xl py-5 pl-6 pr-20 focus:outline-none focus:border-amber-500/50 transition-all resize-none text-white font-medium text-sm shadow-2xl"
          />
          <button 
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-3 bottom-2.5 w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-black shadow-xl disabled:opacity-20 transition-all hover:scale-105 active:scale-95 z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  )
}
