
import React from 'react';
import { 
  Users, 
  Cpu, 
  Globe, 
  Zap, 
  Layers, 
} from 'lucide-react';
import { Initiative, Service } from './types';

export const INITIATIVES: Initiative[] = [
  {
    id: 'blk-tech-connect',
    title: 'BLK Tech Connect',
    description: 'A community-building initiative designed to elevate talent and expand access within the technology sector for black professionals.',
    icon: <Users className="w-8 h-8 text-brand-gold" />,
    tags: ['Community', 'Inclusion', 'Tech Access'],
    link: '/initiatives'
  }
];

export const SERVICES: Service[] = [
  {
    title: 'Tech Development',
    description: 'Building custom software solutions that drive operational excellence and community impact.',
    icon: <Cpu className="w-6 h-6 text-brand-gold" />
  },
  {
    title: 'Community Building',
    description: 'Designing networks and platforms that foster inclusive innovation and collaborative growth.',
    icon: <Globe className="w-6 h-6 text-brand-gold" />
  },
  {
    title: 'Data Intelligence',
    description: 'Leveraging advanced analytics to uncover opportunities and guide strategic decision-making.',
    icon: <Layers className="w-6 h-6 text-brand-gold" />
  },
  {
    title: 'Growth Strategy',
    description: 'Accelerating the transition of bold ideas into high-impact, scalable digital realities.',
    icon: <Zap className="w-6 h-6 text-brand-gold" />
  }
];

export const NAVIGATION_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Initiatives', href: '/initiatives' },
  { name: 'Services', href: '/services' }
];

export const COMMUNITY_PARTNERS = [
  'Majestic Light Group',
  'Baltimore Tech',
  'Palava Hut',
  'The Black Founders Table',
];
