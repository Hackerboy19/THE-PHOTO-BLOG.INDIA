import React, { useState, useEffect } from 'react';
import { getEstimatorConfig, saveEstimatorConfig, EstimatorSettings } from '../../lib/firebase';
import { Save, RefreshCw, Sliders, DollarSign, Clock, HelpCircle, ShieldAlert } from 'lucide-react';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';

export default function EstimatorConfigurator() {
  const [config, setConfig] = useState<EstimatorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Simulation parameters for real-time live preview
  const [simServices, setSimServices] = useState<string[]>(['cinematic-video']);
  const [simScale, setSimScale] = useState<string>('mid');
  const [simTimeline, setSimTimeline] = useState<string>('standard');

  // Multiplier pricing decoupled hook
  const priceStats = usePriceCalculator(config, simServices, simScale, simTimeline, 150);

  useEffect(() => {
    async function load() {
      try {
        const res = await getEstimatorConfig();
        setConfig(res);
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMsg(null);
    try {
      await saveEstimatorConfig(config);
      setMsg({ type: 'success', text: 'Pricing parameters deployed! Live calculator is matching updated vectors.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Restore original baseline pricing configurations?")) {
      setConfig({
        basePrices: {
          'cinematic-video': 1500,
          'editorial-photo': 800,
          'reels-vertical': 600,
          'creator-collab': 1200,
        },
        scaleMultipliers: {
          'boutique': 0.8,
          'mid': 1.2,
          'luxury': 2.0
        },
        timelineMultipliers: {
          'fast': 1.25,
          'standard': 1.0,
          'retainer': 0.9
        }
      });
    }
  };

  // Live estimate simulator calculation using decoupled hook stats
  const simValue = () => priceStats.rangeText;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-zinc-500 font-mono text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-white" />FETCHING METRIC MATRICES...
      </div>
    );
  }

  if (!config) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-serif text-white tracking-tight">Campaign Price Engine Settings</h3>
        <p className="text-xs text-zinc-500 font-mono tracking-wide mt-1">
          Adjust corporate base campaign fees and directorial package factors. All values are in reference USD (synced to INR factors).
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input variables left */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Base rates */}
          <div className="p-5 bg-[#0b0b0e] border border-white/5 space-y-4">
            <span className="text-[9px] font-mono tracking-widest text-[#00a884] uppercase block border-b border-white/5 pb-2">
              ✦ SECTION 01: BASE COMPONENT HOURLY/PACKAGE FEES (REF USD)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Cinematic Video Campaign</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    value={config.basePrices['cinematic-video'] || 0}
                    onChange={e => setConfig({
                      ...config,
                      basePrices: { ...config.basePrices, 'cinematic-video': Math.max(0, Number(e.target.value)) }
                    })}
                    className="w-full bg-black border border-white/10 focus:border-white text-white pl-7 pr-3 py-2 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Editorial Visual Stills</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    value={config.basePrices['editorial-photo'] || 0}
                    onChange={e => setConfig({
                      ...config,
                      basePrices: { ...config.basePrices, 'editorial-photo': Math.max(0, Number(e.target.value)) }
                    })}
                    className="w-full bg-black border border-white/10 focus:border-white text-white pl-7 pr-3 py-2 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">High-Retention Reels</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    value={config.basePrices['reels-vertical'] || 0}
                    onChange={e => setConfig({
                      ...config,
                      basePrices: { ...config.basePrices, 'reels-vertical': Math.max(0, Number(e.target.value)) }
                    })}
                    className="w-full bg-black border border-white/10 focus:border-white text-white pl-7 pr-3 py-2 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Creator Collaboration Synergy</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    value={config.basePrices['creator-collab'] || 0}
                    onChange={e => setConfig({
                      ...config,
                      basePrices: { ...config.basePrices, 'creator-collab': Math.max(0, Number(e.target.value)) }
                    })}
                    className="w-full bg-black border border-white/10 focus:border-white text-white pl-7 pr-3 py-2 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Multipliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Directing Scale */}
            <div className="p-5 bg-[#0b0b0e] border border-white/5 space-y-4">
              <span className="text-[9px] font-mono tracking-widest text-[#00a884] uppercase block border-b border-white/5 pb-2">
                ✦ SECTION 02: SCALE MULTIPLIERS
              </span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>Boutique Multiplier</span>
                    <span className="text-white font-bold">{config.scaleMultipliers['boutique']}x</span>
                  </div>
                  <input
                    type="range" min="0.4" max="1.5" step="0.05"
                    value={config.scaleMultipliers['boutique'] || 0.8}
                    onChange={e => setConfig({
                      ...config,
                      scaleMultipliers: { ...config.scaleMultipliers, 'boutique': Number(e.target.value) }
                    })}
                    className="w-full accent-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>Premium Multiplier</span>
                    <span className="text-white font-bold">{config.scaleMultipliers['mid']}x</span>
                  </div>
                  <input
                    type="range" min="0.8" max="2.0" step="0.05"
                    value={config.scaleMultipliers['mid'] || 1.2}
                    onChange={e => setConfig({
                      ...config,
                      scaleMultipliers: { ...config.scaleMultipliers, 'mid': Number(e.target.value) }
                    })}
                    className="w-full accent-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>National Multiplier</span>
                    <span className="text-white font-bold">{config.scaleMultipliers['luxury']}x</span>
                  </div>
                  <input
                    type="range" min="1.5" max="3.5" step="0.1"
                    value={config.scaleMultipliers['luxury'] || 2.0}
                    onChange={e => setConfig({
                      ...config,
                      scaleMultipliers: { ...config.scaleMultipliers, 'luxury': Number(e.target.value) }
                    })}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </div>

            {/* Production Multipliers */}
            <div className="p-5 bg-[#0b0b0e] border border-white/5 space-y-4">
              <span className="text-[9px] font-mono tracking-widest text-[#00a884] uppercase block border-b border-white/5 pb-2">
                ✦ SECTION 03: TIMELINE WINDOW FACTORS
              </span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>Rush Delivery</span>
                    <span className="text-white font-bold">{config.timelineMultipliers['fast']}x</span>
                  </div>
                  <input
                    type="range" min="1.0" max="1.8" step="0.05"
                    value={config.timelineMultipliers['fast'] || 1.25}
                    onChange={e => setConfig({
                      ...config,
                      timelineMultipliers: { ...config.timelineMultipliers, 'fast': Number(e.target.value) }
                    })}
                    className="w-full accent-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>Standard Window</span>
                    <span className="text-white font-bold">{config.timelineMultipliers['standard']}x</span>
                  </div>
                  <input
                    type="range" min="0.8" max="1.2" step="0.05"
                    value={config.timelineMultipliers['standard'] || 1.0}
                    onChange={e => setConfig({
                      ...config,
                      timelineMultipliers: { ...config.timelineMultipliers, 'standard': Number(e.target.value) }
                    })}
                    className="w-full accent-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>Retainer Commitment</span>
                    <span className="text-white font-bold">{config.timelineMultipliers['retainer']}x</span>
                  </div>
                  <input
                    type="range" min="0.6" max="1.0" step="0.05"
                    value={config.timelineMultipliers['retainer'] || 0.9}
                    onChange={e => setConfig({
                      ...config,
                      timelineMultipliers: { ...config.timelineMultipliers, 'retainer': Number(e.target.value) }
                    })}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Dynamic simulation sandbox right */}
        <div className="lg:col-span-4 bg-[#0e0e11] border border-white/5 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">INTERACTION SIMULATION SANDBOX</span>
            
            {/* Live calculated price banner */}
            <div className="bg-black border border-white/10 p-4 text-center space-y-1">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Simulated Dynamic Outcome</span>
              <div className="text-2xl font-serif font-bold text-white tracking-tight">{simValue()}</div>
              <p className="text-[9px] text-[#00a884] font-mono uppercase tracking-wide">Calculated at current live coefficients</p>
            </div>

            {/* Sandbox inputs */}
            <div className="space-y-3.5 pt-2 text-left">
              
              {/* Deliverable Select */}
              <div className="space-y-1 text-xs">
                <span className="text-[8px] font-mono text-zinc-400 uppercase block tracking-wider">Test Service Selection</span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={simServices.includes('cinematic-video')}
                      onChange={e => {
                        if (e.target.checked) setSimServices([...simServices, 'cinematic-video']);
                        else if (simServices.length > 1) setSimServices(simServices.filter(x => x !== 'cinematic-video'));
                      }}
                      className="accent-[#00a884]"
                    /> Cinematic Video Campaign
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={simServices.includes('editorial-photo')}
                      onChange={e => {
                        if (e.target.checked) setSimServices([...simServices, 'editorial-photo']);
                        else if (simServices.length > 1) setSimServices(simServices.filter(x => x !== 'editorial-photo'));
                      }}
                      className="accent-[#00a884]"
                    /> Editorial Visual Stills
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={simServices.includes('reels-vertical')}
                      onChange={e => {
                        if (e.target.checked) setSimServices([...simServices, 'reels-vertical']);
                        else if (simServices.length > 1) setSimServices(simServices.filter(x => x !== 'reels-vertical'));
                      }}
                      className="accent-[#00a884]"
                    /> High-Retention Reels
                  </label>
                </div>
              </div>

              {/* Directing Scale select */}
              <div className="space-y-1 text-xs">
                <span className="text-[8px] font-mono text-zinc-400 uppercase block tracking-wider">Test Campaign Scale</span>
                <div className="flex bg-black p-0.5 border border-white/5">
                  {(['boutique', 'mid', 'luxury'] as const).map(scale => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setSimScale(scale)}
                      className={`flex-1 text-[8.5px] uppercase tracking-widest py-1.5 font-mono ${
                        simScale === scale ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>

              {/* Window timeline select */}
              <div className="space-y-1 text-xs">
                <span className="text-[8px] font-mono text-zinc-400 uppercase block tracking-wider">Test Production Window</span>
                <div className="flex bg-black p-0.5 border border-white/5">
                  {(['fast', 'standard', 'retainer'] as const).map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSimTimeline(time)}
                      className={`flex-1 text-[8.5px] uppercase tracking-widest py-1.5 font-mono ${
                        simTimeline === time ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 p-4 bg-zinc-950 border border-white/5 space-y-1.5 font-mono text-[9px] text-zinc-500 text-left">
            <span className="text-zinc-400 block font-sans">✦ Adaptive Client Valuation</span>
            <p className="leading-snug">Estimates are computed automatically using real-time USD/INR baseline exchange factor tracking.</p>
          </div>
        </div>

      </div>

      <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="bg-black border border-zinc-800 hover:border-zinc-100 hover:text-white text-zinc-500 py-2.5 px-4 text-[10px] tracking-widest uppercase font-mono transition-colors cursor-pointer"
        >
          Reset Pricing Backplanes
        </button>

        <button
          type="submit"
          disabled={saving}
          className="bg-white hover:bg-zinc-200 text-black py-2.5 px-6 text-[10px] tracking-widest uppercase font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Deploy Price Parameters
        </button>
      </div>

    </form>
  );
}
