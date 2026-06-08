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
