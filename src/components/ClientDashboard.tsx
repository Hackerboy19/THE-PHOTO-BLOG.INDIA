import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getClientProjects, 
  saveClientProject,
  subscribeToClientProject
} from '../lib/firebase';
import { ClientProject, ClientFeedbackComment, ClientProofStill } from '../types';
import { 
  Play, 
  Pause, 
  MessageSquare, 
  Send, 
  LogOut, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  ShieldCheck, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  FileText, 
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

// Central Sound Synthesizer Engine using Web Audio API
export class AudioSynth {
  private static ctx: AudioContext | null = null;
  private static mutedKey = 'tpb_is_muted_soundscape';

  static isMuted(): boolean {
    const val = localStorage.getItem(this.mutedKey);
    return val === null ? true : val === 'true'; // Muted by default to respect autoplay guidelines
  }

  static setMuted(muted: boolean) {
    localStorage.setItem(this.mutedKey, muted ? 'true' : 'false');
  }

  static playClick() {
    if (this.isMuted()) return;
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      if (!this.ctx) this.ctx = new AudioClass();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }

  static playSuccess() {
    if (this.isMuted()) return;
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      if (!this.ctx) this.ctx = new AudioClass();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.frequency.setValueAtTime(520, ctx.currentTime);
      osc1.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      osc2.frequency.setValueAtTime(1040, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  }

  static playShutter() {
    if (this.isMuted()) return;
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      if (!this.ctx) this.ctx = new AudioClass();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 1.0;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
      
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      whiteNoise.start();
      whiteNoise.stop(ctx.currentTime + 0.12);
    } catch (_) {}
  }

  static playTapeRoll() {
    if (this.isMuted()) return;
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      if (!this.ctx) this.ctx = new AudioClass();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (_) {}
  }
}

export default function ClientDashboard() {
  const [clientId, setClientId] = useState('');
  const [activeProject, setActiveProject] = useState<ClientProject | null>(null);
  const [allProjects, setAllProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [isMuted, setIsMuted] = useState(AudioSynth.isMuted());

  // Input states for comment submissions
  const [commentText, setCommentText] = useState('');
  const [commentTime, setCommentTime] = useState('00:00');
  
  // Custom draft photo upload feedback state
  const [approvedStills, setApprovedStills] = useState<Record<string, boolean>>({});

  // Before/after comparison states
  const [compareSliderVal, setCompareSliderVal] = useState(50);
  const [selectedCompareIdx, setSelectedCompareIdx] = useState(0);

  // Video Ref for smart timestamp tracking
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadData() {
      const list = await getClientProjects();
      setAllProjects(list);
      setIsLoading(false);

      // Check if Client ID is shared in URL (?client=TPB-CLIENT-85 or ?project=TPB-CLIENT-85)
      const params = new URLSearchParams(window.location.search);
      const code = (params.get('project') || params.get('client'))?.trim().toUpperCase();
      if (code) {
        setClientId(code);
        const match = list.find(x => x.id.toUpperCase() === code);
        if (match) {
          setActiveProject(match);
        } else {
          setErrorText(`Access ID "${code}" was not recognized, please enter manually below.`);
        }
      }
    }
    loadData();
  }, []);

  // Real-time synchronization binding for live instant-pushed updates
  useEffect(() => {
    if (!activeProject?.id) return;
    
    const unsubscribe = subscribeToClientProject(activeProject.id, (updatedProj) => {
      if (updatedProj) {
        setActiveProject(updatedProj);
      }
    });
    
    return () => unsubscribe();
  }, [activeProject?.id]);

  const handleSoundToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    AudioSynth.setMuted(nextMute);
    if (!nextMute) {
      AudioSynth.playClick();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    AudioSynth.playClick();
    setErrorText('');

    const targetId = clientId.trim().toUpperCase();
    if (!targetId) return;

    const matched = allProjects.find(x => x.id.toUpperCase() === targetId);
    if (matched) {
      setActiveProject(matched);
      AudioSynth.playSuccess();
      
      // Update browser URL query search param beautifully without hard reloading
      const url = new URL(window.location.href);
      url.searchParams.set('project', targetId);
      window.history.pushState({}, '', url);
    } else {
      setErrorText(`Passcode/Access ID state is unrecognized. Try the sandbox credential "TPB-CLIENT-85".`);
    }
  };

  const handleLogout = () => {
    AudioSynth.playClick();
    setActiveProject(null);
    setClientId('');
    
    // Clear url query
    const url = new URL(window.location.href);
    url.searchParams.delete('client');
    url.searchParams.delete('project');
    window.history.pushState({}, '', url);
  };

  const captureVideoTime = () => {
    if (videoRef.current) {
      const sec = Math.floor(videoRef.current.currentTime);
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      setCommentTime(`${m}:${s}`);
      AudioSynth.playShutter();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !commentText.trim()) return;

    AudioSynth.playClick();
    
    const newComment: ClientFeedbackComment = {
      id: `comment-${Date.now()}`,
      timestamp: commentTime,
      author: activeProject.clientName,
      text: commentText.trim(),
      createdDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedProject = {
      ...activeProject,
      feedbackComments: [newComment, ...activeProject.feedbackComments]
    };

    setActiveProject(updatedProject);
    setCommentText('');
    setCommentTime('00:00');

    // Save to Firestore/LocalStorage
    await saveClientProject(updatedProject);
    AudioSynth.playSuccess();
  };

  const handleToggleStillApproval = async (stillId: string) => {
    if (!activeProject) return;
    AudioSynth.playShutter();

    const isCurrentlyApproved = approvedStills[stillId];
    const nextApproved = !isCurrentlyApproved;
    
    setApprovedStills(prev => ({
      ...prev,
      [stillId]: nextApproved
    }));

    const updatedStills = activeProject.proofStills.map((s: ClientProofStill) => {
      if (s.id === stillId) {
        return {
          ...s,
          feedback: nextApproved ? "APPROVED STILL FOR MASTER EDIT" : undefined
        };
      }
      return s;
    });

    const updatedProject = {
      ...activeProject,
      proofStills: updatedStills
    } as ClientProject;

    setActiveProject(updatedProject);
    await saveClientProject(updatedProject);
  };

  // Milestones sequence for interactive checklist pipeline
  const milestones = [
    { name: 'Scripting', desc: 'Concept, treatments, co-directed frames & scripting blocks' },
    { name: 'Moodboard', desc: 'Aesthetic profiling, uncompressed palette boards & location scapes' },
    { name: 'Production', desc: 'Principal cameras rolling down at Jaipur HQ and regional sets' },
    { name: 'Post-Prod Edit', desc: 'Cinema grading sequence, raw audio textures & vertical framing' },
    { name: 'Final Review', desc: 'Draft screening, client approval check & asset syndication' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-zinc-500 font-mono text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-white mb-2" />
        LOADING SECURE DIGITAL CLIENT HUB...
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[#030303] text-white">
      {/* Top Banner Context Header */}
      <div className="border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center bg-[#070707] no-print">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
            STUDIO PRODUCER ROOM v2.1
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleSoundToggle}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1.5"
            title={isMuted ? "Unmute atmospheric feedback clicks" : "Mute audio synthesizer feedback"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-600" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          
          {activeProject && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeProject ? (
          /* Secure Key Entrance Form Display */
          <motion.div
            key="login-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto py-24 px-6 text-center space-y-8"
          >
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-zinc-300" />
              </div>
              <h2 className="text-2xl font-serif tracking-tight">Client Pre-Production Access</h2>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed font-sans">
                Enter your unique pre-production tracking key or passcode to view draft deliverables, review timelines, and submit frame notes.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full bg-[#070707] border border-white/10 text-white p-3.5 font-mono text-center text-sm uppercase tracking-widest focus:border-white focus:outline-none placeholder-zinc-700"
                  placeholder="e.g. TPB-CLIENT-XX"
                  required
                />
              </div>

              {errorText && (
                <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-3 text-xs font-mono tracking-wide uppercase flex items-center gap-2 text-left rounded-none">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black py-3 px-6 font-mono text-[10px] tracking-widest uppercase transition-all font-bold cursor-pointer"
              >
                Establish Secure Session
              </button>
            </form>

            <div className="bg-[#070707] border border-white/5 p-4 text-left space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-[#00a884] uppercase font-bold block">
                ✦ Sandbox Environment Active
              </span>
              <p className="text-[11px] text-zinc-400 font-sans leading-normal">
                You can authenticate instantly using the preloaded mock passcode <strong className="text-white font-mono uppercase bg-zinc-900 px-1 py-0.5">TPB-CLIENT-85</strong> to preview Muskan Mundhra's "Heritage Elegance Campaign."
              </p>
            </div>
          </motion.div>
        ) : (
          /* Active Client Dashboard Screen */
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto py-12 px-6 md:px-12 space-y-12"
          >
            {/* Project Banner Title Card */}
            <div className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 bg-zinc-950 border border-white/5 px-2 py-0.5">
                    Live Client Portal
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00a884] px-1">
                    • Securely Synchronised
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight">
                  {activeProject.projectName}
                </h1>
                <p className="text-xs text-zinc-400 font-sans">
                  Account Owner: <strong className="text-white font-medium">{activeProject.clientName}</strong> • Managed by Muskan
                </p>
              </div>

              <div className="text-left md:text-right font-mono text-[11px] text-zinc-500 space-y-1 bg-[#070707] border border-white/5 p-4 min-w-[200px]">
                <div className="flex justify-between md:block">
                  <span className="text-zinc-500 uppercase tracking-widest block text-[9px] mb-0.5">EST. CLIENT KEY</span>
                  <span className="text-white font-bold">{activeProject.id}</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between md:block">
                  <span className="text-zinc-500 uppercase tracking-widest block text-[9px] mb-0.5">LAST SYNCED</span>
                  <span className="text-zinc-300 font-semibold">{activeProject.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Timelines Tracker Pipeline Section */}
            <div className="space-y-6 text-left">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 block">
                  Stage 01 // Interactive Pipeline
                </span>
                <h3 className="text-xl font-serif text-white mt-1">Pre-Production Milestone Progress</h3>
              </div>

              {/* Progress Percentage Micro-Indicator */}
              <div className="bg-[#070707] border border-white/5 p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider">
                    <span className="text-zinc-400">Campaign Readiness Score</span>
                    <span className="text-white font-bold">{activeProject.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activeProject.progressPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>

                {/* Horizon Grid Timeline blocks */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {milestones.map((m, idx) => {
                    // Decide block statuses
                    const currentIndex = milestones.findIndex(msVal => msVal.name === activeProject.currentMilestone);
                    const isCompleted = idx < currentIndex || (idx === currentIndex && activeProject.milestoneStatus === 'completed');
                    const isInProgress = idx === currentIndex && activeProject.milestoneStatus === 'in-progress';
                    const isPending = idx > currentIndex;

                    return (
                      <div
                        key={m.name}
                        onClick={() => {
                          AudioSynth.playClick();
                        }}
                        className={`border p-4 transition-all text-left relative overflow-hidden cursor-pointer ${
                          isInProgress
                            ? 'bg-zinc-900/60 border-white text-white'
                            : isCompleted
                            ? 'bg-zinc-950/20 border-zinc-700/60 text-zinc-400 hover:border-zinc-500'
                            : 'bg-[#050505] border-white/5 text-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                            0{idx + 1}
                          </span>
                          {isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : isInProgress ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          )}
                        </div>
                        <h4 className="text-xs font-serif text-white font-medium mb-1 tracking-wide">
                          {m.name}
                        </h4>
                        <p className="text-[10px] leading-tight font-sans text-zinc-500 font-light">
                          {m.desc}
                        </p>

                        {/* Beautiful active layout highlights */}
                        {isInProgress && (
                          <div className="absolute left-0 bottom-0 top-0 w-[3px] bg-amber-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Proofing Area and Media Player Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              {/* Draft Video Player and Still approved triggers */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 block">
                    Stage 02 // Proofing Gallery
                  </span>
                  <h3 className="text-xl font-serif text-white mt-1">Cinematic Draft Editorial Preview</h3>
                </div>

                <div className="bg-black border border-white/5 overflow-hidden p-1 relative group">
                  {activeProject.draftVideoUrl ? (
                    <video
                      ref={videoRef}
                      src={activeProject.draftVideoUrl}
                      controls
                      playsInline
                      className="w-full bg-zinc-950 aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <ImageIcon className="w-8 h-8 text-zinc-600" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">DELIVERABLES UNDERWAY</p>
                        <p className="text-[11px] text-zinc-600">The director has not deployed the video draft stream yet. Stills below are active.</p>
                      </div>
                    </div>
                  )}
                  {activeProject.draftVideoUrl && (
                    <div className="p-3 bg-[#070707] flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-500 uppercase text-[9px] tracking-wider">Smart Capture Frame</span>
                      <button
                        onClick={captureVideoTime}
                        className="bg-white/10 hover:bg-white text-zinc-300 hover:text-black py-1 px-3 text-[9px] tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        Grab Playback Timestamp
                      </button>
                    </div>
                  )}
                </div>

                {/* Time-Travel Before/After Comparison Slider */}
                {(() => {
                  const sList = activeProject.proofStills && activeProject.proofStills.length > 0
                    ? activeProject.proofStills
                    : [
                        { id: 'f-1', imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200', label: 'Vintage Heritage Frame' },
                        { id: 'f-2', imageUrl: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=1200', label: 'Gothic Palace Walk' }
                      ];
                  const curStill = sList[Math.min(selectedCompareIdx, sList.length - 1)] || sList[0];
                  return (
                    <div className="bg-zinc-950/60 border border-white/10 p-5 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#00a884] block">✦ Time-Travel Frame Compare</span>
                        <h4 className="text-sm font-serif text-white mt-1">RAW Camera LOG vs Luxury Grade</h4>
                        <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                          Slide dynamically to contrast the flat, unedited camera RAW LOG versus the color-graded premium film look calibrated in-house.
                        </p>
                      </div>

                      {sList.length > 1 && (
                        <div className="flex flex-wrap gap-2 pt-1 border-b border-white/5 pb-3">
                          {sList.map((st, sidx) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => {
                                AudioSynth.playClick();
                                setSelectedCompareIdx(sidx);
                              }}
                              className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider border rounded-none transition cursor-pointer ${
                                selectedCompareIdx === sidx
                                  ? 'bg-white text-black font-bold border-white'
                                  : 'bg-transparent text-zinc-400 border-white/10 hover:text-white hover:border-white/30'
                              }`}
                            >
                              {st.label || `Still ${sidx + 1}`}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="relative aspect-[16/9] w-full bg-zinc-900 border border-white/5 overflow-hidden group select-none">
                        {/* Before: Raw Camera Log look */}
                        <div className="absolute inset-0 w-full h-full">
                          <img
                            src={curStill.imageUrl}
                            alt="Raw Log Look"
                            className="w-full h-full object-cover filter brightness-110 saturate-[0.12] contrast-[0.72] opacity-85"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-3 left-3 bg-black/75 border border-white/10 px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest text-zinc-400">
                            RAW 10-BIT FLAT LOG
                          </div>
                        </div>

                        {/* After: Fully Graded Cinematic Look */}
                        <div 
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{
                            clipPath: `polygon(0 0, ${compareSliderVal}% 0, ${compareSliderVal}% 100%, 0 100%)`
                          }}
                        >
                          <img
                            src={curStill.imageUrl}
                            alt="Signature Color Graded Look"
                            className="w-full h-full object-cover filter saturate-[1.25] contrast-[1.10] brightness-[0.96] hue-rotate-1 group-hover:scale-100 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-3 left-3 bg-white text-black font-black px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest">
                            THE PHOTO BLOG STUDIO GRADE
                          </div>
                        </div>

                        {/* Slider handle */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-white/70 pointer-events-none"
                          style={{ left: `${compareSliderVal}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-black text-black font-mono font-bold text-[8.5px] flex items-center justify-center shadow-lg">
                            ↔
                          </div>
                        </div>

                        {/* Overlay Input Range slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={compareSliderVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCompareSliderVal(val);
                            if (val % 4 === 0) {
                              AudioSynth.playTapeRoll();
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                          title="Drag comparison slider"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Stills Approvals grid */}
                {activeProject.proofStills && activeProject.proofStills.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-zinc-500" /> Proofing Stills Review Grid
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeProject.proofStills.map((still) => {
                        const approved = !!approvedStills[still.id] || !!still.feedback;
                        return (
                          <div 
                            key={still.id}
                            className={`p-3 bg-[#070707] border transition-colors relative group ${
                              approved ? 'border-emerald-500/40 bg-zinc-950/40' : 'border-white/5'
                            }`}
                          >
                            <div className="aspect-[4/3] bg-zinc-900/60 overflow-hidden relative">
                              <img
                                src={still.imageUrl}
                                alt={still.label}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="mt-3 flex justify-between items-start gap-2">
                              <div>
                                <h5 className="text-xs font-mono uppercase tracking-wider text-white">{still.label}</h5>
                                <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-sans">
                                  {approved ? "✓ Snapshot locked in design suite!" : "Review still frame alignment for final render feedback"}
                                </p>
                              </div>
                              <button
                                onClick={() => handleToggleStillApproval(still.id)}
                                className={`text-[9px] font-mono tracking-widest uppercase px-2 py-1 transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                  approved 
                                    ? 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-400' 
                                    : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                              >
                                {approved ? "Approved" : "Approve Frame"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamped Interactive Feedback Comments Thread */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 block">
                    Stage 03 // Realtime Notes
                  </span>
                  <h3 className="text-l font-serif text-white mt-1">Directorial Frame Comments</h3>
                </div>

                <div className="bg-[#070707] border border-white/5 p-4 md:p-6 space-y-6 flex flex-col justify-between min-h-[400px]">
                  {/* Commet thread loop */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {activeProject.feedbackComments.length === 0 ? (
                      <div className="text-center py-12 text-zinc-600 font-mono text-[10px] uppercase space-y-1 my-auto">
                        <MessageSquare className="w-5 h-5 mx-auto text-zinc-700" />
                        <p>Feed list represents zero notes.</p>
                        <p>Submit frame guidelines below.</p>
                      </div>
                    ) : (
                      activeProject.feedbackComments.map((c) => (
                        <div key={c.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0 text-xs">
                          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              <span className="font-bold text-white">{c.author}</span>
                            </div>
                            <span className="text-zinc-600">{c.createdDate}</span>
                          </div>
                          
                          <p className="text-zinc-300 mb-2 mt-1 italic font-sans font-light">
                            "{c.text}"
                          </p>

                          {/* Time code marker */}
                          <div className="flex items-center gap-1 text-[9px] font-mono text-[#00a884] uppercase bg-emerald-950/20 border border-emerald-500/10 px-2 py-0.5 w-fit">
                            <Clock className="w-2.5 h-2.5" /> FRAME TIME REFERENCE: {c.timestamp}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleAddComment} className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex gap-2">
                      <div className="w-24 shrink-0">
                        <label className="block text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Timestamp</label>
                        <input
                          type="text"
                          value={commentTime}
                          onChange={e => setCommentTime(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white p-2 font-mono text-xs focus:border-white focus:outline-none text-center"
                          placeholder="00:00"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Feedback Note</label>
                        <input
                          type="text"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white p-2 text-xs focus:border-white focus:outline-none placeholder-zinc-700"
                          placeholder="Describe frame edit notes..."
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-zinc-200 text-black py-2 px-4 font-mono text-[9px] tracking-widest uppercase transition-all font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Disperse Feed Note
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Aesthetic Guideline Reference */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] text-zinc-500 uppercase tracking-wide font-mono leading-relaxed">
              <div>
                <span className="text-zinc-400 block font-bold mb-1">✦ Pre-Production Client Protocol</span>
                <p>These frames and draft footage represent work-in-progress content and are covered under mutual non-disclosure clauses. Rendered exports compile dynamically on command from Muskan.</p>
              </div>
              <div>
                <span className="text-zinc-400 block font-bold mb-1">✦ Contact Visual Director</span>
                <p>Support coordinates: Muskan Mundhra / campaigns@thephotoblog.india.1. Leave timeline guidelines directly inside comments for immediate team resolution.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
