import React, { useState, useEffect } from 'react';
import { getAboutSettings, saveAboutSettings, AboutSettings } from '../../lib/firebase';
import { Camera, RefreshCw, Save, Check } from 'lucide-react';

export default function AboutEditor() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getAboutSettings();
      setSettings(data);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await saveAboutSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-serif text-white tracking-tight">About backstory & lens telemetry</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Configure narrative copy and camera overlays</p>
        </div>
        <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center bg-zinc-950">
          <Camera className="w-4 h-4 text-[#00a884]" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Brand Backstory Narrative
          </label>
          <textarea
            value={settings.backstory}
            onChange={(e) => setSettings({ ...settings, backstory: e.target.value })}
            rows={5}
            className="w-full bg-zinc-950/70 border border-white/10 p-3 text-sm font-sans tracking-wide leading-relaxed text-zinc-200 focus:outline-none focus:border-white transition-colors"
            placeholder="Introduce your agency story..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Portrait Backdrop Image Link
          </label>
          <input
            type="url"
            value={settings.aboutImage || ''}
            onChange={(e) => setSettings({ ...settings, aboutImage: e.target.value })}
            className="w-full bg-zinc-950/70 border border-white/10 p-3 text-xs font-mono tracking-wider text-zinc-200 focus:outline-none focus:border-white transition-colors"
            placeholder="https://images.unsplash.com/..."
            required
          />
          <span className="text-[10px] text-zinc-500 font-mono">Recommended aspect: vertical ratio for modern editorial balance.</span>
        </div>

        <div className="p-4 bg-[#0c0c0e] border border-white/5 space-y-4">
          <h3 className="text-xs font-mono tracking-widest text-[#00a884] uppercase font-bold">Lens Diagnostics Telemetry Settings</h3>
          <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
            These markings overlay transparently in the About frame, reinforcing the bespoke, hand-crafted architectural look of a real cameraman viewfinder metadata.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase">Shutter Shard</label>
              <input
                type="text"
                value={settings.shutter}
                onChange={(e) => setSettings({ ...settings, shutter: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00a884]"
                placeholder="e.g. 1/250"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase">Sensitivity (ISO)</label>
              <input
                type="text"
                value={settings.iso}
                onChange={(e) => setSettings({ ...settings, iso: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00a884]"
                placeholder="e.g. 100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase">Aperture Size</label>
              <input
                type="text"
                value={settings.aperture}
                onChange={(e) => setSettings({ ...settings, aperture: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00a884]"
                placeholder="e.g. f/1.4"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-white hover:bg-zinc-200 text-black px-6 py-3 font-mono font-bold text-[10px] tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save About Settings
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider animate-fadeIn">
              <Check className="w-4 h-4" /> Diagnostics Updated Successfully
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
