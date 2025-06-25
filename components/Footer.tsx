
import React from 'react';
import { Link } from 'react-router-dom';
import { SocialIcons, APP_NAME } from '../constants';

const Footer: React.FC = () => {
  const socialLinks = [
    { name: 'Blog', Icon: SocialIcons.Blog, url: 'https://hereandnowai.com/blog' },
    { name: 'LinkedIn', Icon: SocialIcons.LinkedIn, url: 'https://www.linkedin.com/company/hereandnowai/' },
    { name: 'Instagram', Icon: SocialIcons.Instagram, url: 'https://instagram.com/hereandnow_ai' },
    { name: 'GitHub', Icon: SocialIcons.GitHub, url: 'https://github.com/hereandnowai' },
    { name: 'X', Icon: SocialIcons.XTwitter, url: 'https://x.com/hereandnow_ai' },
    { name: 'YouTube', Icon: SocialIcons.YouTube, url: 'https://youtube.com/@hereandnow_ai' },
  ];

  return (
    <footer className="bg-slate-800 text-slate-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="text-xl font-bold text-white mb-3">{APP_NAME}</h5>
            <p className="text-sm text-slate-400">Your personalized AI learning companion for career growth.</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-sky-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors text-sm">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-sky-400 transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-sky-400 transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Connect With Us</h5>
            <div className="flex space-x-4">
              {socialLinks.map(({ name, Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Here and now ai Artificial intelligence research institute. All rights reserved. </p>
          <p>Powered by AI excellence.</p>
          <p className="mt-1">Developed by Bilmia Binson.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
