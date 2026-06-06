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
