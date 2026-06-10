import React, { useState, useEffect, useRef } from 'react';
import { getPortfolioItems, savePortfolioItem, deletePortfolioItem } from '../../lib/firebase';
import { PortfolioItem } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  RefreshCw, 
  Camera, 
  Sparkles, 
  Sliders, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSynth } from '../ClientDashboard';

export default function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Custom states
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default empty shell
  const createEmptyItem = (): PortfolioItem => ({
    id: `p-${Date.now()}`,
    title: '',
    category: 'Brand Collaboration',
    client: '',
    imageUrl: '',
    year: String(new Date().getFullYear()),
    impact: 'Views Pending',
    shutter: '1/250 sec',
    iso: 'ISO 100',
    aperture: 'f/1.8'
  });

  async function syncRoster() {
    setLoading(true);
    try {
      const res = await getPortfolioItems();
      setItems(res || []);
    } catch (err: any) {
      showFeedback('error', 'Failed to retrieve media library.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncRoster();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setToast({ type, message: text });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Convert files to base64
  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Only standard Web formats (JPG, PNG, WebP, AVIF) are supported.');
      return;
    }

    // Set simulator uploading progress bar
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 120);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        if (editingItem) {
          setEditingItem({
            ...editingItem,
            imageUrl: base64String
          });
        } else {
          // If no item is selected, create new and set image
          const fresh = createEmptyItem();
          fresh.imageUrl = base64String;
          setEditingItem(fresh);
          setIsNewRecord(true);
        }
        setUploadProgress(null);
        AudioSynth.playShutter();
        showFeedback('success', 'Image successfully loaded into live media stage buffer.');
      }, 300);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setUploadProgress(null);
      showFeedback('error', 'Error reading image file binary data.');
    };
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const selectLocalFile = () => {
    fileInputRef.current?.click();
  };

  const handleEditClick = (item: PortfolioItem) => {
    setEditingItem({
      ...item,
      shutter: item.shutter || '1/25 sec',
      iso: item.iso || 'ISO 100',
      aperture: item.aperture || 'f/1.8'
    });
    setIsNewRecord(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
    AudioSynth.playShutter();
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
    AudioSynth.playShutter();
  };

  const confirmDelete = async (id: string, title: string) => {
    try {
      await deletePortfolioItem(id);
      showFeedback('success', `Campaign "${title}" wiped from production database.`);
      setDeleteConfirmId(null);
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
      syncRoster();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to complete wipe sequence.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title || !editingItem.client || !editingItem.imageUrl) {
      showFeedback('error', 'Please fill out required Title, Client, and direct Image Streams.');
      return;
    }

    try {
      await savePortfolioItem(editingItem);
      showFeedback('success', `✦ "${editingItem.title}" successfully synchronized in real-time.`);
      setEditingItem(null);
      setIsNewRecord(false);
      syncRoster();
    } catch (err: any) {
      showFeedback('error', err.message || 'Sync failed.');
    }
  };

  const prepareFreshUpload = () => {
    setEditingItem(createEmptyItem());
    setIsNewRecord(true);
    AudioSynth.playShutter();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 text-[#FFEEB7] font-mono text-xs gap-4">
        <RefreshCw className="w-6 h-6 animate-spin text-[#FFDA03]" />
        <span className="tracking-[0.2em] uppercase">SYNCING MEDIA TELEMETY GRID...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left bg-black text-[#FFEEB7] p-1 sm:p-4">
      
      {/* Header element */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#FFEEB7]/10 pb-6">
        <div>
          <span className="text-[9px] font-mono tracking-[0.3em] text-[#FFDA03] uppercase font-bold block mb-1">
            ✦ HIGH PRECISION BRAND DIRECTORY ✦
          </span>
          <h2 className="text-2xl font-serif text-[#FFEEB7] font-bold tracking-tight">
            ✦ LIVE MEDIA ENGINE // PORTFOLIO MANAGEMENT
          </h2>
          <p className="text-[11px] text-zinc-400 font-mono tracking-wide mt-1 uppercase">
            Deploy dynamic high-fidelity elements & real-time photography drops
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={prepareFreshUpload}
            className="bg-[#FFDA03] hover:bg-white text-black py-2.5 px-6 font-mono text-[10px] tracking-widest uppercase font-bold flex items-center gap-1.5 transition-all duration-300 rounded-none border border-transparent hover:border-[#FFDA03]"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" /> Register Case Campaign
          </button>
        )}
      </div>

      {/* Floating Status Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`p-4 font-mono text-[11px] uppercase tracking-wider border flex items-center gap-3 shadow-2xl relative z-50 ${
              toast.type === 'success' 
                ? 'bg-black border-[#FFDA03] text-[#FFDA03]' 
                : 'bg-black border-red-500 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <div>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Upload Zone / Buffer Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#FFEEB7]/80 tracking-widest">
          <Upload className="w-3.5 h-3.5 text-[#FFDA03]" /> 
          Step 1: Raw Image ingestion buffer (Drag & drop or Click)
        </div>

        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={selectLocalFile}
          className={`relative border-2 border-dashed rounded-none p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
            dragActive 
              ? 'border-[#FFDA03] bg-[#FFDA03]/5' 
              : 'border-[#FFEEB7]/20 hover:border-[#FFDA03] hover:bg-white/5'
          } ${uploadProgress !== null ? 'pointer-events-none' : ''}`}
          id="direct-drag-drop-zone"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpg, image/jpeg, image/png, image/webp"
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-4">
            <div className={`w-14 h-14 border border-[#FFEEB7]/23 flex items-center justify-center bg-black transition-transform duration-300 ${
              dragActive ? 'rotate-[45deg] scale-110 !border-[#FFDA03]' : ''
            }`}>
              <ImageIcon className={`w-6 h-6 text-[#FFEEB7] ${dragActive ? 'text-[#FFDA03]' : ''}`} />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-[#FFEEB7] font-semibold">
                Drag & Drop high-definition photo files
              </p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Support JPG, PNG, WebP formats (Self-compressing client converter)
              </p>
            </div>

            <span className="text-[10px] border border-[#FFEEB7]/20 font-mono tracking-widest uppercase hover:bg-[#FFDA03] hover:text-black py-1.5 px-3 transition-all duration-300">
              Browse Local Drives
            </span>
          </div>

          {/* Interactive loading bar mapped specifically to Dark Yellow (#FFDA03) */}
          {uploadProgress !== null && (
            <div className="absolute inset-x-0 bottom-0 pr-0.5">
              <div className="h-1 bg-zinc-900 w-full">
                <div 
                  className="h-full bg-[#FFDA03] transition-all duration-200 shadow-[0_0_10px_#FFDA03]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="absolute bottom-2 right-4 text-[9px] font-mono uppercase tracking-widest text-[#FFDA03]">
                Decoding Binary Frame &bull; {uploadProgress}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Panel Overlay */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#000000] border border-[#FFDA03] p-6 sm:p-8 space-y-6 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-[#FFEEB7]/10 pb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FFDA03]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFDA03]">
                  {isNewRecord ? "✦ Stage Buffer: Registering New Shoot Frame" : `✦ Live Engine: Modifying Frame [${editingItem.id}]`}
                </h3>
              </div>
              <button 
                onClick={() => { setEditingItem(null); setIsNewRecord(false); }} 
                className="text-zinc-400 hover:text-red-400 flex items-center gap-1 text-[10px] uppercase font-mono cursor-pointer transition-colors"
              >
                Reset Stage <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column Fields */}
              <div className="lg:col-span-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-[#FFEEB7]/70 uppercase block">Campaign Theme / Title *</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full bg-[#000000] border border-[#FFEEB7]/20 focus:border-[#FFDA03] text-white p-3 text-xs focus:outline-none uppercase font-serif"
                      placeholder="e.g. Amber Sunrise Shadows"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-[#FFEEB7]/70 uppercase block">Alliance Brand Client *</label>
                    <input
                      type="text"
                      value={editingItem.client}
                      onChange={e => setEditingItem({ ...editingItem, client: e.target.value })}
                      className="w-full bg-[#000000] border border-[#FFEEB7]/20 focus:border-[#FFDA03] text-white p-3 text-xs focus:outline-none uppercase"
                      placeholder="e.g. Muskan Premium Linens"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-[#FFEEB7]/70 uppercase block">Media Category</label>
                    <select
                      value={editingItem.category}
                      onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full bg-[#000000] border border-[#FFEEB7]/20 focus:border-[#FFDA03] text-white p-3 text-xs focus:outline-none"
                    >
                      <option value="Brand Collaboration">Brand Collaboration</option>
                      <option value="Editorial Photography">Editorial Photography</option>
                      <option value="Cinematic Videography">Cinematic Videography</option>
                      <option value="Brand Campaign">Brand Campaign</option>
                      <option value="Influencer Synergy">Influencer Synergy</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-[#FFEEB7]/70 uppercase block font-semibold">Launch Year</label>
                    <input
                      type="text"
                      value={editingItem.year}
                      onChange={e => setEditingItem({ ...editingItem, year: e.target.value })}
                      className="w-full bg-[#000000] border border-[#FFEEB7]/20 focus:border-[#FFDA03] text-white p-3 text-xs focus:outline-none font-mono"
                      placeholder="e.g. 2026"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono tracking-widest text-[#FFEEB7]/70 uppercase block">Traction Impact Metric</label>
                    <input
                      type="text"
                      value={editingItem.impact}
                      onChange={e => setEditingItem({ ...editingItem, impact: e.target.value })}
                      className="w-full bg-[#000000] border border-[#FFEEB7]/20 focus:border-[#FFDA03] text-white p-3 text-xs focus:outline-none"
                      placeholder="e.g. Regional Takeover"
                      required
                    />
                  </div>
                </div>

                {/* Shutter Settings Overlay mapping to camera details */}
                <div className="p-4 bg-[#050507] border border-[#FFEEB7]/10 space-y-4">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-2">
                    <Sliders className="w-3.5 h-3.5 text-[#FFDA03]" /> 
                    Optics Viewfinder Telemetry
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase block">Shutter speed</label>
                      <input
                        type="text"
                        value={editingItem.shutter}
                        onChange={e => setEditingItem({ ...editingItem, shutter: e.target.value })}
                        className="w-full bg-black border border-[#FFEEB7]/10 focus:border-[#FFDA03] text-white p-2.5 text-xs font-mono"
                        placeholder="e.g. 1/500 sec"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase block">ISO rating</label>
                      <input
                        type="text"
                        value={editingItem.iso}
                        onChange={e => setEditingItem({ ...editingItem, iso: e.target.value })}
                        className="w-full bg-black border border-[#FFEEB7]/10 focus:border-[#FFDA03] text-white p-2.5 text-xs font-mono"
                        placeholder="e.g. ISO 200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase block">Aperture size</label>
                      <input
                        type="text"
                        value={editingItem.aperture}
                        onChange={e => setEditingItem({ ...editingItem, aperture: e.target.value })}
                        className="w-full bg-black border border-[#FFEEB7]/10 focus:border-[#FFDA03] text-white p-2.5 text-xs font-mono"
                        placeholder="e.g. f/1.2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono tracking-widest text-[#FFEEB7]/70 uppercase block">Custom Web Image Direct stream (URL Fallback)</label>
                  <input
                    type="url"
                    value={editingItem.imageUrl}
                    onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="w-full bg-[#000000] border border-[#FFEEB7]/20 focus:border-[#FFDA03] text-white p-3 text-xs focus:outline-none font-mono"
                    placeholder="Provide image URL stream link or drag-and-drop above to automatically build..."
                    required
                  />
                </div>

              </div>

              {/* Right Column Layout Preview Card */}
              <div className="lg:col-span-4 flex flex-col justify-between bg-black border border-[#FFEEB7]/10 p-4">
                <div className="space-y-4">
                  <span className="text-[8.5px] font-mono text-[#FFDA03] uppercase tracking-widest block font-bold">
                    [✦ REAL-TIME PREVIEW BUFFER]
                  </span>
                  
                  <div className="aspect-[16/10] bg-zinc-950 border border-[#FFEEB7]/10 relative overflow-hidden group">
                    {editingItem.imageUrl ? (
                      <img
                        src={editingItem.imageUrl}
                        alt="Unprocessed stage render"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050507] text-[#FFEEB7]/40">
                        <ImageIcon className="w-8 h-8 mb-2 animate-pulse text-[#FFEEB7]/20" />
                        <span className="text-[8px] font-mono tracking-widest uppercase">Waiting for asset import...</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 bg-black/90 px-2 py-0.5 border border-[#FFEEB7]/20 text-[8px] font-mono text-zinc-300 uppercase">
                      {editingItem.category}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-[#FFDA03] text-black px-2 py-0.5 font-mono font-bold text-[8px] uppercase">
                      {editingItem.impact || "INGESTION STATUS: LIVE"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-sm text-[#FFEEB7] font-serif font-bold uppercase">{editingItem.title || "UNTITLED PHOTOGRAPHY"}</h5>
                    <p className="text-[9px] font-mono text-zinc-400">{editingItem.client || "SIA LUXURY DESIGN"} &bull; {editingItem.year}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1.5 font-mono text-[8.5px] border-t border-[#FFEEB7]/10 text-zinc-400 text-center uppercase">
                    <div>
                      <span className="text-[7.5px] block text-zinc-600">SHT</span>
                      <span className="text-[#FFEEB7]">{editingItem.shutter}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] block text-zinc-600">ISO</span>
                      <span className="text-[#FFEEB7]">{editingItem.iso}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] block text-zinc-600">APT</span>
                      <span className="text-[#FFEEB7]">{editingItem.aperture}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-[#FFDA03] hover:bg-white text-black py-4.5 px-4 font-mono font-bold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Synchronize To Live Database
                  </button>
                </div>

              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renders dynamic live list of active images/posts as card previews */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono tracking-widest text-[#FFDA03] uppercase font-bold border-b border-[#FFEEB7]/10 pb-2">
          ✦ ACTIVE MEDIA CODES & ELEMENTS GRID
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="portfolio-media-items-grid">
          {items.map(item => (
            <div
              key={item.id}
              className="group bg-black border border-[#FFEEB7]/10 hover:border-[#FFDA03] transition-all duration-400 rounded-none overflow-hidden relative flex flex-col justify-between"
            >
              <div className="aspect-[16/10] bg-zinc-950 overflow-hidden relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale brightness-[0.8] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[8px] font-mono">No Image</span>
                  </div>
                )}
                
                {/* Overlay captions */}
                <div className="absolute top-3 left-3 bg-black/95 px-2 py-0.5 border border-[#FFEEB7]/20 text-[8px] font-mono text-[#FFEEB7] uppercase">
                  {item.category}
                </div>
                
                <div className="absolute bottom-3 right-3 bg-black/80 text-[#FFEEB7] px-2 py-0.5 border border-[#FFEEB7]/20 font-mono text-[8px] uppercase">
                  {item.impact}
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between bg-black">
                <div className="text-left space-y-1">
                  <h4 className="text-sm font-serif font-bold text-[#FFEEB7] line-clamp-1 uppercase tracking-wide group-hover:text-[#FFDA03] transition-colors">{item.title}</h4>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{item.client} &bull; {item.year}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 font-mono text-[8.5px] bg-[#050507] p-2 text-center text-zinc-400 border border-[#FFEEB7]/10">
                  <div>
                    <span className="text-[7px] text-zinc-600 block uppercase font-bold">Sht</span>
                    <span className="font-semibold text-zinc-200">{item.shutter || '1/250'}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-zinc-600 block uppercase font-bold">Iso</span>
                    <span className="font-semibold text-zinc-200">{item.iso || '100'}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-zinc-600 block uppercase font-bold">Apt</span>
                    <span className="font-semibold text-zinc-200">{item.aperture || 'f/1.8'}</span>
                  </div>
                </div>

                <div className="h-px bg-[#FFEEB7]/10" />

                {/* Micro-interactive Action Controls */}
                <div className="flex justify-between items-center pt-1 relative">
                  {/* "Update Media" control is clean, micro-interactive */}
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-[9px] font-mono text-zinc-400 hover:text-[#FFDA03] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                    title="Update media asset or modify textual descriptors instantly"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Update Media
                  </button>

                  {/* "Delete Element" with high-security secondary confirmation inline structure */}
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-2 bg-red-950/90 border border-red-500 p-1.5 absolute right-0 bottom-[-5px] z-20 animate-fadeIn text-[8px] font-mono uppercase tracking-widest">
                      <span className="text-red-300 font-bold">Confirm?</span>
                      <button 
                        onClick={() => confirmDelete(item.id, item.title)}
                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 uppercase tracking-tighter"
                      >
                        Wipe
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-zinc-400 hover:text-white px-1 font-semibold"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteTrigger(item.id)}
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-500 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all duration-300"
                      title="Permanently erase element from production channels"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Element
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
