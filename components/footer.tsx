import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Globe, MessageCircle } from 'lucide-react';

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
    <footer className="bg-card/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-bebas)' }}>
            <span className="text-foreground">TECH</span><span className="text-primary">VYRO</span>
          </span>
          <p className="text-sm text-muted-foreground mt-2">Your ultimate entertainment destination</p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 mb-8">
          <a href="https://www.instagram.com/techvyro" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors hover:scale-110" aria-label="Instagram">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="https://www.youtube.com/@techvyro" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors hover:scale-110" aria-label="Youtube">
            <Youtube className="w-6 h-6" />
          </a>
          <a href="https://www.facebook.com/share/187KsWWacM/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors hover:scale-110" aria-label="Facebook">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="https://whatsapp.com/channel/0029Vadk2XHLSmbX3oEVmX37" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors hover:scale-110" aria-label="WhatsApp">
            <MessageCircle className="w-6 h-6" />
          </a>
          <a href="https://www.techvyro.in/" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors hover:scale-110" aria-label="Website">
            <Globe className="w-6 h-6" />
          </a>
          <a href="mailto:techvyro@gmail.com" className="p-2 hover:text-primary transition-colors hover:scale-110" aria-label="Email">
            <Mail className="w-6 h-6" />
          </a>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 TechVyro. All rights reserved. Powered by TMDB API.
          </p>
        </div>
      </div>
    </footer>
  );
}
