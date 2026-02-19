import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ className = '', frameClassName = '', logoClassName = '' }) => {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`} data-testid="brand-logo">
      <div className={`overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 ${frameClassName}`}>
        <img
          src="/investyz-logo.png"
          alt="Investyz logo"
          className={`h-full w-full object-cover object-center scale-[1.42] brightness-110 contrast-110 ${logoClassName}`}
        />
      </div>
    </Link>
  );
};

export default BrandLogo;
