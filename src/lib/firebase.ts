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
import { PortfolioItem } from '../types';

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
