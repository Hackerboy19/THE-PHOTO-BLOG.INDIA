import React, { useState, useEffect } from 'react';
import { 
  getClientProjects, 
  saveClientProject, 
  deleteClientProject 
} from '../../lib/firebase';
import { ClientProject, ClientFeedbackComment, ClientProofStill } from '../../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  RefreshCw, 
  Save, 
  MessageSquare, 
  Clock, 
  Video, 
  Image as ImageIcon,
  Key,
  Link2,
  Lock,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { AudioSynth } from '../ClientDashboard';

export default function ClientProjectsControl() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit active states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ClientProject>({
    id: '',
    clientName: '',
    projectName: '',
    projectTitle: '',
    status: 'moodboard',
    timelineProgress: 40,
    moodboardUrl: '',
    proofingVideoUrl: '',
    invoiceAmount: 185000,
    currentMilestone: 'Moodboard',
    milestoneStatus: 'in-progress',
    progressPercentage: 40,
    lastUpdated: 'June 2026',
    draftVideoUrl: '',
    feedbackComments: [],
    proofStills: []
  });

  // Additional still forms state
  const [newStillUrl, setNewStillUrl] = useState('');
  const [newStillLabel, setNewStillLabel] = useState('');

  useEffect(() => {
    async function load() {
      const data = await getClientProjects();
      setProjects(data);
      setLoading(false);
    }
    load();
  }, []);

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    AudioSynth.playSuccess();
  };

  const handleEditInit = (item: ClientProject) => {
    AudioSynth.playClick();
    setEditingId(item.id);
    setFormState({
      ...item,
      projectTitle: item.projectTitle || item.projectName || '',
      status: item.status || 'moodboard',
      timelineProgress: typeof item.timelineProgress === 'number' ? item.timelineProgress : (item.progressPercentage || 45),
      moodboardUrl: item.moodboardUrl || '',
      proofingVideoUrl: item.proofingVideoUrl || item.draftVideoUrl || '',
      invoiceAmount: item.invoiceAmount || 150000
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this client workspace tracker?")) return;
    AudioSynth.playClick();
    const updated = projects.filter(x => x.id !== id);
    setProjects(updated);
    await deleteClientProject(id);
    triggerSuccess();
  };

  const handleAddNew = () => {
    AudioSynth.playClick();
    const uniqueId = `TPB-CLIENT-${Math.floor(Math.random() * 90) + 10}`;
    setEditingId(uniqueId);
    setFormState({
      id: uniqueId,
      clientName: '',
      projectName: '',
      projectTitle: '',
      status: 'scripting',
      timelineProgress: 15,
      moodboardUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
      proofingVideoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761',
      invoiceAmount: 185000,
      currentMilestone: 'Scripting',
      milestoneStatus: 'in-progress',
      progressPercentage: 15,
      lastUpdated: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }),
      draftVideoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761',
      feedbackComments: [],
      proofStills: [
        {
          id: 'still-1',
          imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
          label: '01 // Shoot Stills Mockup Option'
        }
      ]
    });
  };

  const handleAddStillToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStillUrl.trim() || !newStillLabel.trim()) return;

    AudioSynth.playClick();
    const newStill: ClientProofStill = {
      id: `still-${Date.now()}`,
      imageUrl: newStillUrl.trim(),
      label: newStillLabel.trim()
    };

    setFormState(prev => ({
      ...prev,
      proofStills: [...prev.proofStills, newStill]
    }));

    setNewStillUrl('');
    setNewStillLabel('');
  };

  const handleRemoveStill = (id: string) => {
    AudioSynth.playClick();
    setFormState(prev => ({
      ...prev,
      proofStills: prev.proofStills.filter(x => x.id !== id)
    }));
  };

  const handleClearComments = () => {
    AudioSynth.playClick();
    setFormState(prev => ({
      ...prev,
      feedbackComments: []
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = formState.projectTitle?.trim() || formState.projectName?.trim();
    if (!formState.id.trim() || !formState.clientName.trim() || !finalTitle) return;

    setIsSaving(true);
    AudioSynth.playClick();

    // Mapping back and forth to support legacy currentMilestone fields
    let mappedMilestone: 'Scripting' | 'Moodboard' | 'Production' | 'Post-Prod Edit' | 'Final Review' = 'Moodboard';
    let mappedMilestoneStatus: 'pending' | 'in-progress' | 'completed' = 'in-progress';
    if (formState.status === 'scripting') {
      mappedMilestone = 'Scripting';
    } else if (formState.status === 'moodboard') {
      mappedMilestone = 'Moodboard';
    } else if (formState.status === 'production') {
      mappedMilestone = 'Production';
    } else if (formState.status === 'post-production') {
      mappedMilestone = 'Post-Prod Edit';
    } else if (formState.status === 'review' || formState.status === 'delivered') {
      mappedMilestone = 'Final Review';
    }

    if (formState.status === 'delivered') {
      mappedMilestoneStatus = 'completed';
    }

    try {
      const updatedItem: ClientProject = {
        ...formState,
        id: formState.id.toUpperCase().trim(),
        projectName: finalTitle,
        projectTitle: finalTitle,
        currentMilestone: mappedMilestone,
        milestoneStatus: mappedMilestoneStatus,
        progressPercentage: Number(formState.timelineProgress),
        lastUpdated: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }),
        draftVideoUrl: formState.proofingVideoUrl || formState.draftVideoUrl || ''
      };

      let list = [...projects];
      const index = list.findIndex(x => x.id === updatedItem.id);
      if (index >= 0) {
        list[index] = updatedItem;
      } else {
        list.push(updatedItem);
      }

      setProjects(list);
      await saveClientProject(updatedItem);
      setEditingId(null);
      triggerSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySecureLink = (id: string) => {
    const link = `${window.location.origin}/dashboard?project=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    AudioSynth.playSuccess();
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-white" />
        LOADING SECURE WORKSPACE REGISTRY...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-serif text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-zinc-300 animate-pulse" /> Client Pre-Production Studio
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">
            Deploy secure passwordless tracking links, milestones and proof draft footage
          </p>
        </div>
        {!editingId && (
          <button
            onClick={handleAddNew}
            className="bg-white hover:bg-zinc-200 text-black py-2.5 px-4 font-mono text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 font-bold cursor-pointer rounded-none self-start"
          >
            <Plus className="w-3.5 h-3.5" /> Initialize Client Deck
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-4 font-mono text-xs tracking-wider uppercase flex items-center gap-2">
          <Check className="w-4 h-4" /> CLIENT CO-PRODUCTION SNAPSHOT SYNCHRONISED SUCCESSFULLY
        </div>
      )}

      {/* Editor Modal/Panel */}
      {editingId && (
        <form onSubmit={handleFormSubmit} className="bg-zinc-950/60 border border-white/10 p-6 md:p-8 space-y-6">
          <h3 className="font-mono text-xs tracking-widest text-zinc-400 uppercase border-b border-white/5 pb-2">
            {projects.some(x => x.id === editingId) ? `EDIT DEPLOYED WORKSPACE [${formState.id}]` : 'INITIALIZE NEIGHBOUR CO-PRODUCTION LINK'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Access ID / Passcode (Uppercase)</label>
              <input
                type="text"
                value={formState.id}
                onChange={e => setFormState(prev => ({ ...prev, id: e.target.value }))}
                disabled={projects.some(x => x.id === editingId)}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none placeholder-zinc-800"
                placeholder="e.g. TPB-CLIENT-85"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Client (Full Name)</label>
              <input
                type="text"
                value={formState.clientName}
                onChange={e => setFormState(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-sans text-xs focus:border-white focus:outline-none rounded-none placeholder-zinc-800"
                placeholder="e.g. Muskan Mundhra"
                required
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Campaign Project Title</label>
              <input
                type="text"
                value={formState.projectTitle || formState.projectName || ''}
                onChange={e => setFormState(prev => ({ ...prev, projectTitle: e.target.value, projectName: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-sans text-xs focus:border-white focus:outline-none rounded-none placeholder-zinc-800"
                placeholder="e.g. Heritage Elegance Campaign"
                required
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Current Project State Phase</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-black p-1.5 border border-white/10">
                {(['scripting', 'moodboard', 'production', 'post-production', 'review', 'delivered'] as const).map((ph) => {
                  const isActive = (formState.status || 'moodboard') === ph;
                  return (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => {
                        AudioSynth.playClick();
                        setFormState(prev => ({ ...prev, status: ph }));
                      }}
                      className={`py-2 px-1 font-mono text-[9px] uppercase tracking-wider transition-all text-center rounded-none font-bold cursor-pointer ${
                        isActive 
                          ? 'bg-white text-black font-black' 
                          : 'bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900/40'
                      }`}
                    >
                      {ph === 'post-production' ? 'post-prod' : ph}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-[#00a884] tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Client Invoice Amount (INR ₹)
              </label>
              <input
                type="number"
                value={formState.invoiceAmount || 0}
                onChange={e => setFormState(prev => ({ ...prev, invoiceAmount: parseInt(e.target.value, 10) || 0 }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. 185000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Client WhatsApp Number / Phone</label>
              <input
                type="text"
                value={formState.clientPhone || ''}
                onChange={e => setFormState(prev => ({ ...prev, clientPhone: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. 917014XXXXXX"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Moodboard Asset Board URL</label>
              <input
                type="text"
                value={formState.moodboardUrl || ''}
                onChange={e => setFormState(prev => ({ ...prev, moodboardUrl: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Proofing Video Frame Source (Streaming URL / MP4)</label>
              <input
                type="text"
                value={formState.proofingVideoUrl || formState.draftVideoUrl || ''}
                onChange={e => setFormState(prev => ({ ...prev, proofingVideoUrl: e.target.value, draftVideoUrl: e.target.value }))}
                className="w-full bg-black border border-white/10 text-white p-3 font-mono text-xs focus:border-white focus:outline-none rounded-none"
                placeholder="e.g. https://player.vimeo.com/external/..."
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <div className="flex justify-between items-end text-[10px] font-mono uppercase pb-1">
                <div>
                  <span className="text-zinc-500 tracking-wider block">Active Timeline Progress</span>
                  <span className="text-white font-black">{formState.timelineProgress || formState.progressPercentage || 0}% Complete</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.playClick();
                    const name = formState.clientName || 'Client';
                    const brand = formState.projectTitle || formState.projectName || 'your campaign';
                    const link = `${window.location.origin}/dashboard?project=${formState.id}`;
                    const msg = `Hey ${name}, your milestone status for ${brand} is locked! View it live here: ${link}`;
                    
                    const phone = formState.clientPhone ? formState.clientPhone.replace(/\D/g, '') : '';
                    const url = phone 
                      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                    
                    window.open(url, '_blank');
                  }}
                  className="bg-[#00a884] hover:bg-[#00cfa2] text-black px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1.5 font-bold cursor-pointer rounded-none shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" /> Ping Milestone Update
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formState.timelineProgress || formState.progressPercentage || 0}
                onChange={e => {
                  const num = parseInt(e.target.value, 10);
                  setFormState(prev => ({ ...prev, timelineProgress: num, progressPercentage: num }));
                }}
                className="w-full accent-white bg-zinc-900 border-none outline-none h-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Proofing Stills Manager */}
          <div className="border border-white/5 bg-[#050505] p-5 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#00a884] flex items-center gap-1.5 font-bold">
              <ImageIcon className="w-4 h-4" /> Proof Still Frames ({formState.proofStills.length})
            </h4>

            {formState.proofStills.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2 border-b border-white/5">
                {formState.proofStills.map((s) => (
                  <div key={s.id} className="relative group p-1.5 bg-black border border-white/10">
                    <img src={s.imageUrl} alt={s.label} className="w-full aspect-[4/3] object-cover" />
                    <p className="text-[10px] font-mono truncate text-zinc-400 mt-1">{s.label}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveStill(s.id)}
                      className="absolute top-1 right-1 bg-black/80 hover:bg-black border border-white/10 p-1 hover:text-red-400 transition"
                      title="Remove Still Frame"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form to append new proof still */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Still Image URL</label>
                <input
                  type="text"
                  value={newStillUrl}
                  onChange={e => setNewStillUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white p-2 text-xs font-mono focus:border-white focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Still Tag/Label</label>
                <input
                  type="text"
                  value={newStillLabel}
                  onChange={e => setNewStillLabel(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white p-2 text-xs focus:border-white focus:outline-none"
                  placeholder="03 // Palace Courtyard angle"
                />
              </div>
              <button
                type="button"
                onClick={handleAddStillToDraft}
                className="bg-zinc-900 border border-white/10 hover:border-white text-zinc-300 hover:text-white py-2 px-4 text-[9px] uppercase font-mono tracking-widest transition-colors font-bold"
              >
                Add Still Frame
              </button>
            </div>
          </div>

          {/* Feedback Comments Log */}
          {formState.feedbackComments.length > 0 && (
            <div className="border border-white/5 bg-[#050505] p-5 space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Deployed Feedback Thread ({formState.feedbackComments.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearComments}
                  className="text-[9px] uppercase text-red-500 hover:text-red-400 tracking-wider flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Purge Client Notes
                </button>
              </div>

              <div className="space-y-3.5 max-h-[160px] overflow-y-auto">
                {formState.feedbackComments.map((note) => (
                  <div key={note.id} className="border-b border-white/5 pb-2 last:border-0">
                    <div className="flex justify-between font-bold text-[10px]">
                      <span className="text-white">{note.author}</span>
                      <span className="text-[#00a884]"><Clock className="w-2.5 h-2.5 inline mr-1" />{note.timestamp}</span>
                    </div>
                    <p className="text-zinc-400 italic mt-1 font-sans">"{note.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Grid of Deployed Worskpaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((item) => {
          const valProgress = typeof item.timelineProgress === 'number' ? item.timelineProgress : (item.progressPercentage || 0);
          const valStatus = item.status || 'moodboard';
          const displayedTitle = item.projectTitle || item.projectName || 'Untitled Project';
          return (
            <div
              key={item.id}
              className="bg-zinc-950/40 border border-white/10 hover:border-white/20 p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900/80 border border-white/10 px-2 py-0.5 uppercase tracking-widest">
                      ID: {item.id}
                    </span>
                    <h3 className="text-sm font-serif text-white font-semibold mt-1 tracking-wide">{displayedTitle}</h3>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 uppercase font-bold text-xs uppercase">
                    {valStatus}
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs leading-relaxed font-sans text-zinc-400">
                  <p>Client Owner: <strong className="text-white">{item.clientName}</strong></p>
                  
                  {item.invoiceAmount ? (
                    <p>Financial Ledger: <strong className="text-emerald-400 font-mono">₹{item.invoiceAmount?.toLocaleString('en-IN')} INR</strong></p>
                  ) : null}

                  {item.moodboardUrl ? (
                    <p className="truncate">Moodboard: <span className="text-zinc-500 font-mono text-[10px]">{item.moodboardUrl}</span></p>
                  ) : null}

                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono mt-1 pr-1">
                      <span>Timeline Status: {valProgress}%</span>
                      <button
                        type="button"
                        onClick={() => {
                          AudioSynth.playClick();
                          const name = item.clientName || 'Client';
                          const brand = item.projectTitle || item.projectName || 'your campaign';
                          const statusVal = item.status || 'moodboard';
                          const link = `${window.location.origin}/dashboard?project=${item.id}`;
                          const msg = `Hey ${name}, your milestone status for ${brand} is updated to [${statusVal.toUpperCase()}] at ${valProgress}%! View your live dashboard here: ${link}`;
                          
                          const phone = item.clientPhone ? item.clientPhone.replace(/\D/g, '') : '';
                          const url = phone 
                            ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
                            : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                        }}
                        className="text-[#00a884] hover:text-white font-bold uppercase transition flex items-center gap-1 cursor-pointer bg-transparent border-0 text-[9px] tracking-wider"
                      >
                        <MessageSquare className="w-2.5 h-2.5 shrink-0" /> Ping Milestone
                      </button>
                    </div>
                    <div className="h-1 bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-white transition-all duration-500" style={{ width: `${valProgress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/5 pt-4 flex flex-col gap-3">
                {/* Generate copy target path */}
                <div className="flex items-center justify-between gap-2 bg-black border border-white/5 p-2 text-[10px] font-mono select-all">
                  <span className="text-zinc-500 truncate">/dashboard?project={item.id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopySecureLink(item.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-900 hover:bg-white text-zinc-400 hover:text-black hover:font-bold border border-white/10 hover:border-transparent transition cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    {copiedId === item.id ? 'COPIED!' : 'COPY SECURE PATH'}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                  <div className="text-zinc-500">
                    {item.feedbackComments?.length || 0} Feedback • {item.proofStills?.length || 0} Stills
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditInit(item)}
                      className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10 flex items-center gap-1 font-bold cursor-pointer"
                      title="Configure Workspace Trackers"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors border border-transparent hover:border-white/10 flex items-center gap-1 font-bold cursor-pointer"
                      title="Decomission Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
