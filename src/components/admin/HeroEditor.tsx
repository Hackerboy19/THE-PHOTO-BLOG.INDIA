import React, { useState, useEffect } from 'react';
import { getHeroData, saveHeroData, HeroSettings } from '../../lib/firebase';
import { Save, RefreshCw, AlertCircle, PlayCircle, Image, Sparkles } from 'lucide-react';

export default function HeroEditor() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHeroData();
        setHero(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;
    setSaving(true);
    setMsg(null);
    try {
      await saveHeroData(hero);
      setMsg({ type: 'success', text: 'Hero setting signature updated and deployed!' });
      // Clear message after 3 seconds
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Verification Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Restore original state settings coordinates?")) {
      setHero({
        backgroundImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000",
        videoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761",
        sloganTitle: "We turn your brand into a cinematic story.",
        sloganSubtitle: "Rajasthan-rooted, nation-directing new-age creative agency engineering social performance & brand aesthetics."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-zinc-500 font-mono text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-white" />LOADING COORDINATES...
      </div>
    );
  }

  if (!hero) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-serif text-white tracking-tight">Hero Section Configurations</h3>
        <p className="text-xs text-zinc-500 font-mono tracking-wide mt-1">
          Adjust background artwork, auto-playing video streams, and overlay typography.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form panel left */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Hero Title Slogan</label>
            <input
              type="text"
              value={hero.sloganTitle}
              onChange={e => setHero({ ...hero, sloganTitle: e.target.value })}
              className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Sub-Slogan Narration</label>
            <textarea
              value={hero.sloganSubtitle}
              onChange={e => setHero({ ...hero, sloganSubtitle: e.target.value })}
              className="w-full h-24 bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none font-sans leading-relaxed resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Background Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={hero.backgroundImage}
                onChange={e => setHero({ ...hero, backgroundImage: e.target.value })}
                className="flex-1 bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none font-mono"
                required
              />
            </div>
            <p className="text-[9px] text-zinc-650 font-mono uppercase">Unsplash high-resolution photography stream recommended</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">Background Loop Video URL (MP4 Direct link)</label>
            <input
              type="url"
              value={hero.videoUrl}
              onChange={e => setHero({ ...hero, videoUrl: e.target.value })}
              className="w-full bg-[#050507] border border-white/10 focus:border-white text-white p-2.5 text-xs focus:outline-none font-mono"
              required
            />
            <p className="text-[9px] text-zinc-650 font-mono uppercase">Direct MP4 or Vimeo CDN-external link path</p>
          </div>
        </div>

        {/* Real-time preview right */}
        <div className="bg-[#0e0e11] border border-white/5 p-5 flex flex-col justify-between overflow-hidden relative">
          <div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">LIVE WORKSPACE PREVIEW</span>
            
            <div className="aspect-[16/9] w-full border border-white/10 relative overflow-hidden bg-black flex items-center justify-center group">
              
              {/* Image background block */}
              <img 
                src={hero.backgroundImage} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-40" 
                alt="Preview Background"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800";
                }}
              />

              {/* Muted video preview helper if active */}
              {hero.videoUrl && (
                <div className="absolute top-2 right-2 bg-black/85 border border-white/10 px-2 py-0.5 rounded-none flex items-center gap-1">
                  <PlayCircle className="w-3 h-3 text-[#00a884] animate-pulse" />
                  <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white">Cinematics Active</span>
                </div>
              )}

              {/* Foreground content layout preview */}
              <div className="relative p-4 text-center z-10 w-full">
                <h4 className="text-sm font-serif text-white leading-tight font-semibold tracking-tight uppercase line-clamp-2">
                  {hero.sloganTitle}
                </h4>
                <p className="text-[9px] text-zinc-300 mt-1 line-clamp-2">
                  {hero.sloganSubtitle}
                </p>
              </div>

            </div>
          </div>

          <div className="mt-6 p-3 bg-zinc-950 border border-white/5 space-y-1 font-mono text-[9px] text-zinc-500">
            <span className="text-zinc-400 block font-sans">✦ Real-time Synced Content</span>
            <p>Deploying modifications updates index anchors on the fly for all live displays.</p>
          </div>
        </div>

      </div>

      <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="bg-black border border-zinc-800 hover:border-zinc-100 hover:text-white text-zinc-500 py-2.5 px-4 text-[10px] tracking-widest uppercase font-mono transition-colors cursor-pointer"
        >
          Reset To Original Defaults
        </button>

        <button
          type="submit"
          disabled={saving}
          className="bg-white hover:bg-zinc-200 text-black py-2.5 px-6 text-[10px] tracking-widest uppercase font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Deploy Hero Layout
        </button>
      </div>

    </form>
  );
}
