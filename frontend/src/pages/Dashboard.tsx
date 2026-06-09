import React, { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { QueryInterface } from '../components/QueryInterface'
import { GraphViewer } from '../components/GraphViewer'
import { DocumentUpload } from '../components/DocumentUpload'
import { IngestionStatus } from '../components/IngestionStatus'
import { DemoBanner } from '../components/DemoBanner'
import { api } from '../lib/api'
import { KGDocument, IngestionJob, GraphNode, GraphEdge } from '../types'
import { DEMO_DOCUMENT, DEMO_GRAPH_DATA } from '../lib/mockData'

export const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<KGDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(localStorage.getItem('demo_mode') === 'true')
  const [showUpload, setShowUpload] = useState(false)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  
  // Graph state (can be populated from query results or initial fetch)
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], edges: GraphEdge[] }>(
    localStorage.getItem('demo_mode') === 'true' ? (DEMO_GRAPH_DATA as any) : { nodes: [], edges: [] }
  )

  useEffect(() => {
    const init = async () => {
      const health = await api.health()
      if (!health.success || localStorage.getItem('demo_mode') === 'true') {
         setIsDemo(true)
         setDocuments([DEMO_DOCUMENT as any])
         setGraphData(DEMO_GRAPH_DATA as any)
         setLoading(false)
      } else {
         fetchDocuments()
      }
    }
    init()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    const response = await api.documents.list()
    if (response.success) setDocuments(response.data || [])
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-[#05070A] text-white font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Header Section */}
        <header className="h-24 px-10 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-xl shrink-0">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Live Workspace</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
             </div>
             <h2 className="text-2xl font-black tracking-tight">Enterprise Retrieval Engine</h2>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowUpload(true)}
                className="h-12 px-8 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
             >
                Upload Corpus
             </button>
             <button className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </button>
          </div>
        </header>

        {isDemo && <DemoBanner />}

        {/* Dynamic Split Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Query & Results Side */}
          <section className="flex-1 flex flex-col border-r border-white/5">
            <QueryInterface />
          </section>

          {/* Context & Graph Side */}
          <aside className="w-[500px] flex flex-col bg-slate-900/10 shrink-0">
            <div className="h-1/2 border-b border-white/5 flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Relational Vista</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400">Interactive D3 Engine</span>
              </div>
              <div className="flex-1 relative">
                <GraphViewer nodes={graphData.nodes} edges={graphData.edges} />
              </div>
            </div>

            <div className="h-1/2 flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Pipeline Status</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  {activeJobId ? `Job ID: ${activeJobId.slice(0, 8)}...` : 'Orchestrator Ready'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {activeJobId ? (
                  <IngestionStatus jobId={activeJobId} onComplete={() => {setActiveJobId(null); fetchDocuments()}} />
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-white">Known Documents</span>
                        <span className="text-[10px] font-bold text-slate-500">{documents.length} NODES</span>
                    </div>
                    <div className="space-y-2">
                        {documents.slice(0, 5).map(doc => (
                            <div key={doc.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📄</span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{doc.name}</p>
                                        <p className="text-[9px] text-slate-500">{(doc.size_bytes / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                            </div>
                        ))}
                        {documents.length === 0 && !loading && (
                          <div className="py-12 text-center opacity-20 capitalize text-[10px] font-black tracking-widest">
                            No knowledge nodes detected.
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Global Overlays */}
        {showUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#05070A]/80 backdrop-blur-2xl transition-all animate-in fade-in duration-300">
            <div className="w-full max-w-2xl p-1 bg-gradient-to-br from-amber-500/20 to-transparent rounded-[32px]">
              <div className="p-12 rounded-[31px] bg-[#0A0F1E] border border-white/5 relative shadow-2xl">
                <button 
                  onClick={() => setShowUpload(false)}
                  className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <DocumentUpload 
                  onUploadStarted={(jobId) => {setActiveJobId(jobId); setShowUpload(false)}} 
                  onUploadError={(err) => alert(err)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
