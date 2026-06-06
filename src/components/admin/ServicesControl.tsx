import React, { useState, useEffect } from 'react';
import { getServices, saveAllServices } from '../../lib/firebase';
import { Service } from '../../types';
import { RefreshCw, Trash2, Edit2, Plus, Save, Eye, EyeOff, Check, Sparkles } from 'lucide-react';

export default function ServicesControl() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    metric: '',
    features: []
  });

  useEffect(() => {
    async function load() {
      const data = await getServices();
      setServices(data);
      setLoading(loading => false);
    }
    load();
  }, []);

  const handleToggleHide = async (id: string) => {
    const updated = services.map(srv => {
      if (srv.id === id) {
        return { ...srv, hidden: !srv.hidden };
      }
      return srv;
    });
    setServices(updated);
    await saveAllServices(updated);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleEditInit = (srv: Service) => {
    setEditingId(srv.id);
    setFormState({
      title: srv.title,
      description: srv.description,
      metric: srv.metric,
      features: srv.features || []
    });
  };

  const handleDeleteItem = async (id: string) => {
    const updated = services.filter(x => x.id !== id);
    setServices(updated);
    await saveAllServices(updated);
    triggerSuccess();
  };

  const handleAddNew = () => {
    const newId = `service-${Date.now()}`;
    setEditingId(newId);
    setFormState({
      title: 'New Sensation Agency Skill',
      description: 'Ultra-exclusive visual performance engine...',
      metric: '9.2M+ Reach',
      features: ['High-Fidelity Master Layout', 'Art Direction Sync', 'Brand Velocity Blueprint']
    });
  };

  const handleFeatureSlotChange = (index: number, val: string) => {
    const updatedFeatures = [...formState.features];
    updatedFeatures[index] = val;
    setFormState({ ...formState, features: updatedFeatures });
  };

  const handleAddFeatureSlot = () => {
    setFormState({ ...formState, features: [...formState.features, ''] });
  };

  const handleRemoveFeatureSlot = (index: number) => {
    const updatedFeatures = formState.features.filter((_, idx) => idx !== index);
    setFormState({ ...formState, features: updatedFeatures });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    try {
      // Filter out empty lines
      const parsedFeatures = formState.features
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const updatedSrv: Service = {
        id: editingId,
        title: formState.title,
        description: formState.description,
        metric: formState.metric,
        features: parsedFeatures,
        hidden: services.find(x => x.id === editingId)?.hidden || false
      };

      let newServicesList = [...services];
      const index = newServicesList.findIndex(x => x.id === editingId);
      if (index >= 0) {
        newServicesList[index] = updatedSrv;
      } else {
        newServicesList.push(updatedSrv);
      }

      setServices(newServicesList);
      await saveAllServices(newServicesList);

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
          <h2 className="text-xl font-serif text-white tracking-tight">Capabilities grid management</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Configure services, performance metrics, and features</p>
        </div>
        <button
          onClick={handleAddNew}
          className="border border-[#00a884] hover:bg-[#00a884] text-[#00a884] hover:text-black py-2 px-4 font-mono text-[10px] tracking-widest uppercase transition-all rounded-none flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> [+ Add New Capability]
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-wider animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" /> Service State Synced Successfully
        </div>
      )}

      {/* Editor Modal/Form */}
      {editingId && (
        <div className="bg-[#0e0e11] border border-white/10 p-5 space-y-4 rounded-none relative">
          <div className="absolute top-4 right-4 text-xs font-mono text-[#00a884]">
            ID: {editingId}
          </div>
          <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-white pb-2 border-b border-white/5">
            {services.some(x => x.id === editingId) ? 'Refine Service Copy' : 'Forge New Capability'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Capability Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white font-serif"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Retention Metric (Counter)</label>
                <input
                  type="text"
                  value={formState.metric}
                  onChange={(e) => setFormState({ ...formState, metric: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-[#00a884] font-semibold focus:outline-none focus:border-[#00a884] font-mono"
                  placeholder="e.g., 4.5M+ Collective Views"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase">Core Description Paragraph</label>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs text-zinc-300 tracking-wide leading-relaxed focus:outline-none focus:border-white font-sans"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Fine Art Deliverables & Specifications
                </label>
                <button
                  type="button"
                  onClick={handleAddFeatureSlot}
                  className="bg-zinc-900 border border-white/15 text-xs text-[#00a884] hover:text-white hover:border-[#00a884] px-2.5 py-1 font-mono text-[9px] tracking-wider uppercase transition-all rounded-none cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Technical Param
                </button>
              </div>

              <div className="space-y-2">
                {formState.features.map((feat, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 bg-[#00a884] shrink-0" />
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureSlotChange(index, e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                      placeholder={`e.g. Cinema Systems or Lighting rigs (Slot #${index + 1})`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeatureSlot(index)}
                      className="p-2 border border-white/5 hover:border-red-500/20 text-zinc-500 hover:text-red-400 transition-colors bg-zinc-950 cursor-pointer"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {formState.features.length === 0 && (
                  <p className="text-[10px] text-zinc-505 font-mono italic">No features defined. Add at least one parameter slot above.</p>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 block">Each slot maps to a highlighted spec line with modern check design headers in your production service panels.</span>
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
                Commit Changes
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => (
          <div 
            key={srv.id} 
            className={`p-5 border flex flex-col justify-between h-full bg-zinc-950/65 max-w-full overflow-hidden transition-all relative ${
              srv.hidden ? 'border-red-500/15 opacity-60' : 'border-white/5 hover:border-white/10'
            }`}
          >
            {srv.hidden && (
              <span className="absolute top-3 right-3 text-[9px] font-mono bg-red-950/85 border border-red-500/30 text-red-400 py-0.5 px-2 uppercase tracking-widest">
                CARD HIDDEN
              </span>
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">#{srv.id}</span>
                <span className="text-xs font-mono text-[#00a884] font-bold">{srv.metric}</span>
              </div>
              
              <h3 className="text-md font-serif text-white uppercase tracking-wider">{srv.title}</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-3">{srv.description}</p>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {srv.features?.map((f, i) => (
                  <span key={i} className="text-[9px] font-mono text-zinc-500 border border-white/5 px-2 py-0.5 bg-zinc-900/50">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between bg-zinc-900/20 px-1 -mx-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditInit(srv)}
                  className="p-2 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-950"
                  title="Modify Slogan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(srv.id)}
                  className="p-2 border border-white/5 hover:border-red-500/30 text-zinc-500 hover:text-red-400 transition-all cursor-pointer bg-zinc-950"
                  title="Expel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleToggleHide(srv.id)}
                className={`py-1.5 px-3 font-mono text-[9px] tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded-none ${
                  srv.hidden 
                    ? 'border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-zinc-900 hover:text-white hover:border-white/10' 
                    : 'border border-white/5 text-zinc-400 hover:text-[#00a884] hover:border-[#00a884]/30'
                }`}
              >
                {srv.hidden ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Unhide Card
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Hide Card
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
