/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, WhyChooseUsItem, Testimonial, PortfolioItem } from './types';

export const HERO_BACKGROUND = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000";

export const ABOUT_IMAGE = "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800";

export const SERVICES_DATA: Service[] = [
  {
    id: "service-1",
    title: "Cinematic Brand Campaigns",
    description: "High-spec, narrative-focused video campaigns engineered to create powerful emotional resonance. We handle everything from screenwriting and cinematography to bespoke luxury color grading.",
    metric: "4.5M+ Collective Views",
    features: ["RED & ARRI Cinema Systems", "High-End Storyboarding", "Luxury Post-Production Color Grading", "Bespoke Sound Orchestration"]
  },
  {
    id: "service-2",
    title: "Premium Editorial Photography",
    description: "Ultra-sharp, high-fidelity imagery tailored for luxury lifestyle, premium real estate, high-fashion campaigns, and architectural catalogs.",
    metric: "120+ Published Outlets",
    features: ["Medium Format High-Fidelity Capture", "Signature Cinematic Lighting Setup", "Detail-Oriented Color Correction", "Fine Art Prints & Digital Deliveries"]
  },
  {
    id: "service-3",
    title: "High-Impact Social & Vertical Video",
    description: "Engineered vertical format micro-storytelling and high-retention Reels curated specifically for brand virality. We capture attention in the first 0.4 seconds.",
    metric: "+240% Average Engagement",
    features: ["Optimized retention hook scripts", "Dynamic, sound-synced editing styles", "Viral content strategy & audio pairing", "Platform-native grading and framing"]
  },
  {
    id: "service-4",
    title: "Elite Influencer & Brand Collaborations",
    description: "Aligning elite digital creators, lifestyle icons, and cultural icons with immersive visual campaigns that boost brand trust and authority.",
    metric: "40+ Elite Brand Collabs",
    features: ["Talent Scouting & Negotiation", "Artistic Direction Alignment", "Co-Branded Immersive Experiences", "Comprehensive Campaign ROI Tracking"]
  }
];

export const WHY_CHOOSE_US_DATA: WhyChooseUsItem[] = [
  {
    id: "why-1",
    title: "Unrivaled Cinematic Experience",
    description: "8+ years directing high-end cinematic visual projects throughout India. We blend raw emotional storytelling with corporate brand objectives.",
    iconName: "Film"
  },
  {
    id: "why-2",
    title: "Uncompromising Visual Quality",
    description: "Rendered in flawless cinema standards. Every frame is hand-corrected, calibrated, and mastered for absolute high-fidelity display.",
    iconName: "Sparkles"
  },
  {
    id: "why-3",
    title: "Hyper-Collaborative Client Support",
    description: "Real-time communication, rapid framing revisions, and a highly agile creative team that integrates client feedback with speed.",
    iconName: "Clock"
  },
  {
    id: "why-4",
    title: "Built-In Audience Trust",
    description: "A strong digital native community under `@thephotoblog.india.1` with demonstrated digital reach, giving your brand native authority.",
    iconName: "ShieldCheck"
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t-1",
    quote: "THE PHOTO BLOG.INDIA.1 reshaped our high-fashion luxury launch. Their cinematic teasers didn't just showcase our collection; they crafted an immersive philosophy that sold out our reservation list in hours.",
    author: "Prisha Mehra",
    role: "Art Director",
    brand: "SIA Luxury Couture",
    rating: 5
  },
  {
    id: "t-2",
    quote: "Their team understands light, movement, and mood like actual fine painters. Watching them direct a lifestyle campaign was poetry. The engagement metrics exceeded our targets by over 180%.",
    author: "Arjun Singhania",
    role: "VP of Marketing",
    brand: "Horizon Luxury Villas",
    rating: 5
  },
  {
    id: "t-3",
    quote: "Uncompromising precision and breathtaking results. Their content for our watch brand collaboration drove both viral status and massive commercial interest. Absolutely world-class.",
    author: "Devendra Verma",
    role: "Brand Director",
    brand: "Chronos India",
    rating: 5
  }
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: "p-1",
    title: "Timeless Precision Campaign",
    category: "Brand Collaboration",
    client: "Chronos India Watches",
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000",
    year: "2025",
    impact: "1.2M Reels Views"
  },
  {
    id: "p-2",
    title: "Serenades of Silhouette",
    category: "Editorial Photography",
    client: "SIA Luxury Couture",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000",
    year: "2025",
    impact: "+145% Digital Growth"
  },
  {
    id: "p-3",
    title: "Vanguard Backlight Speedster",
    category: "Cinematic Videography",
    client: "Apex Electric Motorcars",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
    year: "2026",
    impact: "Commercial Feature"
  },
  {
    id: "p-4",
    title: "Vistas of Oasis",
    category: "Brand Campaign",
    client: "Horizon Luxury Villas",
    imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1000",
    year: "2024",
    impact: "Sold Out Campaign"
  }
];

export const INSTAGRAM_POSTS = [
  {
    id: "ig-1",
    type: "Reel",
    views: "152K",
    likes: "18.4K",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600",
    caption: "#Cinematic India campaign behind-the-scenes with RED Weapon 8K..."
  },
  {
    id: "ig-2",
    type: "Campaign",
    views: "88K",
    likes: "9.2K",
    imageUrl: "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&q=80&w=600",
    caption: "Capturing the golden glow of Rajasthan's heritage structures."
  },
  {
    id: "ig-3",
    type: "Collaboration",
    views: "210K",
    likes: "24.5K",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=600",
    caption: "Official collaboration with @ChronosIndia - luxury in slow motion."
  },
  {
    id: "ig-4",
    type: "Editorial",
    views: "115K",
    likes: "12.8K",
    imageUrl: "https://images.unsplash.com/photo-1481137576595-64585507adcf?auto=format&fit=crop&q=80&w=600",
    caption: "Cinematic portraitures under neon rain setting in Mumbai."
  }
];
