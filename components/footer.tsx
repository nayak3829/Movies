'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Globe, MessageCircle } from 'lucide-react';

// Premium social media icons with glassmorphism and glow effects
const socialIcons = [
  { 
    icon: Instagram, 
    href: 'https://www.instagram.com/techvyro', 
    label: 'Instagram',
    gradient: 'from-amber-500 via-pink-500 to-purple-600',
    shadowColor: 'shadow-pink-500/50',
  },
  { 
    icon: Youtube, 
    href: 'https://www.youtube.com/@techvyro', 
    label: 'Youtube',
    gradient: 'from-red-600 to-red-500',
    shadowColor: 'shadow-red-500/50',
  },
  { 
    icon: Facebook, 
    href: 'https://www.facebook.com/share/187KsWWacM/?mibextid=wwXIfr', 
    label: 'Facebook',
    gradient: 'from-blue-600 to-blue-500',
    shadowColor: 'shadow-blue-500/50',
  },
  { 
    icon: MessageCircle, 
    href: 'https://whatsapp.com/channel/0029Vadk2XHLSmbX3oEVmX37', 
    label: 'WhatsApp',
    gradient: 'from-green-500 to-emerald-400',
    shadowColor: 'shadow-green-500/50',
  },
  { 
    icon: Globe, 
    href: 'https://www.techvyro.in/', 
    label: 'Website',
    gradient: 'from-primary to-primary/80',
    shadowColor: 'shadow-primary/50',
  },
  { 
    icon: Mail, 
    href: 'mailto:techvyro@gmail.com', 
    label: 'Email',
    gradient: 'from-orange-500 to-amber-400',
    shadowColor: 'shadow-orange-500/50',
  },
];

export function Footer() {
  const footerLinks = [
    {
      title: 'Navigation',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Movies', href: '/movies' },
        { label: 'TV Shows', href: '/tv-shows' },
        { label: 'My List', href: '/my-list' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Instagram', href: 'https://www.instagram.com/techvyro' },
        { label: 'YouTube', href: 'https://www.youtube.com/@techvyro' },
        { label: 'Facebook', href: 'https://www.facebook.com/share/187KsWWacM/?mibextid=wwXIfr' },
        { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029Vadk2XHLSmbX3oEVmX37' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'techvyro@gmail.com', href: 'mailto:techvyro@gmail.com' },
        { label: 'Official Website', href: 'https://www.techvyro.in/' },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-t from-black to-card/30 border-t border-border/50 mt-8 md:mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Logo */}
        <div className="mb-6 md:mb-8 text-center sm:text-left">
          <span className="text-xl md:text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-bebas)' }}>
            <span className="text-foreground">TECH</span><span className="text-primary">VYRO</span>
          </span>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Your ultimate entertainment destination</p>
        </div>

        {/* Premium Social Links with Glassmorphism */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-6 md:mb-8">
          {socialIcons.map((social) => {
            const Icon = social.icon;
            return (
              <a 
                key={social.label}
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative"
                aria-label={social.label}
                title={social.label}
              >
                {/* Glow effect behind */}
                <span 
                  className={`
                    absolute inset-0 rounded-xl bg-gradient-to-br ${social.gradient} 
                    opacity-0 group-hover:opacity-100 blur-md 
                    transition-all duration-500 scale-90 group-hover:scale-125
                  `} 
                />
                
                {/* Main button */}
                <span 
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 sm:w-11 sm:h-11 rounded-xl
                    bg-white/5 backdrop-blur-md
                    border border-white/10
                    transition-all duration-300 ease-out
                    group-hover:bg-gradient-to-br group-hover:${social.gradient}
                    group-hover:border-white/20
                    group-hover:shadow-lg group-hover:${social.shadowColor}
                    group-hover:-translate-y-1 group-hover:scale-105
                  `}
                >
                  <Icon 
                    className="
                      w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground
                      transition-all duration-300
                      group-hover:text-white group-hover:drop-shadow-md
                    " 
                  />
                </span>
              </a>
            );
          })}
        </div>

        {/* Footer Links - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{section.title}</h3>
              <ul className="space-y-1.5 md:space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith('http') || link.href.startsWith('mailto') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-6 md:pt-8 border-t border-border/50 text-center sm:text-left">
          <p className="text-[11px] md:text-sm text-muted-foreground">
            © 2026 TechVyro. All rights reserved. Powered by TMDB API.
          </p>
        </div>
      </div>
    </footer>
  );
}
