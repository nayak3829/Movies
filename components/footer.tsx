'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Globe, MessageCircle } from 'lucide-react';

// Social media icons with unique brand colors and animations
const socialIcons = [
  { 
    icon: Instagram, 
    href: 'https://www.instagram.com/techvyro', 
    label: 'Instagram',
    color: 'hover:text-pink-500',
    bgColor: 'hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600',
    animation: 'hover:rotate-12 hover:scale-125'
  },
  { 
    icon: Youtube, 
    href: 'https://www.youtube.com/@techvyro', 
    label: 'Youtube',
    color: 'hover:text-white',
    bgColor: 'hover:bg-red-600',
    animation: 'hover:scale-125 hover:-translate-y-1'
  },
  { 
    icon: Facebook, 
    href: 'https://www.facebook.com/share/187KsWWacM/?mibextid=wwXIfr', 
    label: 'Facebook',
    color: 'hover:text-white',
    bgColor: 'hover:bg-blue-600',
    animation: 'hover:scale-125 hover:rotate-6'
  },
  { 
    icon: MessageCircle, 
    href: 'https://whatsapp.com/channel/0029Vadk2XHLSmbX3oEVmX37', 
    label: 'WhatsApp',
    color: 'hover:text-white',
    bgColor: 'hover:bg-green-500',
    animation: 'hover:scale-125 hover:animate-pulse'
  },
  { 
    icon: Globe, 
    href: 'https://www.techvyro.in/', 
    label: 'Website',
    color: 'hover:text-white',
    bgColor: 'hover:bg-primary',
    animation: 'hover:scale-125 hover:rotate-180'
  },
  { 
    icon: Mail, 
    href: 'mailto:techvyro@gmail.com', 
    label: 'Email',
    color: 'hover:text-white',
    bgColor: 'hover:bg-orange-500',
    animation: 'hover:scale-125 hover:-translate-y-2'
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

        {/* Social Links with Animations */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6 md:mb-8">
          {socialIcons.map((social, index) => {
            const Icon = social.icon;
            return (
              <a 
                key={social.label}
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`
                  relative p-2 sm:p-2.5 rounded-full bg-muted/30 border border-border/50
                  transition-all duration-300 ease-out
                  ${social.color} ${social.bgColor} ${social.animation}
                  group overflow-hidden
                `}
                aria-label={social.label}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-current" />
                <Icon className="w-4 h-4 relative z-10" />
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
