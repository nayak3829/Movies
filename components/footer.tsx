'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Globe, MessageCircle, Film, Tv, TrendingUp, Star } from 'lucide-react';

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
    label: 'YouTube',
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

const stats = [
  { icon: Film, label: 'Movies', value: '10,000+' },
  { icon: Tv, label: 'TV Shows', value: '5,000+' },
  { icon: TrendingUp, label: 'Updated Daily', value: 'Live' },
  { icon: Star, label: 'TMDB Rating', value: '4.8★' },
];

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Movies', href: '/movies' },
  { label: 'TV Shows', href: '/tv-shows' },
  { label: 'New & Popular', href: '/new-popular' },
  { label: 'My Watchlist', href: '/my-list' },
  { label: 'History', href: '/history' },
  { label: 'Genres', href: '/genres' },
];

const connectLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/techvyro' },
  { label: 'YouTube', href: 'https://www.youtube.com/@techvyro' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/187KsWWacM/?mibextid=wwXIfr' },
  { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029Vadk2XHLSmbX3oEVmX37' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'TMDB Attribution', href: 'https://www.themoviedb.org/', external: true },
  { label: 'Official Website', href: 'https://www.techvyro.in/', external: true },
  { label: 'Contact Us', href: 'mailto:techvyro@gmail.com', external: true },
];

export function Footer() {
  return (
    <footer className="relative mt-8 md:mt-20 overflow-hidden">
      {/* Top gradient fade */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black to-black" />

      {/* Subtle red glow top-left */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-4 pt-12 pb-6 md:pt-16 md:pb-8">

        {/* Top row: Logo + Description */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-sm">
            <Link href="/" className="inline-block mb-3">
              <span className="text-3xl md:text-4xl font-bold tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
                <span className="text-white">TECH</span>
                <span className="text-primary">VYRO</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate streaming discovery platform. Explore thousands of movies and TV shows,
              build your watchlist, and find your next favourite watch — all in one place.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Follow Us</p>
            <div className="flex flex-wrap gap-2.5">
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
                    <span
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${social.gradient} opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 scale-90 group-hover:scale-125`}
                    />
                    <span
                      className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 ease-out group-hover:bg-gradient-to-br group-hover:${social.gradient} group-hover:border-white/20 group-hover:shadow-lg group-hover:${social.shadowColor} group-hover:-translate-y-1 group-hover:scale-105`}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-white group-hover:drop-shadow-md" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 md:mb-14">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10 md:mb-14" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 mb-10 md:mb-14">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Connect</h3>
            <ul className="space-y-2.5">
              {connectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300 rounded-full" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Info</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300 rounded-full" />
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300 rounded-full" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mb-8 md:mb-10">
          <p className="text-[11px] md:text-xs text-muted-foreground/70 leading-relaxed text-center">
            TechVyro is a movie and TV show discovery platform powered by the{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-primary transition-colors">
              TMDB API
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
            All movie/show data, images, and metadata are property of their respective copyright holders.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/40">
          <p className="text-[11px] md:text-xs text-muted-foreground/60 text-center sm:text-left">
            © 2026 TechVyro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-[11px] md:text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/30 text-xs">|</span>
            <a href="https://www.techvyro.in/" target="_blank" rel="noopener noreferrer" className="text-[11px] md:text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
              techvyro.in
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
