import React, { useState } from 'react';
import { 
  Shield, 
  Film, 
  Camera, 
  DollarSign, 
  LogOut, 
  Sliders, 
  Settings, 
  Zap, 
  Info, 
  ListTodo, 
  HelpCircle, 
  MessageSquare, 
  Eye 
} from 'lucide-react';
import HeroEditor from './HeroEditor';
import PortfolioManager from './PortfolioManager';
import EstimatorConfigurator from './EstimatorConfigurator';
import AboutEditor from './AboutEditor';
import ServicesControl from './ServicesControl';
import WhyUsControl from './WhyUsControl';
import TestimonialsControl from './TestimonialsControl';
import WhatsAppConfigurator from './WhatsAppConfigurator';
import VisibilityControl from './VisibilityControl';
import { clearMockUser } from '../../lib/firebase';

interface AdminDashboardProps {
  user: { email: string; displayName: string };
  onLogout: () => void;
}

type TabType = 
  | 'hero' 
  | 'portfolio' 
  | 'estimator' 
  | 'about' 
  | 'services' 
  | 'whyUs' 
  | 'testimonials' 
  | 'whatsapp' 
  | 'visibility';

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('visibility');

  const handleSignOut = () => {
    clearMockUser();
    onLogout();
  };

  const tabs: { type: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { type: 'visibility', label: 'Section Rules', icon: Eye },
    { type: 'hero', label: 'Hero Slogans', icon: Settings },
    { type: 'about', label: 'About Backstory', icon: Info },
    { type: 'services', label: 'Capabilities Grid', icon: ListTodo },
    { type: 'estimator', label: 'Price Engine', icon: Sliders },
    { type: 'whyUs', label: 'Trust Vectors', icon: HelpCircle },
    { type: 'portfolio', label: 'Live Portfolio', icon: Camera },
    { type: 'testimonials', label: 'Endorsements', icon: MessageSquare },
    { type: 'whatsapp', label: 'WhatsApp Widget', icon: Film },
  ];

  return (
    <div className="min-h-[90vh] bg-[#050507] text-[#ebebeb] py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top visual layout block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-400 uppercase">JAIPUR HQ SECURE ENCLAVE</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-white/10 bg-zinc-950 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-[#00a884]" />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-white tracking-tight">Agency Workspace Control</h1>
                <p className="text-xs text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">
                  Active Operator: {user.displayName} ({user.email})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={handleSignOut}
              className="bg-black border border-white/10 hover:border-red-500 hover:text-red-400 text-zinc-400 py-2.5 px-4 font-mono text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
            >
              <LogOut className="w-3.5 h-3.5" /> Key Out of Deck
            </button>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex flex-wrap gap-1.5 bg-[#0a0a0c]/80 border border-white/5 p-1.5 max-w-full text-left">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex items-center gap-2 px-3 py-2.5 font-mono text-[10px] sm:text-[10.5px] tracking-widest uppercase transition-colors rounded-none cursor-pointer border ${
                  isSelected 
                    ? 'border-white bg-white text-black font-semibold' 
                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Core display panels */}
        <div className="bg-[#0a0a0d] border border-white/5 p-6 sm:p-8 md:p-10 shadow-xl overflow-hidden relative">
          
          <div className="absolute top-0 right-0 p-4 opacity-5 pointers-events-none select-none">
            <Zap className="w-24 h-24 text-white" />
          </div>

          <div className="relative z-10">
            {activeTab === 'visibility' && <VisibilityControl />}
            {activeTab === 'hero' && <HeroEditor />}
            {activeTab === 'portfolio' && <PortfolioManager />}
            {activeTab === 'estimator' && <EstimatorConfigurator />}
            {activeTab === 'about' && <AboutEditor />}
            {activeTab === 'services' && <ServicesControl />}
            {activeTab === 'whyUs' && <WhyUsControl />}
            {activeTab === 'testimonials' && <TestimonialsControl />}
            {activeTab === 'whatsapp' && <WhatsAppConfigurator />}
          </div>

        </div>

      </div>
    </div>
  );
}
