import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Mail, 
  Instagram, 
  Briefcase, 
  Info, 
  ChevronRight, 
  ArrowLeft, 
  MoreVertical, 
  MessageCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppProfileCardProps {
  onImageClick?: (item: any) => void;
  portfolioItems: any[];
}

export default function WhatsAppProfileCard({ onImageClick, portfolioItems }: WhatsAppProfileCardProps) {
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);

  // The premium custom SVG logo of "THE PHOTO BLOG.INDIA / MUSKAN" as shown in the screenshot
  const BrandLogoSVG = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full text-black p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circular layout path hint */}
      <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
      
      {/* Top Semi-circular Text "THE PHOTO BLOG.INDIA" */}
      <path id="curve-top" d="M 30,100 A 70,70 0 0,1 170,100" className="fill-none" />
      <text className="font-mono text-[9px] uppercase tracking-[0.18em] fill-black font-semibold">
        <textPath href="#curve-top" startOffset="50%" textAnchor="middle">
          THE PHOTO BLOG.INDIA
        </textPath>
      </text>

      {/* Camera minimal wireframe outline */}
      <rect x="55" y="75" width="90" height="55" rx="6" stroke="currentColor" strokeWidth="2.5" />
      {/* Lens outer body */}
      <circle cx="100" cy="102" r="22" stroke="currentColor" strokeWidth="2.5" fill="white" />
      {/* Flash box */}
      <rect x="65" y="66" width="22" height="10" rx="2" fill="currentColor" />
      {/* Lens inner shutter (Yin-Yang / Camera shutter spiral styled like the logo) */}
      <path d="M 100,86 A 16,16 0 0,1 116,102 L 100,102 Z" fill="currentColor" />
      <path d="M 100,118 A 16,16 0 0,1 84,102 L 100,102 Z" fill="currentColor" />
      <circle cx="100" cy="102" r="6" fill="white" />
      <circle cx="100" cy="102" r="2" fill="currentColor" />

      {/* Bottom Text "M U S K A N" */}
      <text x="100" y="162" textAnchor="middle" className="font-sans text-[11px] font-bold tracking-[0.6em] fill-black">
        MUSKAN
      </text>
    </svg>
  );

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0a0a0c] border border-white/10 rounded-none overflow-hidden hover:border-white/20 transition-all shadow-2xl relative">
      
      {/* WhatsApp Interface Header bar */}
      <div className="bg-[#121b22] px-4 py-3 flex items-center justify-between text-[#e9edef] border-b border-white/5">
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-4 h-4 text-[#8696a0] cursor-pointer" />
          <div className="flex flex-col">
            <span className="font-sans font-semibold text-sm">Muskan</span>
            <span className="text-[10px] text-[#8696a0] font-mono tracking-wider uppercase">Business Info</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#8696a0]">
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Scrollable Container mimicking WhatsApp business detail page */}
      <div className="p-4 space-y-5 max-h-[640px] overflow-y-auto custom-scrollbar bg-[#0b141a]/95 text-[#e9edef]">
        
        {/* Profile Logo Frame with exact styling */}
        <div className="flex flex-col items-center py-4 bg-[#121b22]/40 border border-white/5 p-4 rounded-none">
          <div className="w-28 h-28 bg-white rounded-none flex items-center justify-center shadow-lg relative p-1 group">
            <BrandLogoSVG />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-black/85 border border-white/10 px-2 py-1 text-[8px] font-mono uppercase tracking-widest text-white">Logo Sign-Off</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mt-4 font-serif">Muskan</h3>
          <span className="text-[10px] font-mono text-[#8696a0] tracking-widest mt-1">THE PHOTO BLOG.INDIA</span>
        </div>

        {/* Brand Slogans and Slogan Card */}
        <div className="bg-[#121b22]/60 p-4 border border-white/5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-5 text-[#8696a0] shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-sm text-[#e9edef] leading-relaxed font-sans font-medium">
              We are a new-age marketing agency providing social media management, performance marketing, branding & identity.
            </p>
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex items-start gap-3">
            <div className="mt-1 w-5 text-[#8696a0] shrink-0" />
            <p className="text-xs text-[#8696a0] italic leading-relaxed">
              "We thrive to turn your brand into a story which the digital media remembers."
            </p>
          </div>
        </div>

        {/* Business Hours Segment */}
        <div className="bg-[#121b22]/60 p-4 border border-white/5 space-y-2">
          <div 
            onClick={() => setShowHoursDropdown(!showHoursDropdown)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#8696a0] group-hover:text-white transition-colors" />
              <div className="text-left">
                <span className="text-xs text-[#8696a0] block uppercase font-mono tracking-widest">Business hours</span>
                <span className="text-sm font-semibold text-zinc-100">Friday (Open)</span>
              </div>
            </div>
            <div className="text-right flex items-center gap-1.5">
              <span className="text-xs text-zinc-300 font-mono">10:00 am – 6:00 pm</span>
              <ChevronRight className={`w-4 h-4 text-[#8696a0] transition-transform ${showHoursDropdown ? 'rotate-90' : ''}`} />
            </div>
          </div>

          <AnimatePresence>
            {showHoursDropdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-2 font-mono text-[10px] text-[#8696a0] space-y-1 pl-7 text-left border-t border-white/5 mt-2"
              >
                <div className="flex justify-between py-0.5"><span>Monday</span><span className="text-emerald-400">10:00 am – 6:00 pm</span></div>
                <div className="flex justify-between py-0.5"><span>Tuesday</span><span className="text-emerald-400">10:00 am – 6:00 pm</span></div>
                <div className="flex justify-between py-0.5"><span>Wednesday</span><span className="text-emerald-400">10:00 am – 6:00 pm</span></div>
                <div className="flex justify-between py-0.5"><span>Thursday</span><span className="text-emerald-400">10:00 am – 6:00 pm</span></div>
                <div className="flex justify-between py-0.5 font-bold text-[#e9edef]"><span>Friday</span><span className="text-emerald-400">10:00 am – 6:00 pm</span></div>
                <div className="flex justify-between py-0.5"><span>Saturday</span><span className="text-emerald-400">10:00 am – 6:00 pm</span></div>
                <div className="flex justify-between py-0.5"><span>Sunday</span><span className="text-red-400 uppercase">Closed</span></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Information List (Category, Location, Contact) */}
        <div className="bg-[#121b22]/60 p-4 border border-white/5 space-y-3.5 text-left">
          
          {/* Category */}
          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-[#8696a0] shrink-0" />
            <div>
              <span className="text-[10px] text-[#8696a0] block uppercase font-mono tracking-widest">Industry category</span>
              <span className="text-xs font-semibold text-zinc-100">Marketing Agency</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Location */}
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#8696a0] shrink-0" />
            <div>
              <span className="text-[10px] text-[#8696a0] block uppercase font-mono tracking-widest">Headquarters</span>
              <span className="text-xs font-semibold text-zinc-100">Jaipur, Rajasthan, India</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Email */}
          <a href="mailto:contact@thephotoblogindia.in" className="flex items-center gap-3 group">
            <Mail className="w-4 h-4 text-[#8696a0] group-hover:text-white transition-colors shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] text-[#8696a0] block uppercase font-mono tracking-widest">Direct E-mail</span>
              <span className="text-xs font-mono font-bold text-zinc-100 group-hover:text-zinc-300 transition-colors break-all">
                contact@thephotoblogindia.in
              </span>
            </div>
          </a>

          <div className="h-px bg-white/5" />

          {/* Instagram Link */}
          <a 
            href="https://instagram.com/thephotoblog.india.1" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 group"
          >
            <Instagram className="w-4 h-4 text-[#8696a0] group-hover:text-white transition-colors shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#8696a0] block uppercase font-mono tracking-widest">Instagram Syndicate</span>
                <span className="text-xs font-semibold text-zinc-100">@thephotoblog.india.1</span>
              </div>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-none font-mono text-zinc-400 group-hover:text-white transition-all">
                38 Followers
              </span>
            </div>
          </a>

        </div>

        {/* Media, links, and docs (Dynamic frame selector) */}
        <div className="bg-[#121b22]/60 p-4 border border-white/5 text-left space-y-3">
          <div className="flex items-center justify-between text-xs font-sans font-medium text-[#8696a0]">
            <span>Media, links, and docs</span>
            <span className="text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer flex items-center gap-0.5">
              {portfolioItems.length} items <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Horizontal list of portfolio thumbnail links */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {portfolioItems.slice(0, 4).map((item, idx) => (
              <div 
                key={item.id} 
                onClick={() => onImageClick?.(item)}
                className="aspect-square bg-zinc-900 border border-white/10 overflow-hidden cursor-pointer hover:border-white/40 transition-all relative group"
                title={`Open Lightbox for ${item.title}`}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] text-white font-mono scale-90">VIEW</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Business Verified account tag */}
        <div className="bg-[#121b22]/30 p-4 border border-white/5 rounded-none flex items-start gap-3.5 text-left">
          <Info className="w-5 h-5 text-[#8696a0] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-white font-sans uppercase tracking-wider">Business Account</h4>
            <p className="text-xs text-[#8696a0] leading-relaxed mt-1">
              This account uses a verified WhatsApp Business profile to streamline commercial marketing inquiries.
            </p>
          </div>
        </div>

        {/* Interactive chat activator */}
        <div className="pt-2">
          <a
            href="https://wa.me/+919145961226?text=Hi%20Muskan%2C%20we'd%20love%20to%20discuss%20a%20social%20media%20management%20and%20branding%20collaboration%20with%20The%20Photo%20Blog%20India%20hub."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#00a884] hover:bg-[#00bfa5] text-black py-3 px-4 font-bold text-xs tracking-widest uppercase transition-all rounded-none flex items-center justify-center gap-2 font-mono"
          >
            Start WhatsApp Chat <MessageCircle className="w-4 h-4 fill-black" />
          </a>
        </div>

      </div>

    </div>
  );
}
