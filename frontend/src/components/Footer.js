import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, MessageCircle, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Segments', href: '/segments' },
      { name: 'Investment Plans', href: '/segments' },
      { name: 'Calculator', href: '/segments/renewable-energy' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    company: [
      { name: 'About Us', href: '/#about' },
      { name: 'How It Works', href: '/#how-it-works' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Risk Disclaimer', href: '#' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Github', icon: Github, href: '#' },
    { name: 'Discord', icon: MessageCircle, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@investyz.io' },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <BrandLogo className="mb-4" frameClassName="h-11 w-[180px]" />
            <p className="text-sm text-black mb-6 max-w-xs">
              Invest in sustainable infrastructure. Earn yields while powering the green economy on Solana.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                  data-testid={`footer-social-${social.name.toLowerCase()}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-['Outfit'] text-black">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-black hover:text-black/80 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-['Outfit'] text-black">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-black hover:text-black/80 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-['Outfit'] text-black">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-black hover:text-black/80 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-black">
            Copyright {currentYear} Investyz. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-black">
            <span>Powered by</span>
            <span className="font-semibold text-black">Polygon</span>
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8247E5] to-[#A379FF]" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
