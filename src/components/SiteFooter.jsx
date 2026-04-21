import React from 'react';

function FooterLink({ children }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="text-sm text-gray-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </a>
  );
}

const columns = [
  {
    title: 'About us',
    links: ['About SwiftWin', 'Our team', 'Careers', 'Press'],
  },
  {
    title: 'Products',
    links: ['Comment picker', 'Giveaway tools', 'Integrations', 'Pricing'],
  },
  {
    title: 'Solutions',
    links: ['For creators', 'For brands', 'Agencies', 'Enterprise'],
  },
  {
    title: 'Resources',
    links: ['Help center', 'Blog', 'Status', 'Contact'],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto w-full min-w-0 border-t border-white/10 bg-dark-navy text-white">
      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((label) => (
                  <li key={label}>
                    <FooterLink>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} SwiftWin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
