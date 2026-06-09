import React, { useState, useEffect } from 'react';
import { getInstagramPosts, saveAllInstagramPosts } from '../../lib/firebase';
import { InstagramPost } from '../../types';
import { RefreshCw, Trash2, Edit2, Plus, Save, Eye, EyeOff, Check, Instagram, Users, Heart } from 'lucide-react';

export default function InstagramManager() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<InstagramPost, 'id'>>({
    type: 'Reel',
    views: '100K',
    likes: '12K',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    caption: 'Dynamic launch campaign...'
  });

  useEffect(() => {
    async function load() {
      const data = await getInstagramPosts();
      setPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleHide = async (id: string) => {
    const updated = posts.map(x => {
      if (x.id === id) {
        return { ...x, hidden: !(x as any).hidden };
      }
      return x;
    });
    setPosts(updated);
    await saveAllInstagramPosts(updated);
    triggerSuccess();
  };

  const handleEditInit = (item: InstagramPost) => {
    setEditingId(item.id);
    setFormState({
      type: item.type,
      views: item.views,
      likes: item.likes,
      imageUrl: item.imageUrl,
      caption: item.caption
    });
  };

  const handleDeleteItem = async (id: string) => {
    const updated = posts.filter(x => x.id !== id);
    setPosts(updated);
    await saveAllInstagramPosts(updated);
    triggerSuccess();
  };

  const handleAddNew = () => {
    const newId = `ig-${Date.now()}`;
    setEditingId(newId);
    setFormState({
      type: 'Reel',
      views: '150K',
      likes: '18K',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
      caption: 'Brand integration cinematic highlight shoot in Jaipur headquarters. Directing with RED Weapon 8k.'
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedItem: InstagramPost = {
        id: editingId,
        type: formState.type,
        views: formState.views,
        likes: formState.likes,
        imageUrl: formState.imageUrl,
        caption: formState.caption,
        hidden: (posts.find(x => x.id === editingId) as any)?.hidden || false
      } as any;

      let list = [...posts];
      const index = list.findIndex(x => x.id === editingId);
      if (index >= 0) {
        list[index] = updatedItem;
      } else {
        list.push(updatedItem);
      }

      setPosts(list);
      await saveAllInstagramPosts(list);
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
      <div className="py-20 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-white" />
        LOADING OPERATOR SYNDICATION MATRIX...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-serif text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-zinc-300" /> Digital Syndication Feed Manager
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">
            Manage the cinematic portfolio loop & showcase grids
          </p>
        </div>
        {!editingId && (
          <button
            onClick={handleAddNew}
            className="bg-white hover:bg-zinc-200 text-black py-2.5 px-4 font-mono text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 font-bold cursor-pointer rounded-none self-start"
          >
            <Plus className="w-3.5 h-3.5" /> Dispatch Post
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-4 font-mono text-xs tracking-wider uppercase flex items-center gap-2">
          <Check className="w-4 h-4" /> SECURE DECK SNAPSHOT SAVED IN REAL-TIME
        </div>
      )}

      {/* Editor Modal/Panel */}
      {editingId && (
        <form onSubmit={handleFormSubmit} className="bg-zinc-950/60 border border-white/10 p-6 md:p-8 space-y-6">
          <h3 className="font-mono text-xs tracking-widest text-zinc-400 uppercase border-b border-white/5 pb-2">
            {posts.some(x => x.id === editingId) ? 'EDIT SYNDICATED FILM CLIP' : 'NEW INSTAGRAM REEL SLOT'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Media Title Type</label>
              <input
                type="text"
                value={formState.type}
                onChange={e => setFormState(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. Reel, Campaign, Collaboration"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Uncompressed Cover Image URL</label>
              <input
                type="text"
                value={formState.imageUrl}
                onChange={e => setFormState(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Estimated Views (Metric Display)</label>
              <input
                type="text"
                value={formState.views}
                onChange={e => setFormState(prev => ({ ...prev, views: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. 152K, 310K"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Estimated Hearts (Likes Display)</label>
              <input
                type="text"
                value={formState.likes}
                onChange={e => setFormState(prev => ({ ...prev, likes: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. 18.4K, 24.5K"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Case Caption Content</label>
            <textarea
              value={formState.caption}
              onChange={e => setFormState(prev => ({ ...prev, caption: e.target.value }))}
              rows={3}
              className="w-full bg-black border border-white/10 text-white p-3 font-sans text-xs focus:border-white focus:outline-none rounded-none"
              placeholder="Case details..."
              required
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-white hover:bg-zinc-200 text-black py-3 px-6 font-mono text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 font-bold cursor-pointer rounded-none disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? 'REGISTERING...' : 'LOCK SNAPSHOT'}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="bg-transparent border border-white/10 hover:border-white text-zinc-400 hover:text-white py-3 px-6 font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer rounded-none"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid of registered posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((item) => {
          const isHidden = (item as any).hidden;
          return (
            <div
              key={item.id}
              className={`bg-zinc-950/40 border p-5 flex gap-4 transition-all ${
                isHidden ? 'border-dashed border-zinc-800 opacity-60' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Visual Thumbnail */}
              <div className="w-24 h-24 bg-zinc-900 border border-white/5 shrink-0 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1 left-1 bg-black/80 text-[8px] font-mono text-zinc-400 px-1.5 py-0.5 border border-white/5">
                  {item.type}
                </div>
              </div>

              {/* Description & Action panel */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-zinc-500" /> {item.views}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-zinc-500" /> {item.likes}</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans truncate pr-2">{item.caption}</p>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleEditInit(item)}
                    className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10 flex items-center gap-1 text-[9px] font-mono uppercase"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleHide(item.id)}
                    className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10 flex items-center gap-1 text-[9px] font-mono uppercase"
                    title={isHidden ? "Show Section" : "Hide Section"}
                  >
                    {isHidden ? <EyeOff className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3 text-emerald-500" />}
                    <span>{isHidden ? "Hidden" : "Public"}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors border border-transparent hover:border-white/10 flex items-center gap-1 text-[9px] font-mono uppercase"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
