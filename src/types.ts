/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  title: string;
  description: string;
  metric: string;
  features: string[];
  hidden?: boolean;
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  hidden?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  brand: string;
  rating: number;
  hidden?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  client: string;
  imageUrl: string;
  year: string;
  impact: string;
  shutter?: string;
  iso?: string;
  aperture?: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceOfInterest: string;
  estimatedBudget: string;
  projectMessage: string;
}

export type InstagramHandle = `@${string}.${string}.${string}.${number}` | `@thephotoblog.india.1` | string;

export interface SocialHandleProps {
  handle: InstagramHandle;
}

/**
 * Validate that an Instagram handle preserves full dot-suffix integrity (e.g. .india.1)
 */
export function validateInstagramHandle(handle: string): boolean {
  if (!handle) return false;
  if (!handle.startsWith('@')) {
    console.warn(`[Social Validation Warning]: Handle "${handle}" must start with "@"`);
    return false;
  }
  // Validate presence of trailing integers or dot segments
  const pattern = /\.[a-zA-Z0-9_-]+\.\d+$/;
  if (!pattern.test(handle) && handle !== '@thephotoblog.india.1') {
    console.warn(`[Social Validation Warning]: Handle "${handle}" is missing numeric suffix or dots.`);
    return false;
  }
  return true;
}

export interface InstagramPost {
  id: string;
  type: string;
  views: string;
  likes: string;
  imageUrl: string;
  caption: string;
}

export interface ClientFeedbackComment {
  id: string;
  timestamp: string; // e.g. "01:24" for timeline reference
  author: string;
  text: string;
  createdDate: string;
}

export interface ClientProofStill {
  id: string;
  imageUrl: string;
  label: string;
  feedback?: string;
}

export interface ClientProject {
  id: string; // ID / link code (e.g. "TPB-CLIENT-85")
  clientName: string;
  projectTitle: string; // explicitly requested
  status: 'scripting' | 'moodboard' | 'production' | 'post-production' | 'review' | 'delivered'; // explicitly requested
  timelineProgress: number; // e.g. 65% (explicitly requested)
  moodboardUrl?: string; // explicitly requested
  proofingVideoUrl?: string; // explicitly requested
  invoiceAmount: number; // explicitly requested

  // Keeping existing keys for graceful backward compatibility with existing components:
  projectName: string;
  currentMilestone: 'Scripting' | 'Moodboard' | 'Production' | 'Post-Prod Edit' | 'Final Review';
  milestoneStatus: 'pending' | 'in-progress' | 'completed';
  progressPercentage: number;
  lastUpdated: string;
  draftVideoUrl: string; // embed video URL, default mock video if empty
  feedbackComments: ClientFeedbackComment[];
  proofStills: ClientProofStill[];
  clientPhone?: string;
}

