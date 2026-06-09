/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Instagram, Eye, Heart, MessageCircle, ExternalLink, Play, Film, Award, RefreshCw } from 'lucide-react';
import { InstagramHandle, validateInstagramHandle, InstagramPost } from '../types';
import { getInstagramPosts } from '../lib/firebase';

interface InstagramGridProps {
  handle?: InstagramHandle;
}

export default function InstagramGrid({ handle = '@thephotoblog.india.1' }: InstagramGridProps) {
  validateInstagramHandle(handle);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<InstagramPost | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInstagramPosts();
        // filter out hidden posts
        const activeOnly = data.filter(post => !(post as any).hidden);
        setPosts(activeOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePostClick = (post: InstagramPost) => {
    setActivePost(post);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-white" />
        Synchronizing Digital Feed...
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Instagram Profile Header Accent */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-transparent border border-faint rounded-none gap-4">
        <div className="flex items-center gap-4">
          <div className="relative p-0.5 bg-zinc-800">
            <div className="w-16 h-16 bg-black flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=150"
                alt="THE PHOTO BLOG.INDIA"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-white text-black p-1 border border-black flex items-center justify-center">
              <Instagram className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-serif italic text-white flex items-center gap-1">{handle}</h4>
              <span className="text-[9px] font-mono tracking-wider text-zinc-400 border border-faint bg-zinc-900/60 px-2 py-0.5 rounded-none uppercase flex items-center gap-1">
                <Award className="w-2.5 h-2.5" /> Verified Portfolio
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Cinematic Visuals & Luxury Brand Collaborations in India.</p>
          </div>
        </div>

        <a
          href="https://www.instagram.com/thephotoblog.india.1/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white border border-white hover:bg-white hover:text-black px-6 py-3 rounded-none transition-all uppercase cursor-pointer"
        >
          Follow On Instagram
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid of latest portfolio cases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="group relative aspect-square bg-[#0c0c0c] border border-faint rounded-none overflow-hidden cursor-pointer shadow-md hover:border-zinc-500 transition-all duration-300"
          >
            {/* Image Overlay with metadata */}
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-103 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />

            {/* Media Type pill */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 border border-faint flex items-center gap-1 text-[9px] font-mono tracking-widest text-[#F5F5F5] uppercase">
              <Film className="w-3 h-3" />
              {post.type}
            </div>

            {/* Simulated Live View stats footer */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white transition-opacity">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-mono font-medium text-zinc-100">
                  <Play className="w-3 h-3 text-white fill-current" /> {post.views}
                </span>
                <span className="flex items-center gap-1 text-xs font-mono font-medium text-zinc-300">
                  <Heart className="w-3 h-3 text-rose-500 fill-current" /> {post.likes}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-zinc-400 tracking-wider hover:text-white uppercase">
                View Clip
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Reel Viewer Lightbox */}
      {activePost && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setActivePost(null)}
          />
          
          <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-faint rounded-none overflow-hidden flex flex-col md:flex-row z-10 shadow-2xl">
            {/* Visual Screen Area */}
            <div className="relative flex-1 bg-zinc-955 aspect-video md:aspect-auto md:h-[550px] overflow-hidden">
              <img
                src={activePost.imageUrl}
                alt={activePost.caption}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group font-serif">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all hover:scale-105 shadow-lg">
                  <Play className="w-6 h-6 text-white fill-current ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-xs font-mono bg-black/85 px-3 py-2 border border-faint flex items-center justify-between">
                <span className="text-zinc-500">Cinematic Codec: REDCODE RAW 8:1</span>
                <span className="text-white font-serif italic">{handle}</span>
              </div>
            </div>

            {/* Details area */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-900">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-white border border-faint px-2 py-0.5 rounded-none bg-zinc-900/60">
                    {activePost.type}
                  </span>
                  <button
                    onClick={() => setActivePost(null)}
                    className="text-xs font-mono text-zinc-500 hover:text-white uppercase"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-mono tracking-wider text-zinc-500">CINEMATIC STORY</h5>
                  <p className="text-sm text-zinc-400 leading-relaxed font-sans">{activePost.caption}</p>
                </div>

                <div className="h-px bg-zinc-900" />

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Collab Statistics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#060606] border border-faint p-3">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Impressions</span>
                      <div className="text-sm font-sans font-semibold text-white mt-1">{activePost.views}</div>
                    </div>
                    <div className="bg-[#060606] border border-faint p-3">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Saves & Shares</span>
                      <div className="text-sm font-sans font-semibold text-white mt-1">{activePost.likes}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="https://www.instagram.com/thephotoblog.india.1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center bg-white hover:bg-zinc-200 text-black py-2.5 px-4 font-mono text-[10px] tracking-widest uppercase transition-all"
                >
                  View Original Reel
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
