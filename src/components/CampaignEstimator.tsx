/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Video, Camera, Compass, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { getEstimatorConfig, EstimatorSettings } from '../lib/firebase';

interface CampaignEstimatorProps {
  onIntegrate: (summary: string, serviceName: string, budgetEstimate: string) => void;
}

export default function CampaignEstimator({ onIntegrate }: CampaignEstimatorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(['cinematic-video']);
  const [campaignScale, setCampaignScale] = useState<'boutique' | 'mid' | 'luxury'>('mid');
  const [timeline, setTimeline] = useState<'fast' | 'standard' | 'retainer'>('standard');
  const [estConfig, setEstConfig] = useState<EstimatorSettings | null>(null);

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

  const calculatedMetrics = useMemo(() => {
    let base = 0;
    selectedServices.forEach(s => {
      const match = servicesList.find(item => item.id === s);
      if (match) base += match.basePrice;
    });

    // Scale multiplier
    let scaleMult = 1;
    let scaleLabel = '';
    let gearSpec = '';
    let crewSize = '';

    const boutiqueMult = estConfig?.scaleMultipliers?.['boutique'] ?? 0.8;
    const midMult = estConfig?.scaleMultipliers?.['mid'] ?? 1.2;
    const luxuryMult = estConfig?.scaleMultipliers?.['luxury'] ?? 2.0;

    if (campaignScale === 'boutique') {
      scaleMult = boutiqueMult;
      scaleLabel = 'Boutique Highlight';
      gearSpec = 'Sony FX6 Cinema Package & Premium Prime Lenses';
      crewSize = '3 Cinematic Creative Specialists';
    } else if (campaignScale === 'mid') {
      scaleMult = midMult;
      scaleLabel = 'Premium Brand Showcase';
      gearSpec = 'RED V-Raptor / Sony FX9 multicam & G-Master Prime Optics';
      crewSize = '5 Custom Production & Lighting Crew';
    } else {
      scaleMult = luxuryMult;
      scaleLabel = 'National Digital Takeover';
      gearSpec = 'ARRI Alexa Mini LF / RED Raptor VV, Anamorphic lenses, Full Dolly Setup';
      crewSize = '9+ Creative Director, Master Colorist, Gaffers & Sound Engineer';
    }

    // Timeline modifier
    const fastMult = estConfig?.timelineMultipliers?.['fast'] ?? 1.25;
    const standardMult = estConfig?.timelineMultipliers?.['standard'] ?? 1.0;
    const retainerMult = estConfig?.timelineMultipliers?.['retainer'] ?? 0.9;

    let timeMult = 1.0;
    if (timeline === 'fast') timeMult = fastMult;
    if (timeline === 'standard') timeMult = standardMult;
    if (timeline === 'retainer') timeMult = retainerMult;

    const totalEstimateVal = Math.round(base * scaleMult * timeMult);
    
    // Convert to mock INR equivalent representation for local flare
    const formattedRange = `₹${(totalEstimateVal * 60).toLocaleString('en-IN')} - ₹${(Math.round(totalEstimateVal * 1.3) * 60).toLocaleString('en-IN')}`;

    return {
      range: formattedRange,
      gearSpec,
      crewSize,
      scaleLabel,
      totalEstimateVal
    };
  }, [selectedServices, campaignScale, timeline, servicesList, estConfig]);

  const handleApplyToForm = () => {
    const serviceNames = selectedServices
      .map(s => servicesList.find(item => item.id === s)?.label)
      .filter(Boolean)
      .join(', ');

    const scaleText = campaignScale === 'boutique' ? 'Boutique Scale' : campaignScale === 'mid' ? 'Premium Scale' : 'Luxury National Scale';
    const timelineText = timeline === 'fast' ? 'Rush delivery (< 2 weeks)' : timeline === 'standard' ? 'Standard (4-6 weeks)' : 'Long-term Retainer';

    const summary = `Selected Campaign Elements: ${serviceNames}. Scale: ${scaleText}. Schedule: ${timelineText}. Projected Specs: ${calculatedMetrics.crewSize} using ${calculatedMetrics.gearSpec}.`;
    
    onIntegrate(summary, serviceNames, calculatedMetrics.range);
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
                    onClick={() => setTimeline(time)}
                    className={`flex-1 text-[10px] uppercase tracking-widest py-2 font-mono transition-all ${
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
        </div>

        {/* Right Preview Card */}
        <div className="w-full lg:w-80 flex flex-col justify-between bg-[#0e0e0e] border border-faint p-6 relative">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono block">Project Estimate</span>
              <div className="text-3xl font-serif text-white tracking-tight mt-1">{calculatedMetrics.range}</div>
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

          <div className="mt-8 pt-4">
            <button
              onClick={handleApplyToForm}
              className="w-full flex items-center justify-center bg-transparent border border-white hover:bg-white hover:text-black text-white py-3 px-4 font-mono text-[10px] tracking-widest uppercase transition-all active:scale-98 cursor-pointer"
            >
              Apply to Inquiry Form
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[9px] text-zinc-650 text-center mt-3 leading-normal font-mono uppercase">
              * Subject to custom script evaluation, logistics, and visual complexity adjustments.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
