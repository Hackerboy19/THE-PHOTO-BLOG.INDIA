/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Video, Camera, Compass, Users, CheckCircle, ArrowRight, Printer, X, FileText, Share2, Phone } from 'lucide-react';
import { getEstimatorConfig, EstimatorSettings } from '../lib/firebase';
import { usePriceCalculator } from '../hooks/usePriceCalculator';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSynth } from './ClientDashboard';

interface CampaignEstimatorProps {
  onIntegrate: (summary: string, serviceName: string, budgetEstimate: string) => void;
}

export default function CampaignEstimator({ onIntegrate }: CampaignEstimatorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(['cinematic-video']);
  const [campaignScale, setCampaignScale] = useState<'boutique' | 'mid' | 'luxury'>('mid');
  const [timeline, setTimeline] = useState<'fast' | 'standard' | 'retainer'>('standard');
  const [selectedMood, setSelectedMood] = useState<string>('moody-heritage');
  const [selectedStills, setSelectedStills] = useState<number[]>([0, 1, 2, 3]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [estConfig, setEstConfig] = useState<EstimatorSettings | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const moodStillsData: Record<string, Array<{ id: string; label: string; img: string }>> = {
    'brutalist-neon': [
      { id: 'bn-1', label: 'Cyan cyber shadows', img: 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=400' },
      { id: 'bn-2', label: 'Slick neon reflection', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400' },
      { id: 'bn-3', label: 'Raw concrete shapes', img: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=400' },
      { id: 'bn-4', label: 'Industrial cold steel', img: 'https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&q=80&w=400' },
    ],
    'moody-heritage': [
      { id: 'mh-1', label: 'Vintage analog texture', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400' },
      { id: 'mh-2', label: 'Gothic architecture angle', img: 'https://images.unsplash.com/photo-1471180625745-944903837c22?auto=format&fit=crop&q=80&w=400' },
      { id: 'mh-3', label: 'Faded mahogany details', img: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=400' },
      { id: 'mh-4', label: 'Analogue vehicle shadows', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=400' },
    ],
    'gloss-luxury': [
      { id: 'gl-1', label: 'Soft backlit satin bloom', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=400' },
      { id: 'gl-2', label: 'Polished brand showcase', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400' },
      { id: 'gl-3', label: 'Clean marble product balance', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400' },
      { id: 'gl-4', label: 'Refracted crystal prisms', img: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=400' },
    ]
  };

  useEffect(() => {
    setSelectedStills([0, 1, 2, 3]);
  }, [selectedMood]);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const activeConfig = await getEstimatorConfig();
        setEstConfig(activeConfig);
      } catch (err) {
        console.warn("Could not retrieve dynamic pricing config:", err);
      }
    }
    fetchPricing();
  }, []);

  const servicesList = useMemo(() => {
    const videoBase = estConfig?.basePrices?.['cinematic-video'] ?? 1500;
    const photoBase = estConfig?.basePrices?.['editorial-photo'] ?? 800;
    const reelsBase = estConfig?.basePrices?.['reels-vertical'] ?? 600;
    const collabBase = estConfig?.basePrices?.['creator-collab'] ?? 1200;

    return [
      { id: 'cinematic-video', label: 'Cinematic Video Campaign', icon: Video, basePrice: videoBase, desc: '4K commercial video with custom color-grading' },
      { id: 'editorial-photo', label: 'Editorial Visual Stills', icon: Camera, basePrice: photoBase, desc: 'Premium lifestyle and campaign photography' },
      { id: 'reels-vertical', label: 'High-Retention Reels', icon: Sparkles, basePrice: reelsBase, desc: 'Highly punchy social vertical video formats' },
      { id: 'creator-collab', label: 'Creator & Brand Synergy', icon: Users, basePrice: collabBase, desc: 'Curated influencer scouting and production alignment' },
    ];
  }, [estConfig]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(s => s !== id);
      }
      return [...prev, id];
    });
  };

  const priceStats = usePriceCalculator(
    estConfig,
    selectedServices,
    campaignScale,
    timeline,
    100, // Debounce 100ms for smooth transitions
    currency
  );

  const calculatedMetrics = useMemo(() => {
    let gearSpec = '';
    let crewSize = '';
    let scaleLabel = '';

    if (campaignScale === 'boutique') {
      scaleLabel = 'Boutique Highlight';
      gearSpec = 'Sony FX6 Cinema Package & Premium Prime Lenses';
      crewSize = '3 Cinematic Creative Specialists';
    } else if (campaignScale === 'mid') {
      scaleLabel = 'Premium Brand Showcase';
      gearSpec = 'RED V-Raptor / Sony FX9 multicam & G-Master Prime Optics';
      crewSize = '5 Custom Production & Lighting Crew';
    } else {
      scaleLabel = 'National Digital Takeover';
      gearSpec = 'ARRI Alexa Mini LF / RED Raptor VV, Anamorphic lenses, Full Dolly Setup';
      crewSize = '9+ Creative Director, Master Colorist, Gaffers & Sound Engineer';
    }

    return {
      gearSpec,
      crewSize,
      scaleLabel,
      range: priceStats.rangeText,
    };
  }, [campaignScale, priceStats.rangeText]);

  const handleApplyToForm = () => {
    const serviceNames = selectedServices
      .map(s => servicesList.find(item => item.id === s)?.label)
      .filter(Boolean)
      .join(', ');

    const scaleText = campaignScale === 'boutique' ? 'Boutique Scale' : campaignScale === 'mid' ? 'Premium Scale' : 'Luxury National Scale';
    const timelineText = timeline === 'fast' ? 'Rush delivery (< 2 weeks)' : timeline === 'standard' ? 'Standard (4-6 weeks)' : 'Long-term Retainer';
    const moodLabel = selectedMood === 'brutalist-neon' ? 'Brutalist Neon' : selectedMood === 'moody-heritage' ? 'Moody Heritage' : 'High-Gloss Luxury';
    
    // Read corresponding selected moodboard stills
    const activeStills = moodStillsData[selectedMood] || [];
    const canvasAssets = selectedStills.length > 0 
      ? ` [Moodboard Stills: ${selectedStills.map(idx => activeStills[idx]?.label).join(' | ')}]` 
      : '';

    const summary = `Selected Campaign Elements: ${serviceNames}. Scale: ${scaleText}. Schedule: ${timelineText}. Creative Aesthetic Vibe: ${moodLabel}${canvasAssets}. Projected Specs: ${calculatedMetrics.crewSize} using ${calculatedMetrics.gearSpec}.`;
    
    onIntegrate(summary, serviceNames, priceStats.rangeText);
  };

  const handleWhatsAppShare = () => {
    const selectedLabels = selectedServices
      .map(s => servicesList.find(item => item.id === s)?.label)
      .filter(Boolean)
      .join(', ');

    const scaleText = campaignScale === 'boutique' ? 'Boutique Highlight' : campaignScale === 'mid' ? 'Premium Brand Showcase' : 'National Digital Takeover';
    const scheduleText = timeline === 'fast' ? 'Rush delivery (< 2 weeks)' : timeline === 'standard' ? 'Standard (4-6 weeks)' : 'Long-term Retainer';
    const moodLabel = selectedMood === 'brutalist-neon' ? 'Brutalist Neon' : selectedMood === 'moody-heritage' ? 'Moody Heritage' : 'High-Gloss Luxury';

    const activeStills = moodStillsData[selectedMood] || [];
    const canvasAssets = selectedStills.length > 0 
      ? `\n✦ MOODBOARD TILES: ${selectedStills.map(idx => activeStills[idx]?.label).join(' | ')}`
      : '';

    const text = `Hi Muskan! We just configured a custom photoshoot/videography campaign on your estimator:
  
✦ DELIVERABLES: ${selectedLabels}
✦ DIRECTING SCALE: ${scaleText}
✦ PRODUCTION WINDOW: ${scheduleText}
✦ CREATIVE ATMOSPHERE: ${moodLabel}${canvasAssets}
✦ PROJECTED INVESTMENT: ${priceStats.rangeText}
✦ EXPECTED CREW: ${calculatedMetrics.crewSize}
✦ EXPECTED CAMERA RIG: ${calculatedMetrics.gearSpec}
  
We'd love to lock in our package and schedule an introduction call!`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/919145961226?text=${encodedText}`, '_blank');
  };

  return (
    <div className="w-full bg-[#0a0a0a] border border-faint p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Interactive Options */}
        <div className="flex-1 space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Step 01 / Configurator</span>
            <h3 className="text-2xl font-serif text-white mt-1">Design Your Visual Objective</h3>
            <p className="text-xs text-zinc-400 mt-1">Select the core building blocks for your cinematic campaign package.</p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono block">Core Deliverables (Select all that apply)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {servicesList.map(s => {
                const IconComponent = s.icon;
                const isSelected = selectedServices.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`flex items-start text-left p-4 border transition-all ${
                      isSelected
                        ? 'bg-zinc-900/80 border-white'
                        : 'bg-[#060606] border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className={`p-2 mr-3 transition-colors ${isSelected ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-sans font-medium tracking-wide ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{s.label}</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-tight">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Campaign Scale */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono block">Campaign Directing Scale</span>
              <div className="flex bg-[#070707] p-1 border border-zinc-900">
                {(['boutique', 'mid', 'luxury'] as const).map(scale => (
                  <button
                    key={scale}
                    onClick={() => setCampaignScale(scale)}
                    className={`flex-1 text-[10px] uppercase tracking-widest py-2 font-mono transition-all ${
                      campaignScale === scale
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Timeline */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono block">Production Window</span>
              <div className="flex bg-[#070707] p-1 border border-zinc-900">
                {(['fast', 'standard', 'retainer'] as const).map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setTimeline(time);
                      AudioSynth.playClick();
                    }}
                    className={`flex-1 text-[10px] uppercase tracking-widest py-2 font-mono transition-all cursor-pointer ${
                      timeline === time
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {time === 'fast' ? 'Rush' : time === 'standard' ? 'Standard' : 'Retainer'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Moodboard Selection */}
          <div className="space-y-6 pt-6 border-t border-zinc-900">
            <div>
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono block">Step 02 / Creative Aesthetic Canvas</span>
              <h4 className="text-sm font-serif text-white mt-1">Determine Creative Vibe</h4>
              <p className="text-[11px] text-zinc-400 font-light mt-0.5 leading-normal">Select a curated palette format. This determines set construction styling, cameras and color curves.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { 
                  id: 'brutalist-neon', 
                  label: 'Brutalist Neon', 
                  desc: 'High contrast shadowplay, cyber tints, dramatic backlight, industrial raw accents.',
                  img: 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=350'
                },
                { 
                  id: 'moody-heritage', 
                  label: 'Moody Heritage', 
                  desc: 'Warm analogue tones, rich texture grains, sepia highlight bleed, cinematic nostalgia.',
                  img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=350'
                },
                { 
                  id: 'gloss-luxury', 
                  label: 'High-Gloss Luxury', 
                  desc: 'Soft golden hours, ultra-sharp detail structures, immaculate studio balance, dreamlike bloom.',
                  img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=350'
                }
              ].map(mood => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      setSelectedMood(mood.id);
                      AudioSynth.playShutter();
                    }}
                    className={`flex flex-col text-left border relative overflow-hidden transition-all group cursor-pointer ${
                      isSelected ? 'border-white bg-zinc-900/60' : 'border-zinc-900 bg-[#060606] hover:border-zinc-800'
                    }`}
                  >
                    <div className="aspect-[16/10] overflow-hidden relative w-full bg-zinc-950">
                      <img 
                        src={mood.img} 
                        alt={mood.label} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80" 
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[9px] font-mono tracking-widest text-black bg-white select-none px-2 py-1 font-bold">
                            ACTIVE PROFILE
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <h5 className="text-[11px] font-mono uppercase font-bold text-white tracking-wide">{mood.label}</h5>
                      <p className="text-[10px] text-zinc-500 font-sans leading-tight font-light">{mood.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Moodboard Tile Builder step */}
            <div className="border border-white/5 bg-black/40 p-4 space-y-3.5">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#00a884] font-mono block">Canvas Builder // Interactive Tactile Selection</span>
                <h5 className="text-xs font-serif text-zinc-300 mt-1">Refine Aesthetic Board</h5>
                <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">Toggle individual mood stills to customize your pre-production editorial profile.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {(moodStillsData[selectedMood] || []).map((still, idx) => {
                  const isIncluded = selectedStills.includes(idx);
                  return (
                    <button
                      key={still.id}
                      type="button"
                      onClick={() => {
                        AudioSynth.playClick();
                        setSelectedStills(prev => {
                          if (prev.includes(idx)) {
                            if (prev.length === 1) return prev; // Keep at least one
                            return prev.filter(x => x !== idx);
                          }
                          return [...prev, idx].sort((a,b)=>a-b);
                        });
                      }}
                      className={`relative aspect-[4/3] overflow-hidden group text-left border transition-all ${
                        isIncluded 
                          ? 'border-white filter-none' 
                          : 'border-zinc-900 opacity-40 hover:opacity-75 grayscale'
                      }`}
                    >
                      <img 
                        src={still.img} 
                        alt={still.label} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-2">
                        <span className="text-[7.5px] font-mono uppercase text-zinc-400 truncate tracking-wide bg-black/40 px-1 py-0.5 rounded-none">{still.label}</span>
                      </div>
                      <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 border border-white flex items-center justify-center text-[8px] font-mono font-bold bg-black text-white">
                        {isIncluded ? '✓ font-bold' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="w-full lg:w-80 flex flex-col justify-between bg-[#0e0e0e] border border-faint p-6 relative">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono block">Project Estimate</span>
                
                {/* Instant Currency Toggle switch */}
                <div className="flex bg-[#070707] border border-zinc-800 p-0.5 text-[9px] font-mono rounded-none">
                  <button
                    type="button"
                    onClick={() => { setCurrency('INR'); AudioSynth.playClick(); }}
                    className={`px-2 py-0.5 uppercase transition-all tracking-wider font-bold cursor-pointer ${currency === 'INR' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                  >
                    INR
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrency('USD'); AudioSynth.playClick(); }}
                    className={`px-2 py-0.5 uppercase transition-all tracking-wider font-bold cursor-pointer ${currency === 'USD' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                  >
                    USD
                  </button>
                </div>
              </div>
              
              {/* Animated value rollout */}
              <motion.div 
                key={priceStats.rangeText} 
                initial={{ opacity: 0, y: -4 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-3xl font-serif text-white tracking-tight mt-1"
              >
                {calculatedMetrics.range}
              </motion.div>
              <p className="text-[11px] text-zinc-500 mt-1">Estimated comprehensive creative investment *</p>
            </div>

            <div className="h-px bg-zinc-900" />

            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-400 mt-0.5 mr-2 shrink-0" />
                <div>
                  <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">CREW SPECIFICATION</h5>
                  <p className="text-xs text-zinc-300 mt-0.5">{calculatedMetrics.crewSize}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-400 mt-0.5 mr-2 shrink-0" />
                <div>
                  <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">CAMERA & LIGHTING RIG</h5>
                  <p className="text-xs text-zinc-300 mt-0.5">{calculatedMetrics.gearSpec}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-400 mt-0.5 mr-2 shrink-0" />
                <div>
                  <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">DISTRIBUTION SUITE</h5>
                  <p className="text-xs text-zinc-300 mt-0.5">Optimized cinema grading + 9:16 social cut files as standard</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 space-y-2.5">
            <button
              onClick={handleApplyToForm}
              className="w-full flex items-center justify-center bg-white hover:bg-zinc-200 text-black py-2.5 px-4 font-mono text-[10px] tracking-widest uppercase transition-all active:scale-98 cursor-pointer gap-2"
            >
              Apply to Inquiry Form
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-white text-zinc-300 py-2 px-1 text-[9px] uppercase font-mono tracking-wider transition-colors cursor-pointer"
              >
                <Phone className="w-3 h-3 text-[#00a884]" /> WhatsApp
              </button>

              <button
                onClick={() => setShowQuoteModal(true)}
                className="flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-white text-zinc-300 py-2 px-1 text-[9px] uppercase font-mono tracking-wider transition-colors cursor-pointer"
              >
                <FileText className="w-3 h-3" /> PDF Quote
              </button>
            </div>

            <p className="text-[9px] text-zinc-600 text-center mt-3 leading-normal font-mono uppercase">
              * Investment custom evaluated following script selection and directorial layout.
            </p>
          </div>
        </div>

      </div>

      {/* PDF CLIENT INVOICE MODAL BACKPLANE */}
      <AnimatePresence>
        {showQuoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {/* Custom Dynamic Print Stylesheet */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #thephotoblog-print-sheet, #thephotoblog-print-sheet * {
                  visibility: visible !important;
                }
                #thephotoblog-print-sheet {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  background: white !important;
                  color: black !important;
                  padding: 40px !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}} />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#09090b] border border-zinc-800 p-6 md:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-4 right-4 no-print">
                <button 
                  onClick={() => setShowQuoteModal(false)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Area */}
              <div id="thephotoblog-print-sheet" className="space-y-6 font-mono text-zinc-300">
                <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-xl font-serif text-white italic tracking-wider">THE PHOTO BLOG.INDIA.1</h1>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">Premium Visual Syndication & Editorial Production</p>
                  </div>
                  <div className="text-right text-[10px] text-zinc-500 space-y-0.5">
                    <p>DOC-ID: TPBI-{Math.floor(Math.random() * 90000) + 10000}</p>
                    <p>DATE: {new Date().toLocaleDateString('en-IN', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                    <p>HQ: JAIPUR, RAJASTHAN, INDIA</p>
                  </div>
                </div>

                <div className="bg-[#050507] border border-zinc-900 p-4 space-y-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1.5 font-bold">
                    Campaign Scope Summary
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Directing Scale Factor:</span>
                      <span className="text-white font-bold capitalize">{campaignScale} Scale ({campaignScale === 'boutique' ? 'Boutique' : campaignScale === 'mid' ? 'Premium' : 'Luxury National'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Production Schedule:</span>
                      <span className="text-white font-bold capitalize">{timeline} Timeline</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Crew Deployment:</span>
                      <span className="text-white font-semibold">{calculatedMetrics.crewSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Camera Rig Spec:</span>
                      <span className="text-white font-semibold">{calculatedMetrics.gearSpec}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1.5 font-bold">
                    Itemized Deliverables & Co-Directing Estimates
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 text-left">
                        <th className="py-2">Component</th>
                        <th className="py-2 text-right">Baseline Range Estimator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-950">
                      {selectedServices.map(sid => {
                        const sObj = servicesList.find(x => x.id === sid);
                        if (!sObj) return null;
                        return (
                          <tr key={sid} className="text-zinc-300">
                            <td className="py-2.5">
                              <span className="text-white font-semibold block">{sObj.label}</span>
                              <span className="text-[10px] text-zinc-500 font-sans block mt-0.5 leading-none">{sObj.desc}</span>
                            </td>
                            <td className="py-2.5 text-right font-mono font-bold align-top">
                              ${sObj.basePrice.toLocaleString()} Ref USD
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex flex-col items-end space-y-2">
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">PROJECT INVESTMENT PROFILE</span>
                    <div className="text-2xl font-serif font-bold text-white tracking-tight">{priceStats.rangeText}</div>
                    <p className="text-[9px] text-[#00a884] uppercase tracking-widest">Converted dynamically from dynamic Daily USD rates (1 USD = ₹{priceStats.exchangeRate.toFixed(2)} INR)</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 grid grid-cols-2 gap-4 text-[9px] text-zinc-500 uppercase leading-relaxed font-mono">
                  <div>
                    <span className="text-zinc-400 block font-bold mb-1">✦ DIRECTORIAL POLICY</span>
                    <p>All cinematic elements represent raw baseline budgets. Retainers require signed contracts and script locks prior to crew rollout.</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-bold mb-1">✦ AGENCY SIGNATURE</span>
                    <p className="mt-2 text-zinc-300 italic font-serif">thephotoblog.india.1 / Muskan Mundhra</p>
                    <p className="text-[8px] tracking-widest mt-0.5 font-sans">Campaign Director & Visual Lead</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3 no-print">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-400 py-2.5 px-6 text-[10px] tracking-widest uppercase font-mono transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-white hover:bg-zinc-200 text-black py-2.5 px-6 text-[10px] tracking-widest uppercase font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
