import React from 'react'
import { Link } from 'react-router-dom'
import { colors } from '../lib/design'
import { PipelineDiagram } from '../components/PipelineDiagram'
import { Navbar } from '../components/Navbar'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative z-10" style={{ backgroundColor: 'transparent' }}>
      <Navbar />
      
      <main className="flex-1">
        {/* Decorative Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[160px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-[600px] right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

        {/* Hero Section */}
        <section className="px-8 pt-32 pb-32 text-center relative overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">v1.0.0 Now Live for Production</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tight leading-[0.85] text-white animate-in fade-in slide-in-from-bottom-8 duration-1000">
              THE FUTURE OF <br />
              <span className="text-amber-500">KNOWLEDGE</span> RAG.
            </h1>
            
            <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              Ask complex questions. Get grounded, citation-backed answers powered by a 
              <span className="text-white"> Knowledge Graph + Vector</span> hybrid retrieval pipeline.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Link 
                to="/dashboard"
                onClick={() => localStorage.setItem('demo_mode', 'true')}
                className="px-12 py-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(245,158,11,0.3)] bg-amber-500 text-black hover:bg-amber-400"
              >
                Launch Demo API →
              </Link>
              <a 
                href="https://github.com/Prbhvgaur/kg-rag" 
                target="_blank" 
                rel="noreferrer"
                className="px-12 py-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 transition-all hover:bg-white/5 active:scale-95 text-white"
              >
                View Repository
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-8 py-32 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard 
                icon="🧠"
                title="Knowledge Graph"
                description="We don't just embed. We extract entities, map relationships, and traverse the graph at query time to find context others miss."
              />
              <FeatureCard 
                icon="🔍"
                title="Hybrid Retrieval"
                description="Cosine similarity finds semantically close chunks. BFS traversal finds connected facts. Both combined = 100% grounded answers."
              />
              <FeatureCard 
                icon="📄"
                title="Source Citations"
                description="Every answer references the exact source chunk it came from. No hallucination. No guessing. Just facts with proof."
              />
            </div>
          </div>
        </section>

        {/* Pipeline Section */}
        <section className="px-8 py-40 border-y border-white/5 relative bg-slate-950/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Pipeline Visualization</span>
              <h3 className="text-5xl font-black text-white">Institutional-Grade Architecture</h3>
            </div>
            <PipelineDiagram />
          </div>
        </section>
      </main>

      <footer className="px-8 py-20 text-center relative z-10 mt-20 border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 mb-8">
          Engineered by <span className="text-white">Prabhav Gaur</span>
        </p>
        <div className="flex justify-center gap-10">
          {['GitHub', 'LinkedIn', 'X.com', 'Documentation'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}

const FeatureCard: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="p-12 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-amber-500/30 transition-all duration-700 group hover:-translate-y-2">
    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-3xl mb-10 group-hover:scale-110 transition-transform duration-700">{icon}</div>
    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed font-medium text-sm">{description}</p>
  </div>
)
