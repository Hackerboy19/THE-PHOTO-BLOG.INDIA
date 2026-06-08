/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Film,
  Sparkles,
  Clock,
  ShieldCheck,
  Instagram,
  Award,
  Heart,
  Shield,
  Zap,
  Mail,
  Phone,
  MessageCircle,
  FileCheck,
  Check,
  Camera,
  Play,
  Volume2,
  VolumeX,
  Send,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Share2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SERVICES_DATA, 
  WHY_CHOOSE_US_DATA, 
  TESTIMONIALS_DATA, 
  PORTFOLIO_DATA, 
  HERO_BACKGROUND, 
  ABOUT_IMAGE 
} from './data';
import CampaignEstimator from './components/CampaignEstimator';
import InstagramGrid from './components/InstagramGrid';
import WhatsAppProfileCard from './components/WhatsAppProfileCard';
import { ContactFormData, PortfolioItem } from './types';
import { Magnetic, SplitTextReveal } from './components/EditorialAnimations';
import EditorialDivider from './components/EditorialDivider';

// Admin System Imports
import { 
  getHeroData, 
  getPortfolioItems, 
  getMockUser, 
  saveMockUser, 
  clearMockUser, 
  HeroSettings,
  getAboutSettings,
  getServices,
  getWhyChooseUs,
  getTestimonials,
  getWhatsAppConfig,
  getSectionVisibility
} from './lib/firebase';
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));

// Sophisticated editorial motion variants
const fadeInUpVariants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 35 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    y: 0,
    transition: { 
      duration: 1.2, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export function getOptimizedImageUrl(url: string, width: number, format: 'webp' | 'avif' | 'auto' = 'auto'): string {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams(url.split('?')[1] || '');
    params.set('w', width.toString());
    params.set('q', '75'); 
    if (format !== 'auto') {
      params.set('fm', format);
    } else {
      params.set('auto', 'format');
    }
    return `${baseUrl}?${params.toString()}`;
  } catch (_) {
    return url;
  }
}

const hoverTrackingVariants = {
  rest: { letterSpacing: "0.2em", borderBottomColor: "rgba(255, 255, 255, 0)", borderBottomWidth: "1px", paddingBottom: "2px" },
  hover: { 
    letterSpacing: "0.28em", 
    borderBottomColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: "1px",
    paddingBottom: "2px",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Dynamic Content States
  const [heroConfig, setHeroConfig] = useState<HeroSettings | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [aboutSettings, setAboutSettings] = useState<any>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [whyChooseUsData, setWhyChooseUsData] = useState<any[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [whatsAppConfig, setWhatsAppConfig] = useState<any>(null);
  const [sectionVisibility, setSectionVisibility] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryChanging, setIsCategoryChanging] = useState<boolean>(false);
  
  // Admin Navigation and Session States
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === '/admin' || window.location.hash === '#admin'
  );
  const [activeAdminUser, setActiveAdminUser] = useState<{ email: string; displayName: string } | null>(getMockUser());

  // Navigation listener for direct address bar synchronization
  useEffect(() => {
    const handleLocationCoordinates = () => {
      const isOk = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setIsAdminRoute(isOk);
    };

    window.addEventListener('popstate', handleLocationCoordinates);
    window.addEventListener('hashchange', handleLocationCoordinates);
    return () => {
      window.removeEventListener('popstate', handleLocationCoordinates);
      window.removeEventListener('hashchange', handleLocationCoordinates);
    };
  }, []);

  // Sync dynamic elements from Firestore/LocalStorage on load
  useEffect(() => {
    async function loadResources() {
      try {
        const [hero, list, about, services, whyUs, testimonials, whatsapp, visibility] = await Promise.all([
          getHeroData(),
          getPortfolioItems(),
          getAboutSettings(),
          getServices(),
          getWhyChooseUs(),
          getTestimonials(),
          getWhatsAppConfig(),
          getSectionVisibility()
        ]);
        setHeroConfig(hero);
        setPortfolioItems(list);
        setAboutSettings(about);
        setServicesData(services);
        setWhyChooseUsData(whyUs);
        setTestimonialsData(testimonials);
        setWhatsAppConfig(whatsapp);
        setSectionVisibility(visibility);

        // Auto-open portfolio item if shared via "?project=id" URL format
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('project');
        if (projectId && list && list.length > 0) {
          const matched = list.find((item: any) => item.id === projectId);
          if (matched) {
            setSelectedPortfolioItem(matched);
          }
        }
      } catch (err) {
        console.warn("Dynamic synchronizer warning:", err);
      }
    }
    loadResources();
  }, [isAdminRoute]); // Reload when entering/leaving admin to sync instant changes

  const handleAdminLogin = (user: { email: string; uid: string; displayName: string }) => {
    saveMockUser(user);
    setActiveAdminUser(user);
  };

  const handleAdminLogout = () => {
    clearMockUser();
    setActiveAdminUser(null);
  };

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminRoute(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.location.hash = '';
    // if path is /admin push root state
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Interactive Inquiry Form State
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    serviceOfInterest: 'Cinematic Brand Campaigns',
    estimatedBudget: 'Bespoke Quote Upon Evaluation',
    projectMessage: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sendingForm, setSendingForm] = useState(false);

  // Lightbox Modal state
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Reset copied state when portfolio item changes
  useEffect(() => {
    setIsCopied(false);
  }, [selectedPortfolioItem]);

  // Dynamic SEO Open Graph tags and Page Title sync
  useEffect(() => {
    if (selectedPortfolioItem) {
      document.title = `${selectedPortfolioItem.title} ✦ THE PHOTO BLOG.INDIA.1`;
      
      const updateMetaTag = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      const updateNameTag = (name: string, content: string) => {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      updateMetaTag('og:title', `${selectedPortfolioItem.title} ✦ THE PHOTO BLOG.INDIA.1`);
      updateMetaTag('og:description', `Co-directed digital film partnership for ${selectedPortfolioItem.client}. Category: ${selectedPortfolioItem.category}. Impact outcome: ${selectedPortfolioItem.impact}.`);
      updateMetaTag('og:image', selectedPortfolioItem.imageUrl);
      updateNameTag('description', `Co-directed digital film partnership for ${selectedPortfolioItem.client}. Category: ${selectedPortfolioItem.category}. Impact outcome: ${selectedPortfolioItem.impact}.`);
    } else {
      document.title = 'THE PHOTO BLOG.INDIA.1 ✦ Elite Photography & Cinematic Agency Jaipur';
      
      const updateMetaTag = (property: string, content: string) => {
        const element = document.querySelector(`meta[property="${property}"]`);
        if (element) {
          if (property === 'og:title') element.setAttribute('content', 'THE PHOTO BLOG.INDIA.1 ✦ Elite Photography & Cinematic Agency');
          if (property === 'og:description') element.setAttribute('content', 'Elite corporate photography, high-retention video production, and social-first editorial campaigns co-directed in Jaipur.');
          if (property === 'og:image') element.setAttribute('content', 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=1200');
        }
      };
      
      const updateNameTag = (name: string, content: string) => {
        const element = document.querySelector(`meta[name="${name}"]`);
        if (element && name === 'description') {
          element.setAttribute('content', 'Elite corporate photography, high-retention video production, and editorial campaigns co-directed in Jaipur, India. Specializing in cinematic brand takeovers.');
        }
      };

      updateMetaTag('og:title', 'THE PHOTO BLOG.INDIA.1 ✦ Elite Photography & Cinematic Agency');
      updateMetaTag('og:description', 'Elite corporate photography, high-retention video production, and social-first editorial campaigns co-directed in Jaipur.');
      updateMetaTag('og:image', 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=1200');
      updateNameTag('description', 'Elite corporate photography, high-retention video production, and editorial campaigns co-directed in Jaipur, India. Specializing in cinematic brand takeovers.');
    }
  }, [selectedPortfolioItem]);

  const handleCloseLightbox = () => {
    setSelectedPortfolioItem(null);
    if (window.location.search.includes('project=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSharePortfolio = async () => {
    if (!selectedPortfolioItem) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(selectedPortfolioItem.id)}`;
    
    // Attempt web native share if supported and permitted
    if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
      try {
        await navigator.share({
          title: `${selectedPortfolioItem.title} | THE PHOTO BLOG.INDIA.1`,
          text: `Check out this digital collaboration: "${selectedPortfolioItem.title}" with ${selectedPortfolioItem.client}.`,
          url: shareUrl
        });
        return;
      } catch (err) {
        console.warn("Native share failed, falling back to copy to clipboard:", err);
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Could not write item url to clipboard:", err);
    }
  };

  const handleNextPortfolioItem = () => {
    if (!selectedPortfolioItem || portfolioItems.length === 0) return;
    const currentIndex = portfolioItems.findIndex(item => item.id === selectedPortfolioItem.id);
    const nextIndex = (currentIndex + 1) % portfolioItems.length;
    setSelectedPortfolioItem(portfolioItems[nextIndex]);
  };

  const handlePrevPortfolioItem = () => {
    if (!selectedPortfolioItem || portfolioItems.length === 0) return;
    const currentIndex = portfolioItems.findIndex(item => item.id === selectedPortfolioItem.id);
    const prevIndex = (currentIndex - 1 + portfolioItems.length) % portfolioItems.length;
    setSelectedPortfolioItem(portfolioItems[prevIndex]);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPortfolioItem) return;
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight') handleNextPortfolioItem();
      if (e.key === 'ArrowLeft') handlePrevPortfolioItem();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPortfolioItem]);

  // Scroll event tracking for fixed glass header and return-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEstimatorIntegration = (summary: string, serviceName: string, budgetEstimate: string) => {
    setFormData(prev => ({
      ...prev,
      serviceOfInterest: serviceName.split(', ')[0] || 'Cinematic Brand Campaigns',
      estimatedBudget: budgetEstimate,
      projectMessage: `${summary}\n\nWe are looking to align on this custom campaign structure. Please get in touch for creative brief evaluation.`
    }));

    // Scroll smoothly to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setSendingForm(true);
    // Simulate premium visual submitting state
    setTimeout(() => {
      setSendingForm(false);
      setFormSubmitted(true);
    }, 1500);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (isAdminRoute) {
    return (
      <div className="relative min-h-screen bg-[#050507] text-[#ebebeb] overflow-x-hidden">
        {/* Subdued agency control header */}
        <header className="bg-black/95 border-b border-white/10 py-5 px-6 md:px-12 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={navigateToHome}
              className="text-xs font-mono tracking-widest text-[#8696a0] hover:text-[#00a884] transition-colors uppercase cursor-pointer"
            >
              ← Back to TPB India Site
            </button>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
              Agency Secure Control Deck
            </div>
          </div>
        </header>

        {activeAdminUser ? (
          <React.Suspense fallback={
            <div className="flex flex-col justify-center items-center py-24 text-zinc-500 font-mono text-xs gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>SYNCHRONIZING REPOSITORY REGISTRY...</span>
            </div>
          }>
            <AdminDashboard user={activeAdminUser} onLogout={handleAdminLogout} />
          </React.Suspense>
        ) : (
          <div className="max-w-md mx-auto py-24 px-4">
            <React.Suspense fallback={
              <div className="flex flex-col justify-center items-center py-12 text-zinc-500 font-mono text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                <span>LOADING SECURE DOORWAY...</span>
              </div>
            }>
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            </React.Suspense>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="relative min-h-screen bg-[#080808] text-[#F5F5F5] overflow-x-hidden"
    >
      
      {/* BACKGROUND GRID DECORATION (Subtle, elegant) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b1b_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1b_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none opacity-40 z-0" />

      {/* FLOAT GLOWS */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-zinc-800/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-zinc-800/10 blur-[120px] rounded-full pointer-events-none" />

      {/* FIXED HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#080808]/95 backdrop-blur-md border-b border-white/10 py-4 shadow-sm' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo with clean elegant cinematic serif font */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-base font-serif italic tracking-tight text-white uppercase hover:text-zinc-400 transition-colors font-semibold"
          >
            THE PHOTO BLOG.INDIA.1
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-zinc-400 uppercase">
            <motion.button
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={hoverTrackingVariants}
              onClick={() => scrollToSection('about')}
              className="hover:text-white transition-colors cursor-pointer border-b text-left"
            >
              About
            </motion.button>
            <motion.button
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={hoverTrackingVariants}
              onClick={() => scrollToSection('services')}
              className="hover:text-white transition-colors cursor-pointer border-b text-left"
            >
              Services
            </motion.button>
            <motion.button
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={hoverTrackingVariants}
              onClick={() => scrollToSection('estimator')}
              className="hover:text-white transition-colors cursor-pointer border-b text-left"
            >
              Estimator
            </motion.button>
            <motion.button
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={hoverTrackingVariants}
              onClick={() => scrollToSection('why-us')}
              className="hover:text-white transition-colors cursor-pointer border-b text-left"
            >
              Why Us
            </motion.button>
            <motion.button
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={hoverTrackingVariants}
              onClick={() => scrollToSection('portfolio')}
              className="hover:text-white transition-colors cursor-pointer border-b text-left"
            >
              Portfolio
            </motion.button>
            <motion.button
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={hoverTrackingVariants}
              onClick={() => scrollToSection('instagram')}
              className="hover:text-white transition-colors cursor-pointer border-b text-left"
            >
              Feed
            </motion.button>
          </nav>

          {/* Action button */}
          <div className="hidden sm:flex items-center gap-4">
            <Magnetic>
              <motion.button
                initial={{ letterSpacing: "0.15em", borderColor: "rgba(255,255,255,0.2)" }}
                whileHover={{ letterSpacing: "0.22em", borderColor: "rgba(255,255,255,1)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => scrollToSection('contact')}
                className="bg-transparent text-white text-[10px] font-mono uppercase px-6 py-3 border transition-all cursor-pointer"
              >
                Inquire Now
              </motion.button>
            </Magnetic>
          </div>

          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-zinc-400 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </motion.header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[#080808] z-30 pt-24 px-8 pb-12 flex flex-col justify-between border-b border-white/10"
          >
            <nav className="flex flex-col gap-6 text-sm tracking-[0.2em] text-zinc-400 uppercase font-mono">
              <button onClick={() => scrollToSection('about')} className="text-left py-2 border-b border-white/10 hover:text-white transition-colors">About</button>
              <button onClick={() => scrollToSection('services')} className="text-left py-2 border-b border-white/10 hover:text-white transition-colors">Services</button>
              <button onClick={() => scrollToSection('estimator')} className="text-left py-2 border-b border-white/10 hover:text-white transition-colors">Campaign Estimator</button>
              <button onClick={() => scrollToSection('why-us')} className="text-left py-2 border-b border-white/10 hover:text-white transition-colors">Why Choose Us</button>
              <button onClick={() => scrollToSection('portfolio')} className="text-left py-2 border-b border-white/10 hover:text-white transition-colors">Our Portfolio</button>
              <button onClick={() => scrollToSection('instagram')} className="text-left py-2 border-b border-white/10 hover:text-white transition-colors">Instagram Portfolio</button>
            </nav>

            <div className="space-y-6">
              <p className="text-[10px] font-mono tracking-[0.15em] text-zinc-500 uppercase">THE PHOTO BLOG.INDIA.1 • CINEMATIC STORYTELLERS</p>
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full bg-transparent border border-white hover:bg-white hover:text-black py-4 font-mono font-bold uppercase tracking-widest text-xs text-white"
              >
                Direct Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden px-6 md:px-12">
        {/* BIG HERO IMAGE WITH OVERLAYS */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent lg:block hidden z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent z-10" />
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.02, opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            src={heroConfig?.bgUrl || HERO_BACKGROUND}
            alt="THE PHOTO BLOG.INDIA.1 Cinematic Setting"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.35] lg:brightness-60"
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle auto-playing, muted cinematic background video loop with blended reflection */}
          <video
            key={heroConfig?.videoUrl || 'default'}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-screen pointer-events-none filter saturate-50 contrast-125 brightness-50"
          >
            {heroConfig?.videoUrl ? (
              <source src={heroConfig.videoUrl} type="video/mp4" />
            ) : (
              <>
                <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
                <source src="https://assets.mixkit.co/videos/preview/mixkit-lens-of-a-camera-with-reflections-34281-large.mp4" type="video/mp4" />
              </>
            )}
          </video>
        </div>

        {/* Hero Interactive UI Status indicator (Aesthetic camera overlay) */}
        <div className="absolute top-28 right-12 hidden xl:flex flex-col gap-2 bg-black/80 px-4 py-3 border border-white/10 text-[10px] font-mono text-zinc-500 max-w-xs z-20">
          <div className="flex items-center justify-between text-white">
            <span className="flex items-center gap-1">● READY</span>
            <span>8K SENSORS</span>
          </div>
          <div className="h-px bg-zinc-900" />
          <p className="leading-normal">THE PHOTO BLOG.INDIA.1 / NEW-AGE CREATIVE HQ [JAIPUR, IN]</p>
        </div>

        {/* HERO CONTENT */}
        <div className="relative w-full max-w-7xl mx-auto z-20 flex flex-col items-start lg:text-left text-center">
          
          {/* Editorial tag category */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-zinc-900/60 text-white border border-white/10 px-3 py-1 rounded-none text-[10px] font-mono uppercase tracking-widest mb-6 mx-auto lg:mx-0"
          >
            <Film className="w-3" /> Cinematic Advertising & Visual Direction
          </motion.div>

          {/* Large display titles */}
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-serif text-white leading-[1.05] tracking-tight max-w-4xl">
            {heroConfig?.headline ? (
              <SplitTextReveal text={heroConfig.headline} delay={0.1} />
            ) : (
              <SplitTextReveal text="We capture the _extraordinary_ soul of brands." delay={0.1} />
            )}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-sm sm:text-base text-zinc-300 font-sans tracking-wide max-w-xl leading-relaxed lg:mx-0 mx-auto"
          >
            {heroConfig?.subHeadline || "THE PHOTO BLOG.INDIA.1 is a high-end digital marketing and cinematic media house. We direct premium film campaigns, brand collaborations, and high-fidelity visuals that compel eyes and capture market trust."}
          </motion.p>

          {/* Action Callouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-6 w-full xs:w-auto"
          >
            <Magnetic>
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-none font-sans font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                Inquire Now / Co-create
                <ArrowRight className="w-4 h-4" />
              </button>
            </Magnetic>
            
            <Magnetic>
              <button
                onClick={() => scrollToSection('estimator')}
                className="w-full sm:w-auto border border-white/20 hover:border-white bg-transparent text-zinc-300 hover:text-white px-8 py-4 rounded-none font-sans font-medium text-xs tracking-widest uppercase transition-all cursor-pointer"
              >
                Build Campaign Plan
              </button>
            </Magnetic>
          </motion.div>

          {/* Subtle live indicators at section bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="hidden lg:flex items-center gap-8 mt-16 text-[10px] font-mono tracking-widest text-zinc-500 uppercase"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="w-3 text-zinc-400" /> LUXURY LIFESTYLE Focus</span>
            <span>✦ BRAND COLLABS PLATFORM PREVIEW</span>
            <span>✦ CO-STARRING @THEPHOTOBLOG.INDIA.1</span>
          </motion.div>

        </div>
      </section>

      {/* 2. ABOUT COMPANY SECTION */}
      {(!sectionVisibility || sectionVisibility.about) && (
        <>
          <EditorialDivider label="01 // THE AGENCY STATEMENT" />
          <motion.section 
            id="about" 
            className="py-24 md:py-32 bg-black px-6 md:px-12 relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Graphic Image Framing */}
            <div className="lg:col-span-5 relative group">
              
              {/* Cinematic crop frame lines */}
              <div className="absolute -inset-4 border border-white/5 pointer-events-none rounded-none" />
              <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">FILM PREVIEW // FRAME #392</div>
              <div className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">RESOLUTION: 8K UNCOMPRESSED</div>

              <div className="aspect-square md:aspect-[4/5] rounded-none overflow-hidden bg-zinc-900 border border-white/10">
                <picture>
                  <source srcSet={getOptimizedImageUrl(aboutSettings?.aboutImage || ABOUT_IMAGE, 800, 'avif')} type="image/avif" />
                  <source srcSet={getOptimizedImageUrl(aboutSettings?.aboutImage || ABOUT_IMAGE, 800, 'webp')} type="image/webp" />
                  <img
                    src={getOptimizedImageUrl(aboutSettings?.aboutImage || ABOUT_IMAGE, 800, 'auto')}
                    alt="Director portrait"
                    className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 transition-all duration-700 hover:scale-102"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </picture>
              </div>

              {/* Simulated Live Metadata strip below */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 px-3 py-2 border border-white/10 rounded-none flex items-center justify-between text-[9px] font-mono tracking-wider text-zinc-400">
                <span className="flex items-center gap-1"><Camera className="w-3.5" /> 35mm Prime</span>
                <span>{aboutSettings?.shutter || "1/250"}</span>
                <span>ISO {aboutSettings?.iso || "100"}</span>
                <span>{aboutSettings?.aperture || "f/1.4"}</span>
              </div>
            </div>

            {/* About Text Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">THE AGENCY</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-tight">
                A high-end marketing agency focusing on <span className="italic font-normal text-zinc-350">immersive, cinematic</span> brand alignment.
              </h2>
              
              <div className="text-zinc-[#c8c8c8] text-sm md:text-base leading-relaxed space-y-4">
                {aboutSettings?.backstory ? (
                  <p className="whitespace-pre-line font-sans">{aboutSettings.backstory}</p>
                ) : (
                  <>
                    <p className="text-zinc-400">
                      Founded under the creative vision of premier Indian media designers, **THE PHOTO BLOG.INDIA.1** has grown into an elite creative firm. We reject the standard, dry, cookie-cutter social media formulas. We treat every social post, video script, and campaign drop as a high-end cinematic editorial launch.
                    </p>

                    <p className="text-zinc-400">
                      We connect luxury international hotel chains, elite lifestyle watch labels, artisanal design houses, and commercial vehicles with audiences who demand high quality. Your brand deserves to be documented through a lens that respects complexity, depth, and absolute aesthetic standards.
                    </p>
                  </>
                )}
              </div>

              {/* Core facts blocks */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                <div className="border-l border-white/20 pl-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">EXPERIENCE</span>
                  <div className="text-lg font-bold font-sans text-white">8+ Years</div>
                </div>
                <div className="border-l border-white/20 pl-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">COLLABORATIONS</span>
                  <div className="text-lg font-bold font-sans text-white">50+ Elite Brands</div>
                </div>
                <div className="border-l border-white/20 pl-4 space-y-1 col-span-2 md:col-span-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">INSTAGRAM</span>
                  <div className="text-lg font-bold font-sans text-white">@thephotoblog.india.1</div>
                </div>
              </div>

            </div>

          </div>
        </motion.section>
        </>
      )}

      {/* 3. OUR SERVICES SECTION */}
      {(!sectionVisibility || sectionVisibility.services) && (
        <>
          <EditorialDivider label="02 // CORE CAPABILITIES" />
          <motion.section 
            id="services" 
            className="py-24 md:py-32 bg-transparent px-6 md:px-12 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <motion.div 
              variants={fadeInUpVariants}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div className="max-w-xl space-y-2">
                <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Core Capabilities</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white">Our Services Spec</h2>
                <p className="text-sm text-zinc-400">Crafting deliberate digital touchpoints. We turn standard advertising assets into emotional cinematic experiences.</p>
              </div>
              
              {/* Estimate package navigation shortcut */}
              <button
                 onClick={() => scrollToSection('estimator')}
                 className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white hover:text-zinc-400 transition-all uppercase self-start group cursor-pointer"
              >
                Interactive Estimator
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {(servicesData.length > 0 ? servicesData : SERVICES_DATA)
                .filter(srv => !srv.hidden)
                .map((service, idx) => (
                  <motion.div
                    key={service.id}
                    variants={fadeInUpVariants}
                    className="group relative bg-[#0a0a0a] border border-white/10 p-8 md:p-10 rounded-none transition-all duration-300 flex flex-col justify-between overflow-hidden hover:border-white/30"
                  >
                    {/* Decorative index indicator absolute top */}
                    <div className="absolute top-6 right-8 text-2xl font-serif italic text-zinc-800 group-hover:text-white/10 transition-colors pointer-events-none">
                      0{idx + 1}
                    </div>

                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 bg-zinc-900/60 border border-white/10 rounded-none text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                        {service.metric}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white group-hover:text-zinc-200 transition-colors">{service.title}</h3>
                      <p className="text-sm text-zinc-405 leading-relaxed max-w-lg">{service.description}</p>
                    </div>

                    {/* Bullets */}
                    <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
                      <span className="text-[9px] font-mono tracking-[0.15em] text-zinc-500 uppercase block">SPECIFICATIONS</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center text-xs text-zinc-300 font-sans gap-2">
                            <span className="w-1.5 h-1.5 bg-white" />
                            {feat}
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ))}
            </div>

          </div>
        </motion.section>
        </>
      )}

      {/* 4. DYNAMIC INTERACTIVE ESTIMATOR & CAMPAIGN BUILDER (Requested Action flow) */}
      {(!sectionVisibility || sectionVisibility.estimator) && (
        <>
          <EditorialDivider label="03 // DIGITAL ROADMAP CONFIGURATOR" />
          <motion.section 
            id="estimator" 
            className="py-24 md:py-32 bg-black px-6 md:px-12 relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
          <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <span className="text-[10px] font-mono tracking-[0.2em] text-white border border-white/10 px-3 py-1 rounded-none uppercase bg-zinc-900/60">Configurator Toolkit</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white">Campaign Brief & Budget Builder</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We trust in perfect clarity. Select your creative deliverables, production scale, and schedule density below to outline an immediate investment roadmap tailored for your brand.
              </p>
            </div>

            <CampaignEstimator onIntegrate={handleEstimatorIntegration} />
          </div>
        </motion.section>
        </>
      )}

      {/* 5. WHY CHOOSE US SECTION */}
      {(!sectionVisibility || sectionVisibility.whyUs) && (
        <>
          <EditorialDivider label="04 // CREATIVE VALUE PROPOSITION" />
          <motion.section 
            id="why-us" 
            className="py-24 md:py-32 bg-[#060606] px-6 md:px-12 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Why Choose Us Sticky Left Column */}
            <motion.div variants={fadeInUpVariants} className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase block">Aesthetic Standards</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white">Why Select Our Vision</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We stand apart in India's advertising landscape because we respect physical texture, raw lighting, and timeless storytelling structures. No plastic green screens. Pure authentic visual craftsmanship.
              </p>
              
              {/* Instagram promotion link info */}
              <div className="p-5 bg-[#0a0a0a] border border-white/10 rounded-none mt-6 space-y-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Digital Native Verification</span>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-white" />
                  <span className="text-xs font-semibold text-white">@thephotoblog.india.1</span>
                </div>
                <p className="text-[11px] text-zinc-505 leading-normal font-sans">Our organic cinematic portfolio serves over millions of visual impressions organically.</p>
              </div>
            </motion.div>

            {/* Staggered features grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(whyChooseUsData.length > 0 ? whyChooseUsData : WHY_CHOOSE_US_DATA)
                .filter(item => !(item as any).hidden)
                .map((item) => {
                  // Custom map icons to visual elements
                  const getIcon = (name: string) => {
                    switch(name) {
                      case 'Film': return <Film className="w-5 h-5 text-white" />;
                      case 'Sparkles': return <Sparkles className="w-5 h-5 text-white" />;
                      case 'Clock': return <Clock className="w-5 h-5 text-white" />;
                      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-white" />;
                      case 'Zap': return <Zap className="w-5 h-5 text-white" />;
                      case 'Camera': return <Camera className="w-5 h-5 text-white" />;
                      case 'Award': return <Award className="w-5 h-5 text-white" />;
                      case 'Heart': return <Heart className="w-5 h-5 text-white" />;
                      case 'Shield': return <Shield className="w-5 h-5 text-white" />;
                      default: return <Sparkles className="w-5 h-5 text-white" />;
                    }
                  };

                  return (
                    <motion.div
                      key={item.id}
                      variants={fadeInUpVariants}
                      className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-none transition-all hover:border-white/30"
                    >
                      <div className="w-10 h-10 rounded-none bg-zinc-900 flex items-center justify-center border border-white/10">
                        {getIcon(item.iconName)}
                      </div>
                      <h3 className="text-lg font-serif text-white mt-4">{item.title}</h3>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
            </div>

          </div>
        </motion.section>
        </>
      )}

      {/* 6. CLIENT TESTIMONIALS SECTION */}
      {(!sectionVisibility || sectionVisibility.testimonials) && (
        <>
          <EditorialDivider label="05 // EXECUTIVE ENDORSEMENTS" />
          <motion.section 
            className="py-24 md:py-32 bg-black px-6 md:px-12 relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle camera frame bounds */}
          <div className="absolute top-4 left-4 text-[9px] font-mono text-zinc-700">[REC AUDIO MONO ACTIVE]</div>
          <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-700">[CLIENT TESTIMONY PREVIEW]</div>

          <div className="max-w-4xl mx-auto space-y-12 text-center relative z-10">
            <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Director Endorsements</span>

            {/* Slider content */}
            <div className="relative min-h-[220px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {((testimonialsData && testimonialsData.length > 0) ? testimonialsData : TESTIMONIALS_DATA)
                  .filter(t => !t.hidden)
                  .map((t, idx, arr) => (
                    idx === (activeTestimonial % (arr.length || 1)) && (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        <p className="text-lg sm:text-2xl md:text-3xl font-serif text-white italic leading-relaxed max-w-3xl mx-auto">
                          “{t.quote}”
                        </p>
                        <div className="space-y-1">
                          <h4 className="text-sm font-sans font-medium text-zinc-100">{t.author}</h4>
                          <p className="text-[10px] font-mono text-zinc-505 uppercase tracking-[0.15em]">
                            {t.role} — <span className="text-white font-serif italic">{t.brand}</span>
                          </p>
                        </div>
                      </motion.div>
                    )
                  ))}
              </AnimatePresence>
            </div>

            {/* Indicator Pills */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {((testimonialsData && testimonialsData.length > 0) ? testimonialsData : TESTIMONIALS_DATA)
                .filter(t => !t.hidden)
                .map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-1 transition-all cursor-pointer rounded-none ${
                      (activeTestimonial % (((testimonialsData && testimonialsData.length > 0) ? testimonialsData : TESTIMONIALS_DATA).filter(t => !t.hidden).length || 1)) === idx ? 'w-8 bg-white' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  />
                ))}
            </div>

          </div>
        </motion.section>
        </>
      )}

      {/* 7. LATEST PORTFOLIO COLLABS GRID */}
      {(!sectionVisibility || sectionVisibility.portfolio) && (
        <>
          <EditorialDivider label="06 // CINEMATIC PORTFOLIO" />
          <motion.section 
            id="portfolio" 
            className="py-24 md:py-32 bg-[#080808] px-6 md:px-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <motion.div variants={fadeInUpVariants} className="text-center space-y-4 max-w-xl mx-auto">
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Cinematic Proof</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white">Brand Partnerships & Campaigns</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We collaborate with luxury labels to co-direct high-retention digital visual features. Explore our latest custom projects across India and international outlets.
              </p>
            </motion.div>
  
            {/* Elegant Editorial Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 pb-6 border-b border-white/5 max-w-4xl mx-auto">
              {[
                { id: 'all', label: 'ALL CAMPAIGNS' },
                { id: 'Brand Collaboration', label: 'COLLAB SYNERGY' },
                { id: 'Editorial Photography', label: 'EDITORIAL STILLS' },
                { id: 'Cinematic Videography', label: 'CINEMATIC VIDEO' },
                { id: 'Brand Campaign', label: 'BRAND CONCEPTS' }
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (selectedCategory === cat.id) return;
                      setIsCategoryChanging(true);
                      setSelectedCategory(cat.id);
                      setTimeout(() => {
                        setIsCategoryChanging(false);
                      }, 400);
                    }}
                    className={`relative text-[10px] uppercase font-mono tracking-[0.18em] py-2 px-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'text-white font-bold' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat.label}
                    {isActive && (
                      <motion.div 
                        layoutId="activeCategoryBorder"
                        className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Portfolio Grid wrapper */}
            <div className="relative min-h-[400px]">
              {isCategoryChanging ? (
                /* High-fidelity Skeleton Loaders with Shimmer */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="space-y-4 animate-pulse">
                      <div className="aspect-[16/10] bg-zinc-950/60 border border-white/5 relative overflow-hidden">
                        {/* Shimmer overlay gradient moving left-to-right */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
                        <div className="absolute top-4 left-4 w-24 h-4 bg-zinc-900 border border-white/5" />
                        <div className="absolute bottom-4 right-4 w-16 h-4 bg-zinc-900" />
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <div className="space-y-2">
                          <div className="w-24 h-3 bg-zinc-900" />
                          <div className="w-48 h-4 bg-zinc-900" />
                        </div>
                        <div className="w-10 h-4 bg-zinc-900" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Refined Interactive Portfolio Grid */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {(portfolioItems.length > 0 ? portfolioItems : PORTFOLIO_DATA)
                    .filter(item => !(item as any).hidden)
                    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                    .map((item) => (
                      <motion.div
                        key={item.id}
                        variants={fadeInUpVariants}
                        className="group relative bg-[#0a0a0a] border border-white/10 rounded-none overflow-hidden hover:border-white/30 transition-all duration-300"
                      >
                        {/* Image layout container */}
                        <div 
                          className="aspect-[16/10] overflow-hidden relative cursor-pointer group/img"
                          onClick={() => setSelectedPortfolioItem(item)}
                        >
                          <picture>
                            <source srcSet={getOptimizedImageUrl(item.imageUrl, 1080, 'avif')} type="image/avif" />
                            <source srcSet={getOptimizedImageUrl(item.imageUrl, 1080, 'webp')} type="image/webp" />
                            <img
                              src={getOptimizedImageUrl(item.imageUrl, 1080, 'auto')}
                              alt={item.title}
                              className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </picture>
                          
                          {/* Luxury editorial hover cue overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="border border-white/20 bg-black/70 px-4 py-2 text-[10px] uppercase font-mono tracking-[0.2em] text-white">
                              Inspect Frame ✦
                            </div>
                          </div>
                          
                          {/* Category Pill floating top */}
                          <div className="absolute top-4 left-4 bg-black/90 px-3 py-1 rounded-none border border-white/10 text-[9px] font-mono tracking-widest text-zinc-300 uppercase z-10">
                            {item.category}
                          </div>
        
                          {/* Impact text indicator floating bottom right */}
                          <div className="absolute bottom-4 right-4 bg-white text-black px-2.5 py-1 rounded-none font-mono font-medium text-[9px] tracking-wider uppercase z-10">
                            {item.impact}
                          </div>
                        </div>
        
                        <div className="p-6 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-505 uppercase tracking-widest">CLIENT — {item.client}</span>
                            <h3 className="text-lg font-serif text-white font-medium">{item.title}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-zinc-500">{item.year}</span>
                          </div>
                        </div>
        
                      </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
  
          </div>
        </motion.section>
        </>
      )}

      {/* 8. INSTAGRAM showcase SECTION (Required explicitly in request) */}
      {(!sectionVisibility || sectionVisibility.feed) && (
        <>
          <EditorialDivider label="07 // REALTIME DIGITAL SYNDICATION" />
          <motion.section 
            id="instagram" 
            className="py-24 bg-black px-6 md:px-12 relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Digital Feed</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white">Cinematic Instagram Portfolio</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Find our latest daily loops, fine-cut vertical stories, and real-time behind-the-scenes visual experiments live on our digital handle.
              </p>
            </div>
  
            <InstagramGrid />
          </div>
        </motion.section>
        </>
      )}

      {/* 9. CONTACT CTA SECTION */}
      {(!sectionVisibility || sectionVisibility.contact) && (
        <>
          <EditorialDivider label="08 // CLIENT DIRECT OFFICE" />
          <motion.section 
            id="contact" 
            className="py-24 md:py-32 bg-[#080808] px-6 md:px-12 relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Contact Details left */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Verified Business Detail</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight font-medium">Let’s co-write your next visual chapter.</h2>
              <p className="text-xs text-zinc-450 leading-relaxed">
                Whether you are launch planning a high-end luxury lifestyle drop or seeking deep vertical storytelling reach, we are ready to direct. Contact us directly through our new Jaipur creative headquarters.
              </p>
            </div>

            {/* REPLICATED WHATSAPP BUSINESS CARD FROM USER MOCKUP */}
            {(!sectionVisibility || sectionVisibility.whatsapp) && (
              <WhatsAppProfileCard 
                onImageClick={(item) => setSelectedPortfolioItem(item)}
                portfolioItems={PORTFOLIO_DATA}
                config={whatsAppConfig}
              />
            )}

            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">Alternate Hotline</span>
              <div className="flex gap-4 items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>JAIPUR CREATIVE HQ LINE</span>
                <a href="tel:+919876543210" className="text-white hover:underline">+91 98765 43210</a>
              </div>
            </div>
          </div>

          {/* Elegant active form right */}
          <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/10 p-8 md:p-10 rounded-none relative shadow-sm">
            
            <AnimatePresence mode="wait">
              {!formSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmitInquiry}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-serif text-white">Creative Engagement Inquiry</h3>
                    <p className="text-xs text-zinc-500 mt-1">Submit your parameters to receive a customized visual deck and brief evaluation within 24 hours.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full bg-[#060606] border border-white/10 text-xs text-zinc-100 p-3 rounded-none focus:border-white focus:outline-none transition-all placeholder:text-zinc-600"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Corporate Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. vikram@brand.com"
                        className="w-full bg-[#060606] border border-white/10 text-xs text-zinc-100 p-3 rounded-none focus:border-white focus:outline-none transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Contact Phone Code</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98330 12345"
                        className="w-full bg-[#060606] border border-white/10 text-xs text-zinc-100 p-3 rounded-none focus:border-white focus:outline-none transition-all placeholder:text-zinc-600"
                      />
                    </div>

                    {/* Company name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Brand / Company Label</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Chronos Luxury Group"
                        className="w-full bg-[#060606] border border-white/10 text-xs text-zinc-100 p-3 rounded-none focus:border-white focus:outline-none transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  {/* Service selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Direct Service of Interest</label>
                    <select
                      name="serviceOfInterest"
                      value={formData.serviceOfInterest}
                      onChange={handleInputChange}
                      className="w-full bg-[#060606] border border-white/10 text-xs text-zinc-100 p-3 rounded-none focus:border-white focus:outline-none transition-all"
                    >
                      <option value="Cinematic Brand Campaigns">Cinematic Brand Campaigns</option>
                      <option value="Premium Editorial Photography">Premium Editorial Photography</option>
                      <option value="High-Impact Social Video">High-Impact Social Video</option>
                      <option value="Elite Influencer Collabs">Elite Influencer Collabs</option>
                    </select>
                  </div>

                  {/* Project description brief */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Campaign Objective & Vision</label>
                    <textarea
                      name="projectMessage"
                      rows={4}
                      value={formData.projectMessage}
                      onChange={handleInputChange}
                      placeholder="Briefly describe your mood, timeline, or key objectives..."
                      className="w-full bg-[#060606] border border-white/10 text-xs text-zinc-100 p-3 rounded-none focus:border-white focus:outline-none transition-all placeholder:text-zinc-600 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingForm}
                    className="w-full bg-white hover:bg-zinc-200 text-black py-4 px-6 rounded-none font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent disabled:opacity-50"
                  >
                    {sendingForm ? (
                      <>Transmitting Project Brief...</>
                    ) : (
                      <>
                        Submit Proposal Request
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-zinc-550 text-center leading-normal">
                    By submitting, you align with the photographic and cinematography standards of THE PHOTO BLOG.INDIA.1. We treat all creative proposals as strictly confidential.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="receipt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 py-8 text-center"
                >
                  <div className="w-16 h-16 rounded-none bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
                    <FileCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-serif text-white">Transmission Successful</h3>
                    <p className="text-xs text-zinc-450 max-w-sm mx-auto">
                      Your campaign configuration and parameters have been logged. The creative directors of **THE PHOTO BLOG.INDIA.1** are reviewing the assets.
                    </p>
                  </div>

                  {/* Digital Receipt breakdown */}
                  <div className="bg-[#060606] border border-white/10 rounded-none p-6 text-left max-w-md mx-auto space-y-4 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-zinc-500">CLIENT</span>
                      <span className="text-zinc-100 font-sans font-semibold">{formData.fullName}</span>
                    </div>
                    {formData.companyName && (
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-zinc-500">BRAND</span>
                        <span className="text-zinc-100">{formData.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-zinc-500">DESIRED TARGET</span>
                      <span className="text-white font-serif font-medium">{formData.serviceOfInterest}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-zinc-500">PROJECTED VALUE</span>
                      <span className="text-zinc-100 font-sans font-semibold">{formData.estimatedBudget}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">STATUS CODE</span>
                      <span className="text-emerald-400 flex items-center gap-1">● BRIEFING LOGGED</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col xs:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
                    <button
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          companyName: '',
                          serviceOfInterest: 'Cinematic Brand Campaigns',
                          estimatedBudget: 'Bespoke Quote Upon Evaluation',
                          projectMessage: ''
                        });
                      }}
                      className="w-full text-xs font-mono text-zinc-450 hover:text-white uppercase transition-colors"
                    >
                      ← Submit New Brief
                    </button>

                    <a
                      href="https://wa.me/919876543210?text=Hi!%20Just%20submitted%20our%20campaign%20brief%20on%20your%20website%20under%20the%20name%20of%20"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-black py-2.5 px-4 rounded-none font-bold text-xs transition-all uppercase gap-1"
                    >
                      Instant WhatsApp ping
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </motion.section>
        </>
      )}

      {/* 10. ELITE FOOTER */}
      <EditorialDivider label="09 // END CREDITS & ARCHIVE" />
      <footer className="bg-black py-16 px-6 md:px-12 text-zinc-400 relative z-30 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          
          <div className="space-y-4 max-w-sm">
            {/* Logo */}
            <div className="flex flex-col items-start text-left">
              <span className="font-serif italic text-base font-semibold text-white uppercase tracking-tight">
                THE PHOTO BLOG.INDIA.1
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              High-end visual directing, cinematic strategy, luxury lifestyle campaigns and exclusive media partnerships across metropolitan Indian centers.
            </p>
          </div>

          {/* Useful links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4 text-xs">
              <h5 className="text-zinc-500 tracking-widest uppercase">NAVIGATE</h5>
              <div className="flex flex-col gap-2 uppercase tracking-[0.12em] text-[10px] text-zinc-400">
                <button onClick={() => scrollToSection('about')} className="text-left hover:text-white transition-colors">About Agency</button>
                <button onClick={() => scrollToSection('services')} className="text-left hover:text-white transition-colors">Services Spec</button>
                <button onClick={() => scrollToSection('estimator')} className="text-left hover:text-white transition-colors">Package Builder</button>
                <button onClick={() => scrollToSection('portfolio')} className="text-left hover:text-white transition-colors">Our Showreel</button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <h5 className="text-zinc-500 tracking-widest uppercase">SYNDICATIONS</h5>
              <div className="flex flex-col gap-2 text-[10px] text-zinc-400 tracking-[0.12em] uppercase">
                <a href="https://www.instagram.com/thephotoblog.india.1/" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">@thephotoblog.india.1</a>
                <span className="cursor-default">Cinematic Reels</span>
                <span className="cursor-default">Brand Collabs</span>
                <span className="cursor-default">Behind Scene</span>
              </div>
            </div>

            <div className="space-y-4 text-xs col-span-2 sm:col-span-1">
              <h5 className="text-zinc-500 tracking-widest uppercase font-mono">REPRESENTATION</h5>
              <div className="flex flex-col gap-1 text-[10px] text-zinc-450 leading-normal uppercase">
                <span className="text-white font-semibold flex items-center gap-1">● Jaipur Headquarters</span>
                <span>Mumbai Creative Hub</span>
                <span>New Delhi Studio</span>
                <span className="text-zinc-650 mt-2">© {new Date().getFullYear()} TPB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Divider and absolute bottom details */}
        <div className="max-w-7xl mx-auto h-px bg-white/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] text-zinc-600 uppercase">
          <p>THE PHOTO BLOG.INDIA.1 IS AN INDEPENDENT DIGITAL MEDIA TRADEMARK OPERATIONAL IN INDIA.</p>
          <div className="flex items-center gap-4">
            <span>8K S Standards</span>
            <span>✦</span>
            <span>Minimalist Editorial Edition</span>
            <span>✦</span>
            <button
              onClick={navigateToAdmin}
              className="hover:text-[#00bfa5] transition-colors cursor-pointer text-[#00a884] lowercase font-mono tracking-widest text-[8.5px]"
            >
              [agency-key]
            </button>
          </div>
        </div>
      </footer>

      {/* 11. PORTFOLIO LIGHTBOX VIEW */}
      <AnimatePresence>
        {selectedPortfolioItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex flex-col justify-between p-6 md:p-12 select-none"
          >
            {/* Header control line */}
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest border-b border-white/10 pb-4">
              <span>THE PHOTO BLOG.INDIA.1 ✦ CASE PORTFOLIO</span>
              <span>FRAME {portfolioItems.findIndex(item => item.id === selectedPortfolioItem.id) + 1} / {portfolioItems.length}</span>
              <button 
                onClick={handleCloseLightbox}
                className="flex items-center gap-1.5 text-white hover:text-zinc-300 transition-colors cursor-pointer text-xs"
              >
                CLOSE [ESC] <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Stage */}
            <div className="flex-1 my-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-7xl mx-auto w-full overflow-hidden">
              
              {/* Left Arrow Button */}
              <button
                onClick={handlePrevPortfolioItem}
                className="hidden lg:flex w-12 h-12 border border-white/10 hover:border-white text-white items-center justify-center rounded-none bg-zinc-950/40 hover:bg-zinc-900 transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Image Container */}
              <div className="flex-1 h-full max-h-[50vh] lg:max-h-[70vh] flex items-center justify-center relative overflow-hidden bg-black/60 border border-white/5 p-2">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedPortfolioItem.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    src={selectedPortfolioItem.imageUrl}
                    alt={selectedPortfolioItem.title}
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              </div>

              {/* Meta details right */}
              <div className="lg:w-80 w-full text-left space-y-6 shrink-0 lg:border-l lg:border-white/10 lg:pl-8 py-2">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase block">
                    {selectedPortfolioItem.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight leading-tight">
                    {selectedPortfolioItem.title}
                  </h3>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>CO-DIRECTOR</span>
                    <span className="text-zinc-200">THE PHOTO BLOG.INDIA.1</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>LAUNCH COLLAB</span>
                    <span className="text-white font-medium">{selectedPortfolioItem.client}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>RECORD YEAR</span>
                    <span className="text-zinc-200">{selectedPortfolioItem.year}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>TRACTION</span>
                    <span className="text-emerald-400 font-semibold">{selectedPortfolioItem.impact}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <button
                    onClick={() => {
                      handleEstimatorIntegration(
                        `Inquiry regarding ${selectedPortfolioItem.title} with ${selectedPortfolioItem.client}.`,
                        selectedPortfolioItem.category,
                        "Custom Collab Budget"
                      );
                      handleCloseLightbox();
                    }}
                    className="w-full bg-white hover:bg-zinc-200 text-black py-3 px-4 font-mono font-bold text-[10px] tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    Inquire On Collab <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSharePortfolio}
                    className="w-full border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white hover:bg-white/5 py-3 px-4 font-mono font-bold text-[10px] tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Portfolio Item</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={handleNextPortfolioItem}
                className="hidden lg:flex w-12 h-12 border border-white/10 hover:border-white text-white items-center justify-center rounded-none bg-zinc-950/40 hover:bg-zinc-900 transition-all cursor-pointer shrink-0"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>

            {/* Mobile Navigation bar */}
            <div className="lg:hidden flex justify-between items-center gap-4 border-t border-white/10 pt-4 pb-2">
              <button
                onClick={handlePrevPortfolioItem}
                className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white uppercase transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev Frame
              </button>
              <button
                onClick={handleNextPortfolioItem}
                className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white uppercase transition-colors"
              >
                Next Frame <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. MINIMAL RETURN TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 border border-white/10 hover:border-white bg-[#0e0e11]/90 backdrop-blur-md text-white flex items-center justify-center rounded-none shadow-xl cursor-pointer hover:bg-white hover:text-black transition-all group"
            title="Return to top"
            aria-label="Return to top"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
