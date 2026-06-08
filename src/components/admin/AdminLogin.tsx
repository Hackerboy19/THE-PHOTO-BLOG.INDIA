import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertTriangle, Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, isFirebaseActive } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface AdminLoginProps {
  onLoginSuccess: (user: { email: string; uid: string; displayName: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('pm37855@gmail.com');
  const [password, setPassword] = useState('jaipurcreative2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Authenticate user
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all credential lines.");
      return;
    }
    
    setLoading(true);
    setError(null);

    // If Firebase Auth is fully active
    if (isFirebaseActive && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        onLoginSuccess({
          email: user.email || '',
          uid: user.uid,
          displayName: user.displayName || 'Authorized Administrator'
        });
        return;
      } catch (err: any) {
        console.warn("Firebase Auth failed, trying local fallback.", err);
        // Let them still use the local credentials so they are never locked out of testing
      }
    }

    // Local secure developer credentials override (always allowed as robust redundancy fallback)
    if (email.trim() === 'pm37855@gmail.com' && password === 'jaipurcreative2026') {
      setTimeout(() => {
        onLoginSuccess({
          email: 'pm37855@gmail.com',
          uid: 'uid_admin_jaipur',
          displayName: 'Muskan'
        });
        setLoading(false);
      }, 800);
    } else {
      setTimeout(() => {
        setError("Invalid signature coordinates. Access denied.");
        setLoading(false);
      }, 500);
    }
  };

  const handleGoogleSignInByPopup = async () => {
    if (!isFirebaseActive || !auth) {
      setError("Firebase credentials have not been initiated yet. Use Local Credentials.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user is the authorized admin email address
      if (user.email === 'pm37855@gmail.com') {
        onLoginSuccess({
          email: user.email || '',
          uid: user.uid,
          displayName: user.displayName || 'Muskan'
        });
      } else {
        setError(`Unauthorized access: ${user.email} is not listed as active admin in firestore.rules.`);
        await signOut(auth);
      }
    } catch (err: any) {
      setError(err.message || "Google Single Sign-On failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#050507] relative overflow-hidden">
      
      {/* Background visual flair */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#0a0a0c] border border-white/10 p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 flex items-center justify-center border border-white/10 bg-zinc-950">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase block">ADMINISTRATOR SECURE KEY-IN</span>
            <h2 className="text-2xl font-serif text-white mt-1">Agency Control Deck</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Authenticated administrative gateway for TPB India.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-3 bg-red-950/40 border border-red-900/50 flex items-start gap-2.5 text-left"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-200 tracking-wide leading-relaxed font-sans">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleAuthSubmit} className="mt-8 space-y-5 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-[#8696a0] uppercase block">email address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white pl-9.5 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-white transition-all rounded-none"
                placeholder="admin@thephotoblog.in"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono tracking-widest text-[#8696a0] uppercase block">access secret</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white pl-9.5 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:border-white transition-all rounded-none"
                placeholder="••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black py-3 px-4 text-[10px] tracking-widest font-mono font-bold uppercase transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? "VERIFYING INTERCEPT..." : "Key into Control Deck"}
              <LogIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {isFirebaseActive ? (
          <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
            <span className="text-[8px] font-mono tracking-widest text-zinc-600 uppercase block">OR SIGN IN VIA PROVIDER</span>
            <button
              onClick={handleGoogleSignInByPopup}
              disabled={loading}
              className="w-full bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-zinc-100 py-2.5 px-4 text-[9px] tracking-widest font-mono uppercase transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-3 h-3 text-red-400" /> Sign In With Google Account
            </button>
          </div>
        ) : (
          <div className="mt-5 p-3 bg-zinc-950/40 border border-white/5 text-[10px] text-zinc-500 font-mono text-left space-y-1">
            <span className="text-white block font-sans font-bold text-[10.5px]">✦ Local Mode Credentials Enabled</span>
            <p className="leading-relaxed text-[9.5px]">
              Firebase is initializing. Use email <span className="text-zinc-200 font-semibold">pm37855@gmail.com</span> with local credential <span className="text-zinc-200 font-semibold">jaipurcreative2026</span> to instantly write/edit.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-[10px] font-mono text-zinc-600">
          THE PHOTO BLOG.INDIA.1 Security Hub • Jaipur HQ
        </div>
      </motion.div>
    </div>
  );
}
