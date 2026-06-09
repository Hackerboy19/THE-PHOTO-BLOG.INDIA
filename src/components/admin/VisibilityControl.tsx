import React, { useState, useEffect } from 'react';
import { getSectionVisibility, saveSectionVisibility, SectionVisibilitySettings } from '../../lib/firebase';
import { Eye, EyeOff, RefreshCw, Save, Check } from 'lucide-react';
import { useShutterSound } from '../../hooks/useShutterSound';

export default function VisibilityControl() {
  const [visibility, setVisibility] = useState<SectionVisibilitySettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const playShutter = useShutterSound();

  useEffect(() => {
    async function load() {
      const data = await getSectionVisibility();
      setVisibility(data);
    }
    load();
  }, []);

  const handleToggle = (key: keyof SectionVisibilitySettings) => {
    if (!visibility) return;
    playShutter();
    setVisibility({
      ...visibility,
      [key]: !visibility[key]
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visibility) return;
    setIsSaving(true);
    try {
      await saveSectionVisibility(visibility);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!visibility) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  const sectionsList: { key: keyof SectionVisibilitySettings; label: string; description: string }[] = [
    { key: 'about', label: 'About Agency / backstory section', description: 'Includes historical backstory copy, vertical background imagery, and physical telemetry status bars' },
    { key: 'services', label: 'High-Spec Services Grid', description: 'Includes core capabilities, performance metrics counters, and detailed list deliverables' },
    { key: 'estimator', label: 'Interactive Campaign Budget Estimator', description: 'Interactive slider calculator containing dynamic base prices, scale and timeline settings' },
    { key: 'whyUs', label: 'Why Choose Us Staggered List', description: 'Trust vector pillars demonstrating custom icon alignments and agency objectives' },
    { key: 'portfolio', label: 'Dynamic Grid Portfolio', description: 'Curated filter buttons, interactive image lights, shutter metadata overlay and details modal' },
    { key: 'testimonials', label: 'Director Endorsements carousel', description: 'Staggered quote frames depicting verified ratings, autor designs, and responsive dot navigations' },
    { key: 'feed', label: 'Instagram Syndicate Feed', description: 'Recent Reels view counts, custom captions, and hover engagement dynamics' },
    { key: 'whatsapp', label: 'Interactive WhatsApp Business Widget', description: 'WhatsApp layout container portraying office operational schedules, current followers and contact tags' },
    { key: 'contact', label: 'Bespoke Inquiry Co-Creation Form', description: 'Dynamic budget dropdown list and direct SMTP contact forms' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-serif text-white tracking-tight">Global section visibility panels</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">Control rendering state of specific blocks in the layout</p>
        </div>
        <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center bg-zinc-950">
          <Eye className="w-4 h-4 text-[#00a884]" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionsList.map(({ key, label, description }) => {
            const isVisible = visibility[key];
            return (
              <div 
                key={key} 
                onClick={() => handleToggle(key)}
                className={`p-4 border transition-all cursor-pointer flex items-start gap-4 select-none ${
                  isVisible 
                    ? 'bg-[#0a0a0d]/90 border-white/10 hover:border-white/20' 
                    : 'bg-zinc-950/40 border-red-500/10 opacity-60 hover:opacity-85'
                }`}
              >
                <div className="mt-0.5">
                  {isVisible ? (
                    <div className="w-5 h-5 bg-emerald-500/15 border border-emerald-500 flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-red-500/15 border border-red-500 flex items-center justify-center">
                      <EyeOff className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                    isVisible ? 'text-zinc-100' : 'text-zinc-500 line-through'
                  }`}>
                    {label}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">{description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center gap-4 animate-fadeIn">
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
            Save Visibility Configurations
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <Check className="w-4 h-4" /> Layout Rules Successfully Engaged
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
