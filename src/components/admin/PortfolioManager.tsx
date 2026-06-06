import React, { useState, useEffect } from 'react';
import { getPortfolioItems, savePortfolioItem, deletePortfolioItem } from '../../lib/firebase';
import { PortfolioItem } from '../../types';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Camera, Sparkles, Sliders } from 'lucide-react';
import { motion } from 'motion/react';

export default function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form coordinates
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newMode, setNewMode] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Default empty shell
  const emptyItem = (): PortfolioItem => ({
    id: `p-${Date.now()}`,
    title: '',
    category: 'Brand Collaboration',
    client: '',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
    year: String(new Date().getFullYear()),
    impact: 'Views Pending',
    shutter: '1/50 sec',
    iso: 'ISO 400',
    aperture: 'f/1.4'
  });

  async function load() {
    setLoading(true);
    try {
      const res = await getPortfolioItems();
      setItems(res);
    } catch (_) {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleEditClick = (item: PortfolioItem) => {
    setEditingItem({
      ...item,
      shutter: item.shutter || '1/50 sec',
      iso: item.iso || 'ISO 400',
      aperture: item.aperture || 'f/1.4'
    });
    setNewMode(false);
    setMsg(null);
  };

  const handleCreateNewClick = () => {
    setEditingItem(emptyItem());
    setNewMode(true);
    setMsg(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to absolute delete frame campaign: "${name}"?`)) {
      try {
        await deletePortfolioItem(id);
        setMsg({ type: 'success', text: `Frame campaign "${name}" successfully deleted.` });
        load();
        setEditingItem(null);
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'Operation failed.' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title || !editingItem.client || !editingItem.imageUrl) {
      setMsg({ type: 'error', text: 'Please fill out required title, client, and photographic streams.' });
      return;
    }

    try {
      await savePortfolioItem(editingItem);
      setMsg({ type: 'success', text: `Frame campaign "${editingItem.title}" saved and synched!` });
      load();
      setEditingItem(null);
      setNewMode(false);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Operation failed.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-zinc-500 font-mono text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-white" />RETRIVING CASE ENTRIES...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-serif text-white tracking-tight">Active Portfolio Registry</h3>
          <p className="text-xs text-zinc-500 font-mono tracking-wide mt-1">
            Build, edit, or adjust showcased film campaigns and editorial projects.
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={handleCreateNewClick}
            className="bg-[#00a884] hover:bg-[#00bfa5] text-black py-2.5 px-5 font-mono text-[10px] tracking-widest uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer rounded-none"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5px]" /> Register Case Frame
          </button>
        )}
      </div>

      {msg && (
        <div className={`p-3 text-xs font-mono border ${
          msg.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-200' 
            : 'bg-red-950/40 border-red-900/50 text-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {editingItem ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0e0e11] border border-white/10 p-6 md:p-8"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#00a884]" />
              <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                {newMode ? "Initialize New Project Concept" : `Edit Frame: ${editingItem.title}`}
              </h4>
            </div>
            <button 
              onClick={() => { setEditingItem(null); setNewMode(false); }} 
              className="text-zinc-500 hover:text-white flex items-center gap-1 text-[10px] uppercase font-mono cursor-pointer"
            >
              Cancel <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Inputs Panel left */}
            <div className="lg:col-span-8 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Campaign Title (What/Theme)</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none"
                    placeholder="e.g. Heritage Luxury Nocturnal"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Collab Brand Client</label>
                  <input
                    type="text"
                    value={editingItem.client}
                    onChange={e => setEditingItem({ ...editingItem, client: e.target.value })}
                    className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none"
                    placeholder="e.g. SIA Luxury Hotels"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Strategic Category</label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none"
                  >
                    <option value="Brand Collaboration">Brand Collaboration</option>
                    <option value="Editorial Photography">Editorial Photography</option>
                    <option value="Cinematic Videography">Cinematic Videography</option>
                    <option value="Brand Campaign">Brand Campaign</option>
                    <option value="Influencer Synergy">Influencer Synergy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest text-[#8696a0] uppercase block">Launch Year</label>
                  <input
                    type="text"
                    value={editingItem.year}
                    onChange={e => setEditingItem({ ...editingItem, year: e.target.value })}
                    className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none font-mono"
                    placeholder="e.g. 2026"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest text-[#8696a0] uppercase block">Traction Impact Metric</label>
                  <input
                    type="text"
                    value={editingItem.impact}
                    onChange={e => setEditingItem({ ...editingItem, impact: e.target.value })}
                    className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none"
                    placeholder="e.g. 1.2M Reels views"
                    required
                  />
                </div>
              </div>

              {/* CAMERA EXPOSURE METADATA SECTION */}
              <div className="p-4 bg-[#070709] border border-white/5 space-y-4">
                <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-2">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Exposure Metadata Parameters (Camera Specs)
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">Shutter speed</label>
                    <input
                      type="text"
                      value={editingItem.shutter}
                      onChange={e => setEditingItem({ ...editingItem, shutter: e.target.value })}
                      className="w-full bg-black border border-white/10 focus:border-white text-white p-2 text-xs font-mono"
                      placeholder="e.g. 1/50 sec"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">ISO setting</label>
                    <input
                      type="text"
                      value={editingItem.iso}
                      onChange={e => setEditingItem({ ...editingItem, iso: e.target.value })}
                      className="w-full bg-black border border-white/10 focus:border-white text-white p-2 text-xs font-mono"
                      placeholder="e.g. ISO 400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">Aperture value</label>
                    <input
                      type="text"
                      value={editingItem.aperture}
                      onChange={e => setEditingItem({ ...editingItem, aperture: e.target.value })}
                      className="w-full bg-black border border-white/10 focus:border-white text-white p-2 text-xs font-mono"
                      placeholder="e.g. f/1.4"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Project Image Link (Unsplash recommended)</label>
                <input
                  type="url"
                  value={editingItem.imageUrl}
                  onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none font-mono"
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

            </div>

            {/* Layout Preview right */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-black/40 border border-white/5 p-4 rounded-none">
              <div className="space-y-4">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">ASSET RENDER CUE</span>
                
                <div className="aspect-[16/10] bg-zinc-950 border border-white/10 relative overflow-hidden group">
                  <img
                    src={editingItem.imageUrl}
                    alt={editingItem.title || "Preview image"}
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  
                  <div className="absolute top-3 left-3 bg-black/90 px-2 py-0.5 border border-white/10 text-[8px] font-mono text-zinc-300 uppercase">
                    {editingItem.category}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white text-black px-2 py-0.5 font-mono text-[8px] uppercase">
                    {editingItem.impact || "Draft"}
                  </div>
                </div>

                <div className="space-y-1 py-1">
                  <h5 className="text-xs text-white font-serif">{editingItem.title || "Untitled Masterpiece"}</h5>
                  <p className="text-[9px] font-mono text-zinc-500">{editingItem.client || "No Client Listed"} • {editingItem.year}</p>
                </div>

                {/* Simulated Metadata Block */}
                <div className="grid grid-cols-3 gap-1 pl-1 py-2 font-mono text-[9px] border-t border-white/5 text-zinc-400 text-center uppercase">
                  <div>
                    <span className="text-[7.5px] block text-zinc-600 block">SHT</span>
                    <span className="text-zinc-200">{editingItem.shutter}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] block text-zinc-600 block">ISO</span>
                    <span className="text-zinc-200">{editingItem.iso}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] block text-zinc-600 block">APT</span>
                    <span className="text-zinc-200">{editingItem.aperture}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-zinc-200 text-black py-3 px-4 font-mono font-bold text-[10px] tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Deploy Frame Case
                </button>
              </div>

            </div>

          </form>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="group bg-[#0e0e11] border border-white/5 hover:border-white/20 transition-all rounded-none overflow-hidden relative"
            >
              <div className="aspect-[16/10] bg-zinc-950 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale brightness-90 group-hover:brightness-100 transition-all duration-300"
                />
                
                {/* Overlay details */}
                <div className="absolute top-3 left-3 bg-black/90 px-2 py-0.5 border border-white/10 text-[8px] font-mono text-zinc-300 uppercase">
                  {item.category}
                </div>
                
                <div className="absolute bottom-3 right-3 bg-white text-black px-2 py-0.5 font-mono text-[8px] uppercase font-bold">
                  {item.impact}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-left space-y-0.5">
                  <h4 className="text-sm font-sans font-medium text-white line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{item.client} • {item.year}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 font-mono text-[8.5px] bg-black/25 p-1.5 text-center text-zinc-400 border border-white/5">
                  <div>
                    <span className="text-[7px] text-zinc-600 block uppercase">Sht</span>
                    <span className="font-semibold text-zinc-300">{item.shutter || '1/50'}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-zinc-600 block uppercase">Iso</span>
                    <span className="font-semibold text-zinc-300">{item.iso || '400'}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-zinc-600 block uppercase">Apt</span>
                    <span className="font-semibold text-zinc-300">{item.aperture || 'f/1.4'}</span>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-[9px] font-mono text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-zinc-400" /> Edit Spec
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="text-[9px] font-mono text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" /> Destroy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
