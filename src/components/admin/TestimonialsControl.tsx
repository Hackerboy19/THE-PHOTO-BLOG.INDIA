import React, { useState, useEffect } from 'react';
import { getTestimonials, saveAllTestimonials } from '../../lib/firebase';
import { Testimonial } from '../../types';
import { RefreshCw, Trash2, Edit2, Plus, Save, Eye, EyeOff, Check, Star } from 'lucide-react';

export default function TestimonialsControl() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<Testimonial, 'id'>>({
    quote: '',
    author: '',
    role: '',
    brand: '',
    rating: 5
  });

  useEffect(() => {
    async function load() {
      const data = await getTestimonials();
      setTestimonials(data);
      setLoading(false);
    }
    load();
  }, []);

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleHide = async (id: string) => {
    const updated = testimonials.map(x => {
      if (x.id === id) {
        return { ...x, hidden: !(x as any).hidden };
      }
      return x;
    });
    setTestimonials(updated);
    await saveAllTestimonials(updated);
    triggerSuccess();
  };

  const handleEditInit = (item: Testimonial) => {
    setEditingId(item.id);
    setFormState({
      quote: item.quote,
      author: item.author,
      role: item.role,
      brand: item.brand,
      rating: item.rating || 5
    });
  };

  const handleDeleteItem = async (id: string) => {
    const updated = testimonials.filter(x => x.id !== id);
    setTestimonials(updated);
    await saveAllTestimonials(updated);
    triggerSuccess();
  };

  const handleAddNew = () => {
    const newId = `t-${Date.now()}`;
    setEditingId(newId);
    setFormState({
      quote: 'The cinematic depth and emotional resonance of the campaign captured exactly who we are as a heritage brand. Absolute masterpieces.',
      author: 'Aarav Sharma',
      role: 'Creative Director',
      brand: 'Jaipur Royals Heritage',
      rating: 5
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedItem: Testimonial = {
        id: editingId,
        quote: formState.quote,
        author: formState.author,
        role: formState.role,
        brand: formState.brand,
        rating: Number(formState.rating),
        hidden: (testimonials.find(x => x.id === editingId) as any)?.hidden || false
      } as any;

      let list = [...testimonials];
      const index = list.findIndex(x => x.id === editingId);
      if (index >= 0) {
        list[index] = updatedItem;
      } else {
        list.push(updatedItem);
      }

      setTestimonials(list);
      await saveAllTestimonials(list);
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
          <h2 className="text-xl font-serif text-white tracking-tight">Director Endorsements & Client Quotes</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Configure client statements, luxury brands, and endorsement scoring</p>
        </div>
        <button
          onClick={handleAddNew}
          className="border border-[#00a884] hover:bg-[#00a884] text-[#00a884] hover:text-black py-2 px-4 font-mono text-[10px] tracking-widest uppercase transition-all rounded-none flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> [+ Add Endorsement]
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-wider animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" /> Endorsements Synced Successfully
        </div>
      )}

      {/* Testimonial Form Input */}
      {editingId && (
        <div className="bg-[#0e0e11] border border-white/10 p-5 space-y-4 rounded-none">
          <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-white pb-2 border-b border-white/5">
            {testimonials.some(x => x.id === editingId) ? 'Refine Director Endorsement' : 'Create Custom Endorsement'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Author Name</label>
                <input
                  type="text"
                  value={formState.author}
                  onChange={(e) => setFormState({ ...formState, author: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-white font-medium"
                  placeholder="e.g. Prisha Mehra"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Client Role Designation</label>
                <input
                  type="text"
                  value={formState.role}
                  onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-white"
                  placeholder="e.g. Brand VP"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Luxury Brand Header</label>
                <input
                  type="text"
                  value={formState.brand}
                  onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-white tracking-wider focus:outline-none focus:border-white font-mono uppercase"
                  placeholder="e.g. SIA LUXURY COUTURE"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Testimonial Quote</label>
                <textarea
                  value={formState.quote}
                  onChange={(e) => setFormState({ ...formState, quote: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-zinc-300 leading-relaxed focus:outline-none focus:border-white"
                  placeholder="Insert review copy here..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Performance Rating</label>
                <select
                  value={formState.rating}
                  onChange={(e) => setFormState({ ...formState, rating: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-white cursor-pointer font-mono"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                </select>
              </div>
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
                Save Endorsement
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
      <div className="space-y-4">
        {testimonials.map((test) => {
          const isHidden = (test as any).hidden;
          return (
            <div 
              key={test.id} 
              className={`p-5 border bg-zinc-950/65 transition-all relative flex flex-col md:flex-row justify-between md:items-center gap-4 ${
                isHidden ? 'border-red-500/15 opacity-60' : 'border-white/5 hover:border-white/10'
              }`}
            >
              {isHidden && (
                <span className="absolute top-2 right-2 text-[8px] font-mono bg-red-950 border border-red-500/20 text-red-400 py-0.5 px-2 uppercase tracking-widest">
                  HIDDEN
                </span>
              )}
              
              <div className="flex-1 space-y-2 text-left">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-zinc-500">#{test.id}</span>
                  <span className="text-xs font-mono font-semibold text-white tracking-widest uppercase">{test.brand}</span>
                  <div className="flex items-center text-zinc-400">
                    {Array.from({ length: test.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 font-sans italic leading-relaxed font-light">"{test.quote}"</p>
                
                <div className="text-[11px] font-mono text-zinc-400 font-medium">
                  {test.author} <span className="text-zinc-500">— {test.role}</span>
                </div>
              </div>

              <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 border-white/5 pt-3 md:pt-0 gap-3 min-w-[125px]">
                <div className="flex gap-1.5 self-start md:self-end">
                  <button
                    onClick={() => handleEditEdit(test)}
                    className="p-1.5 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-905"
                    title="Edit Endorsement"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(test.id)}
                    className="p-1.5 border border-white/5 hover:border-red-500/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-zinc-905"
                    title="Delete Endorsement"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleHide(test.id)}
                  className={`py-1 px-2.5 font-mono text-[8.5px] tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer rounded-none self-start md:self-end ${
                    isHidden 
                      ? 'border border-red-500/20 text-red-400 bg-red-950/25' 
                      : 'border border-white/10 text-zinc-400 hover:text-[#00a884]'
                  }`}
                >
                  {isHidden ? (
                    <>
                      <EyeOff className="w-2.5 h-2.5" /> Unhide Quote
                    </>
                  ) : (
                    <>
                      <Eye className="w-2.5 h-2.5" /> Hide Quote
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

  function handleEditEdit(item: Testimonial) {
    handleEditInit(item);
  }
}
