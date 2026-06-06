import React, { useState, useEffect } from 'react';
import { getWhatsAppConfig, saveWhatsAppConfig, WhatsAppConfig } from '../../lib/firebase';
import { MessageCircle, RefreshCw, Save, Check } from 'lucide-react';

export default function WhatsAppConfigurator() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getWhatsAppConfig();
      setConfig(data);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    try {
      await saveWhatsAppConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
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
          <h2 className="text-xl font-serif text-white tracking-tight">WhatsApp widget blueprint</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Configure live opening hours, followers, and active slogans</p>
        </div>
        <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center bg-[#121b22]">
          <MessageCircle className="w-4.5 h-4.5 text-[#00a884] fill-[#00a884]" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="p-4 bg-[#0a0f12]/50 border border-white/5 space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#00a884] uppercase">Live Instagram Syndicate Follower Stats</h3>
          <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
            Specify the follower count badge value exactly as you want it shown on the profile metadata (e.g. `38K Followers` or `125K Syndicate`).
          </p>
          <div className="max-w-xs">
            <input
              type="text"
              value={config.followers}
              onChange={(e) => setConfig({ ...config, followers: e.target.value })}
              className="w-full bg-zinc-950/80 border border-white/10 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00a884]"
              placeholder="e.g. 38K Followers"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Active Agency Slogan Description
          </label>
          <textarea
            value={config.slogan}
            onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
            rows={3}
            className="w-full bg-zinc-950/70 border border-white/10 p-3 text-sm font-sans tracking-wide leading-relaxed text-zinc-200 focus:outline-none focus:border-white transition-colors"
            placeholder="Introduce your agency story..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Interactive Quote / Tagline
          </label>
          <input
            type="text"
            value={config.quote}
            onChange={(e) => setConfig({ ...config, quote: e.target.value })}
            className="w-full bg-zinc-950/70 border border-white/10 p-3 text-xs font-serif italic text-zinc-300 focus:outline-none focus:border-white transition-colors"
            placeholder="e.g. We thrive to turn your brand into a story..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
              Main Business Hours Schedule
            </label>
            <input
              type="text"
              value={config.hours}
              onChange={(e) => setConfig({ ...config, hours: e.target.value })}
              className="w-full bg-zinc-950/70 border border-white/10 p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-white transition-colors"
              placeholder="e.g. 10:00 am – 6:00 pm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
              Direct Contact Number
            </label>
            <input
              type="text"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              className="w-full bg-zinc-950/70 border border-white/10 p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-white transition-colors"
              placeholder="e.g. 9145961226"
              required
            />
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
            Save Widget Config
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider animate-fadeIn">
              <Check className="w-4 h-4" /> Live Widget Updated Successfully
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
