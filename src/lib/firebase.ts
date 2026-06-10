import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PortfolioItem, Service, WhyChooseUsItem, Testimonial, InstagramPost, ClientProject } from '../types';
import { SERVICES_DATA, WHY_CHOOSE_US_DATA, TESTIMONIALS_DATA, INSTAGRAM_POSTS } from '../data';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Check if Firebase was actually set up with valid keys
export const isFirebaseActive = !!(firebaseConfig && firebaseConfig.apiKey);

let app;
let auth: any = null;
let db: any = null;

if (isFirebaseActive) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
  } catch (error) {
    console.warn("Could not load Firebase. Falling back to LocalStorage.", error);
  }
}

export { auth, db };

// Robust error handler mapping to required error format
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// CENTRAL STORAGE LAYER (Firestore / LocalStorage)
// ==========================================

export interface EstimatorSettings {
  basePrices: Record<string, number>;
  scaleMultipliers: Record<string, number>;
  timelineMultipliers: Record<string, number>;
}

export interface HeroSettings {
  backgroundImage: string;
  videoUrl: string;
  sloganTitle: string;
  sloganSubtitle: string;
}

// DEFAULT INITIAL CONTENT
const DEFAULT_HERO: HeroSettings = {
  backgroundImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000",
  videoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761",
  sloganTitle: "We turn your brand into a cinematic story.",
  sloganSubtitle: "Rajasthan-rooted, nation-directing new-age creative agency engineering social performance & brand aesthetics."
};

const DEFAULT_ESTIMATOR_CONFIG: EstimatorSettings = {
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
};

const KEY_HERO = "tpb_settings_hero";
const KEY_ESTIMATOR = "tpb_settings_estimator";
const KEY_PORTFOLIO = "tpb_portfolio_list";
const KEY_INSTAGRAM = "tpb_instagram_posts_list";
const KEY_MOCK_AUTH = "tpb_mock_auth_user";

// --- HERO DATA ENDPOINTS ---
export async function getHeroData(): Promise<HeroSettings> {
  if (isFirebaseActive && db) {
    const path = 'settings/hero';
    try {
      const snap = await getDoc(doc(db, 'settings', 'hero'));
      if (snap.exists()) {
        return snap.data() as HeroSettings;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }
  
  // Local storage fallback
  const local = localStorage.getItem(KEY_HERO);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return DEFAULT_HERO;
}

export async function saveHeroData(data: HeroSettings): Promise<void> {
  // Always save locally first for immediate responsiveness
  localStorage.setItem(KEY_HERO, JSON.stringify(data));

  if (isFirebaseActive && db) {
    const path = 'settings/hero';
    try {
      await setDoc(doc(db, 'settings', 'hero'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

// --- ESTIMATOR DATA ENDPOINTS ---
export async function getEstimatorConfig(): Promise<EstimatorSettings> {
  if (isFirebaseActive && db) {
    const path = 'settings/estimator';
    try {
      const snap = await getDoc(doc(db, 'settings', 'estimator'));
      if (snap.exists()) {
        return snap.data() as EstimatorSettings;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  // Local storage fallback
  const local = localStorage.getItem(KEY_ESTIMATOR);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return DEFAULT_ESTIMATOR_CONFIG;
}

export async function saveEstimatorConfig(data: EstimatorSettings): Promise<void> {
  localStorage.setItem(KEY_ESTIMATOR, JSON.stringify(data));

  if (isFirebaseActive && db) {
    const path = 'settings/estimator';
    try {
      await setDoc(doc(db, 'settings', 'estimator'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

// --- PORTFOLIO DATA ENDPOINTS (CRUD) ---
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (isFirebaseActive && db) {
    const path = 'portfolio';
    try {
      const colRef = collection(db, 'portfolio');
      const querySnap = await getDocs(colRef);
      const items: PortfolioItem[] = [];
      querySnap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as PortfolioItem);
      });
      if (items.length > 0) return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  // Fallback to local storage or hardcoded constants in data.ts
  const local = localStorage.getItem(KEY_PORTFOLIO);
  if (local) {
    try {
      const items = JSON.parse(local);
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (_) {}
  }
  
  // Default seed list from original data.ts
  const fallbackList: PortfolioItem[] = [
    {
      id: "p-1",
      title: "Timeless Precision Campaign",
      category: "Brand Collaboration",
      client: "Chronos India Watches",
      imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000",
      year: "2025",
      impact: "1.2M Reels Views",
      shutter: "1/500 sec",
      iso: "ISO 100",
      aperture: "f/1.8"
    },
    {
      id: "p-2",
      title: "Serenades of Silhouette",
      category: "Editorial Photography",
      client: "SIA Luxury Couture",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000",
      year: "2025",
      impact: "+145% Digital Growth",
      shutter: "1/200 sec",
      iso: "ISO 400",
      aperture: "f/2.8"
    },
    {
      id: "p-3",
      title: "Vanguard Backlight Speedster",
      category: "Cinematic Videography",
      client: "Apex Electric Motorcars",
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
      year: "2026",
      impact: "Commercial Feature",
      shutter: "1/50 sec",
      iso: "ISO 800",
      aperture: "f/1.2"
    },
    {
      id: "p-4",
      title: "Vistas of Oasis",
      category: "Brand Campaign",
      client: "Horizon Luxury Villas",
      imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1000",
      year: "2024",
      impact: "Sold Out Campaign",
      shutter: "1/1000 sec",
      iso: "ISO 200",
      aperture: "f/4.0"
    }
  ];
  return fallbackList;
}

export async function savePortfolioItem(item: PortfolioItem): Promise<void> {
  const all = await getPortfolioItems();
  const index = all.findIndex(x => x.id === item.id);
  if (index >= 0) {
    all[index] = item;
  } else {
    all.push(item);
  }
  localStorage.setItem(KEY_PORTFOLIO, JSON.stringify(all));

  if (isFirebaseActive && db) {
    const path = `portfolio/${item.id}`;
    try {
      await setDoc(doc(db, 'portfolio', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const all = await getPortfolioItems();
  const updated = all.filter(x => x.id !== id);
  localStorage.setItem(KEY_PORTFOLIO, JSON.stringify(updated));

  if (isFirebaseActive && db) {
    const path = `portfolio/${id}`;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

/**
 * Subscribes to the live portfolio items roster with real-time reactive sync.
 * Cascades to local storage subscription loops during standard local pre-views.
 */
export function subscribeToPortfolioItems(onUpdate: (items: PortfolioItem[]) => void): () => void {
  if (isFirebaseActive && db) {
    try {
      const colRef = collection(db, 'portfolio');
      const unsubscribe = onSnapshot(colRef, (querySnap) => {
        const items: PortfolioItem[] = [];
        querySnap.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as PortfolioItem);
        });
        if (items.length > 0) {
          onUpdate(items);
        } else {
          getPortfolioItems().then(onUpdate);
        }
      }, (err) => {
        console.warn("Error in portfolio onSnapshot sub:", err);
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Failed to subscribe portfolio snapshot:", err);
    }
  }

  // Fallback: Reactive LocalStorage Polling
  let lastState = '';
  const poll = async () => {
    try {
      const items = await getPortfolioItems();
      const stringified = JSON.stringify(items);
      if (stringified !== lastState) {
        lastState = stringified;
        onUpdate(items);
      }
    } catch (_) {}
  };

  poll();
  const intervalId = setInterval(poll, 1000);
  return () => clearInterval(intervalId);
}

// ==========================================
// NEW EXTENDED SITE CONTROL CONFIGS & ENDPOINTS
// ==========================================

export interface AboutSettings {
  backstory: string;
  shutter: string;
  iso: string;
  aperture: string;
  aboutImage: string;
}

export interface WhatsAppConfig {
  slogan: string;
  quote: string;
  hours: string;
  followers: string;
  phone: string;
}

export interface SectionVisibilitySettings {
  about: boolean;
  services: boolean;
  estimator: boolean;
  whyUs: boolean;
  portfolio: boolean;
  testimonials: boolean;
  feed: boolean;
  whatsapp: boolean;
  contact: boolean;
}

const DEFAULT_ABOUT: AboutSettings = {
  backstory: "We turn your brand into a story which digital media celebrates. A Jaipur-rooted marketing agency thriving to grow brands globally. We take immense pride in shaping businesses led by women and visionary founders.",
  shutter: "1/250",
  iso: "100",
  aperture: "f/1.4",
  aboutImage: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800"
};

const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  slogan: "We turn your brand into a story which digital media celebrates. A Jaipur-rooted marketing agency thriving to grow brands globally.",
  quote: "We don’t just market. We build brands. Jaipur rooted. Growing globally.",
  hours: "10:00 am – 6:00 pm",
  followers: "38K Followers",
  phone: "9145961226"
};

const DEFAULT_VISIBILITY: SectionVisibilitySettings = {
  about: true,
  services: true,
  estimator: true,
  whyUs: true,
  portfolio: true,
  testimonials: true,
  feed: true,
  whatsapp: true,
  contact: true
};

const KEY_ABOUT = "tpb_settings_about";
const KEY_SERVICES = "tpb_settings_services";
const KEY_WHYUS = "tpb_settings_whyus";
const KEY_TESTIMONIALS = "tpb_settings_testimonials";
const KEY_WHATSAPP = "tpb_settings_whatsapp";
const KEY_VISIBILITY = "tpb_settings_visibility";

// --- ABOUT DATA ENDPOINTS ---
export async function getAboutSettings(): Promise<AboutSettings> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'about'));
      if (snap.exists()) {
        return { ...DEFAULT_ABOUT, ...snap.data() } as AboutSettings;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/about');
    }
  }
  const local = localStorage.getItem(KEY_ABOUT);
  if (local) {
    try { return { ...DEFAULT_ABOUT, ...JSON.parse(local) }; } catch (_) {}
  }
  return DEFAULT_ABOUT;
}

export async function saveAboutSettings(data: AboutSettings): Promise<void> {
  localStorage.setItem(KEY_ABOUT, JSON.stringify(data));
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'settings', 'about'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/about');
    }
  }
}

// --- SERVICES ENDPOINTS ---
export async function getServices(): Promise<Service[]> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(collection(db, 'services'));
      const list: Service[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Service);
      });
      if (list.length > 0) return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'services');
    }
  }
  const local = localStorage.getItem(KEY_SERVICES);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return [...SERVICES_DATA];
}

export async function saveService(item: Service): Promise<void> {
  const all = await getServices();
  const index = all.findIndex((x) => x.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push(item);
  localStorage.setItem(KEY_SERVICES, JSON.stringify(all));

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'services', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `services/${item.id}`);
    }
  }
}

export async function saveAllServices(items: Service[]): Promise<void> {
  localStorage.setItem(KEY_SERVICES, JSON.stringify(items));
  if (isFirebaseActive && db) {
    for (const item of items) {
      try {
        await setDoc(doc(db, 'services', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `services/${item.id}`);
      }
    }
  }
}

export async function deleteService(id: string): Promise<void> {
  const all = await getServices();
  const filtered = all.filter((x) => x.id !== id);
  localStorage.setItem(KEY_SERVICES, JSON.stringify(filtered));

  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  }
}

// --- WHY CHOOSE US ENDPOINTS ---
export async function getWhyChooseUs(): Promise<WhyChooseUsItem[]> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(collection(db, 'whyUs'));
      const list: WhyChooseUsItem[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as WhyChooseUsItem);
      });
      if (list.length > 0) return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'whyUs');
    }
  }
  const local = localStorage.getItem(KEY_WHYUS);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return [...WHY_CHOOSE_US_DATA];
}

export async function saveWhyChooseUsItem(item: WhyChooseUsItem): Promise<void> {
  const all = await getWhyChooseUs();
  const index = all.findIndex((x) => x.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push(item);
  localStorage.setItem(KEY_WHYUS, JSON.stringify(all));

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'whyUs', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `whyUs/${item.id}`);
    }
  }
}

export async function saveAllWhyChooseUs(items: WhyChooseUsItem[]): Promise<void> {
  localStorage.setItem(KEY_WHYUS, JSON.stringify(items));
  if (isFirebaseActive && db) {
    for (const item of items) {
      try {
        await setDoc(doc(db, 'whyUs', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `whyUs/${item.id}`);
      }
    }
  }
}

export async function deleteWhyChooseUsItem(id: string): Promise<void> {
  const all = await getWhyChooseUs();
  const filtered = all.filter((x) => x.id !== id);
  localStorage.setItem(KEY_WHYUS, JSON.stringify(filtered));

  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'whyUs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `whyUs/${id}`);
    }
  }
}

// --- TESTIMONIALS ENDPOINTS ---
export async function getTestimonials(): Promise<Testimonial[]> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      const list: Testimonial[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Testimonial);
      });
      if (list.length > 0) return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'testimonials');
    }
  }
  const local = localStorage.getItem(KEY_TESTIMONIALS);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return [...TESTIMONIALS_DATA];
}

export async function saveTestimonial(item: Testimonial): Promise<void> {
  const all = await getTestimonials();
  const index = all.findIndex((x) => x.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push(item);
  localStorage.setItem(KEY_TESTIMONIALS, JSON.stringify(all));

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'testimonials', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${item.id}`);
    }
  }
}

export async function saveAllTestimonials(items: Testimonial[]): Promise<void> {
  localStorage.setItem(KEY_TESTIMONIALS, JSON.stringify(items));
  if (isFirebaseActive && db) {
    for (const item of items) {
      try {
        await setDoc(doc(db, 'testimonials', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `testimonials/${item.id}`);
      }
    }
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const all = await getTestimonials();
  const filtered = all.filter((x) => x.id !== id);
  localStorage.setItem(KEY_TESTIMONIALS, JSON.stringify(filtered));

  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  }
}

// --- WHATSAPP CONFIG ENDPOINTS ---
export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'whatsapp'));
      if (snap.exists()) {
        return { ...DEFAULT_WHATSAPP_CONFIG, ...snap.data() } as WhatsAppConfig;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/whatsapp');
    }
  }
  const local = localStorage.getItem(KEY_WHATSAPP);
  if (local) {
    try { return { ...DEFAULT_WHATSAPP_CONFIG, ...JSON.parse(local) }; } catch (_) {}
  }
  return DEFAULT_WHATSAPP_CONFIG;
}

export async function saveWhatsAppConfig(data: WhatsAppConfig): Promise<void> {
  localStorage.setItem(KEY_WHATSAPP, JSON.stringify(data));
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'settings', 'whatsapp'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/whatsapp');
    }
  }
}

// --- VISIBILITY DATA ENDPOINTS ---
export async function getSectionVisibility(): Promise<SectionVisibilitySettings> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'visibility'));
      if (snap.exists()) {
        return { ...DEFAULT_VISIBILITY, ...snap.data() } as SectionVisibilitySettings;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/visibility');
    }
  }
  const local = localStorage.getItem(KEY_VISIBILITY);
  if (local) {
    try { return { ...DEFAULT_VISIBILITY, ...JSON.parse(local) }; } catch (_) {}
  }
  return DEFAULT_VISIBILITY;
}

export async function saveSectionVisibility(data: SectionVisibilitySettings): Promise<void> {
  localStorage.setItem(KEY_VISIBILITY, JSON.stringify(data));
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'settings', 'visibility'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/visibility');
    }
  }
}

// --- INSTAGRAM FEED ENDPOINTS ---
export async function getInstagramPosts(): Promise<InstagramPost[]> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(collection(db, 'instagram_posts'));
      const list: InstagramPost[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as InstagramPost);
      });
      if (list.length > 0) return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'instagram_posts');
    }
  }
  const local = localStorage.getItem(KEY_INSTAGRAM);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return [...INSTAGRAM_POSTS];
}

export async function saveInstagramPost(item: InstagramPost): Promise<void> {
  const all = await getInstagramPosts();
  const index = all.findIndex((x) => x.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push(item);
  localStorage.setItem(KEY_INSTAGRAM, JSON.stringify(all));

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'instagram_posts', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `instagram_posts/${item.id}`);
    }
  }
}

export async function saveAllInstagramPosts(items: InstagramPost[]): Promise<void> {
  localStorage.setItem(KEY_INSTAGRAM, JSON.stringify(items));
  if (isFirebaseActive && db) {
    for (const item of items) {
      try {
        await setDoc(doc(db, 'instagram_posts', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `instagram_posts/${item.id}`);
      }
    }
  }
}

export async function deleteInstagramPostItem(id: string): Promise<void> {
  const all = await getInstagramPosts();
  const filtered = all.filter((x) => x.id !== id);
  localStorage.setItem(KEY_INSTAGRAM, JSON.stringify(filtered));

  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'instagram_posts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `instagram_posts/${id}`);
    }
  }
}

// --- CLIENT PRE-PRODUCTION PROJECT ENDPOINTS ---
const KEY_CLIENT_PROJECTS = "tpb_client_projects_list";
const DEFAULT_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "TPB-CLIENT-85",
    clientName: "Muskan Mundhra",
    projectName: "Heritage Elegance Campaign",
    projectTitle: "Heritage Elegance Campaign",
    status: "moodboard",
    timelineProgress: 40,
    moodboardUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800",
    proofingVideoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761",
    invoiceAmount: 185000,
    currentMilestone: "Moodboard",
    milestoneStatus: "in-progress",
    progressPercentage: 40,
    lastUpdated: "June 2026",
    draftVideoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761",
    feedbackComments: [
      { id: "cmt-1", timestamp: "00:15", author: "Muskan Mundhra", text: "The lighting of Jantar Mantar is impeccable, can we increase the golden hue slightly?", createdDate: "2026-06-03" },
      { id: "cmt-2", timestamp: "00:42", author: "Cinematic Director", text: "Agreed. Added customized orange color grading curves to post-processing pipeline.", createdDate: "2026-06-04" }
    ],
    proofStills: [
      { id: "still-1", imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800", label: "01 // Jantar Mantar Sunrise Cut", feedback: "Exquisite framing!" },
      { id: "still-2", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800", label: "02 // Camera Setup Behind the Scenes" }
    ]
  },
  {
    id: "TPB-LUXURY-77",
    clientName: "Taj Hotels India",
    projectName: "Royal Luxury Stills Sequence",
    projectTitle: "Royal Luxury Stills Sequence",
    status: "scripting",
    timelineProgress: 20,
    moodboardUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000",
    proofingVideoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761",
    invoiceAmount: 450000,
    currentMilestone: "Scripting",
    milestoneStatus: "completed",
    progressPercentage: 20,
    lastUpdated: "June 2026",
    draftVideoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20341dc17e2e3eed50c1825b42&profile_id=139&oauth2_token_id=57447761",
    feedbackComments: [],
    proofStills: []
  }
];

export async function getClientProjects(): Promise<ClientProject[]> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(collection(db, 'client_projects'));
      const list: ClientProject[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ClientProject);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Firestore error listing client_projects:", err);
    }
  }
  const local = localStorage.getItem(KEY_CLIENT_PROJECTS);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  } else {
    // Save defaults to localStorage initially
    localStorage.setItem(KEY_CLIENT_PROJECTS, JSON.stringify(DEFAULT_CLIENT_PROJECTS));
  }
  return [...DEFAULT_CLIENT_PROJECTS];
}

export async function saveClientProject(item: ClientProject): Promise<void> {
  const all = await getClientProjects();
  const index = all.findIndex((x) => x.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push(item);
  localStorage.setItem(KEY_CLIENT_PROJECTS, JSON.stringify(all));

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'client_projects', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `client_projects/${item.id}`);
    }
  }
}

export async function deleteClientProject(id: string): Promise<void> {
  const all = await getClientProjects();
  const filtered = all.filter((x) => x.id !== id);
  localStorage.setItem(KEY_CLIENT_PROJECTS, JSON.stringify(filtered));

  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'client_projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `client_projects/${id}`);
    }
  }
}

/**
 * Subscribes to a client project with real-time reactive sync.
 * Falls back to LocalStorage polling if Firebase is not active.
 */
export function subscribeToClientProject(id: string, onUpdate: (project: ClientProject | null) => void): () => void {
  const targetId = id.toUpperCase().trim();
  
  if (isFirebaseActive && db) {
    try {
      const docRef = doc(db, 'client_projects', targetId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ id: docSnap.id, ...docSnap.data() } as ClientProject);
        } else {
          onUpdate(null);
        }
      }, (err) => {
        console.warn("Error in client project onSnapshot sub:", err);
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Failed to subscribe using Firestore onSnapshot:", err);
    }
  }

  // Fallback: Reactive LocalStorage Polling
  let lastState = '';
  const poll = () => {
    const local = localStorage.getItem(KEY_CLIENT_PROJECTS);
    if (local) {
      try {
        const list: ClientProject[] = JSON.parse(local);
        const matched = list.find(x => x.id.toUpperCase() === targetId);
        if (matched) {
          const stringified = JSON.stringify(matched);
          if (stringified !== lastState) {
            lastState = stringified;
            onUpdate(matched);
          }
        } else {
          if (lastState !== 'null') {
            lastState = 'null';
            onUpdate(null);
          }
        }
      } catch (_) {}
    }
  };

  poll(); // immediate invocation
  const intervalId = setInterval(poll, 1500);
  return () => clearInterval(intervalId);
}

// ==========================================
// COHESIVE FALLBACK AUTHENTICATION LAYER
// ==========================================
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
}

export function getMockUser(): AdminUser | null {
  const local = localStorage.getItem(KEY_MOCK_AUTH);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return null;
}

export function saveMockUser(user: AdminUser) {
  localStorage.setItem(KEY_MOCK_AUTH, JSON.stringify(user));
}

export function clearMockUser() {
  localStorage.removeItem(KEY_MOCK_AUTH);
}
