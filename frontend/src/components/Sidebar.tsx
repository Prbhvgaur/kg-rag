import React from 'react'
import { useAuthContext } from '../contexts/AuthContext'

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthContext()

  const menuItems = [
    { label: 'Intelligence', icon: '🧠', active: true },
    { label: 'Repositories', icon: '📁' },
    { label: 'Analytics', icon: '📊' },
    { label: 'Nodes', icon: '🌐' },
    { label: 'Settings', icon: '⚙️' }
  ]

  return (
    <aside className="w-72 border-r border-white/5 flex flex-col h-full bg-[#05070A] relative z-20">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5 relative z-10">
         <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-0.5">Knowledge Graph</span>
            <h1 className="text-xl font-black text-white tracking-tighter">KG<span className="text-amber-500">-RAG</span></h1>
         </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 relative z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 block mb-6 ml-2">Enterprise Menu</span>
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              item.active 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className={`text-lg transition-transform duration-500 ${item.active ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest leading-none">
              {item.label}
            </span>
            {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
          </button>
        ))}
      </nav>

      {/* User Session Section */}
      <div className="p-6 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-4 p-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-sm">
                {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{user?.email}</p>
            </div>
            <button 
                onClick={signOut}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        </div>
      </div>
    </aside>
  )
}
