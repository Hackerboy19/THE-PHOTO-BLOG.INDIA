import React, { useState, useEffect } from 'react';
import { getWhyChooseUs, saveAllWhyChooseUs } from '../../lib/firebase';
import { WhyChooseUsItem } from '../../types';
import { RefreshCw, Trash2, Edit2, Plus, Save, Eye, EyeOff, Check, Heart, Shield, Award, Sparkles } from 'lucide-react';

export default function WhyUsControl() {
  const [items, setItems] = useState<WhyChooseUsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<WhyChooseUsItem, 'id'>>({
    title: '',
    description: '',
    iconName: 'Sparkles'
  });

  const availableIcons = ['Camera', 'Film', 'Sparkles', 'Clock', 'ShieldCheck', 'Zap', 'Award', 'Heart', 'Shield'];

  useEffect(() => {
    async function load() {
      const data = await getWhyChooseUs();
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleHide = async (id: string) => {
    const updated = items.map(x => {
      if (x.id === id) {
        return { ...x, hidden: !(x as any).hidden };
      }
      return x;
    });
    setItems(updated);
    await saveAllWhyChooseUs(updated);
    triggerSuccess();
  };

  const handleEditInit = (item: WhyChooseUsItem) => {
    setEditingId(item.id);
    setFormState({
      title: item.title,
      description: item.description,
      iconName: item.iconName || 'Sparkles'
    });
  };

  const handleDeleteItem = async (id: string) => {
    const updated = items.filter(x => x.id !== id);
    setItems(updated);
    await saveAllWhyChooseUs(updated);
    triggerSuccess();
  };

  const handleAddNew = () => {
    const newId = `why-${Date.now()}`;
    setEditingId(newId);
    setFormState({
      title: 'Bespoke Media Infrastructure',
      description: 'Housed with high-retention servers for instantaneous client deployment.',
      iconName: 'Zap'
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedItem: WhyChooseUsItem = {
        id: editingId,
        title: formState.title,
        description: formState.description,
        iconName: formState.iconName,
        hidden: (items.find(x => x.id === editingId) as any)?.hidden || false
      } as any;

      let list = [...items];
      const index = list.findIndex(x => x.id === editingId);
      if (index >= 0) {
        list[index] = updatedItem;
      } else {
        list.push(updatedItem);
      }

      setItems(list);
      await saveAllWhyChooseUs(list);
      setEditingId(null);
      triggerSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-serif text-white tracking-tight">Trust vector diagnostics</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Configure why brands partner with you</p>
        </div>
        <button
          onClick={handleAddNew}
          className="border border-[#00a884] hover:bg-[#00a884] text-[#00a884] hover:text-black py-2 px-4 font-mono text-[10px] tracking-widest uppercase transition-all rounded-none flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> [+ Add Trust Vector]
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-wider animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" /> Vectors Synchronized Successfully
        </div>
      )}

      {/* Editor Modal */}
      {editingId && (
        <div className="bg-[#0e0e11] border border-white/10 p-5 space-y-4 rounded-none">
          <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-white pb-2 border-b border-white/5">
            {items.some(x => x.id === editingId) ? 'Refine Trust Vector' : 'Add Strategic Trust Vector'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Vector Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white font-serif"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Visual Icon Motif</label>
                <select
                  value={formState.iconName}
                  onChange={(e) => setFormState({ ...formState, iconName: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-white font-mono uppercase tracking-wider cursor-pointer"
                >
                  {availableIcons.map((ico) => (
                    <option key={ico} value={ico}>
                      {ico}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase">Description narrative</label>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-zinc-300 leading-relaxed focus:outline-none focus:border-white font-sans"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 font-mono font-bold text-[9.5px] tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Vector
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="bg-transparent border border-white/10 hover:border-white text-zinc-400 hover:text-white px-5 py-2.5 font-mono text-[9.5px] tracking-widest uppercase transition-all rounded-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((srv) => {
          const isHidden = (srv as any).hidden;
          return (
            <div 
              key={srv.id} 
              className={`p-5 border flex flex-col justify-between h-full bg-zinc-950/65 transition-all relative ${
                isHidden ? 'border-red-500/15 opacity-60' : 'border-white/5 hover:border-white/10'
              }`}
            >
              {isHidden && (
                <span className="absolute top-3 right-3 text-[9px] font-mono bg-red-950/85 border border-red-500/30 text-red-400 py-0.5 px-2 uppercase tracking-widest">
                  HIDDEN
                </span>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">#{srv.id}</span>
                  <span className="text-[10px] font-mono text-[#00a884] border border-[#00a884]/20 px-1.5 py-0.5 uppercase">
                    Icon: {srv.iconName}
                  </span>
                </div>
                
                <h3 className="text-sm font-serif text-white tracking-widest uppercase">{srv.title}</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-3">{srv.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEdit(srv)}
                    className="p-1.5 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-900"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3" h-3 />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(srv.id)}
                    className="p-1.5 border border-white/5 hover:border-red-500/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-zinc-900"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3" h-3 />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleHide(srv.id)}
                  className={`py-1 px-2.5 font-mono text-[9px] tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer rounded-none ${
                    isHidden 
                      ? 'border border-red-500/20 text-red-400 bg-red-950/25' 
                      : 'border border-white/10 text-zinc-400 hover:text-[#00a884] hover:border-[#00a884]/20'
                  }`}
                >
                  {isHidden ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Unhide Vector
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Hide Vector
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Quick fallback helper
  function handleEditEdit(srv: WhyChooseUsItem) {
    handleEditInit(srv);
  }
}
