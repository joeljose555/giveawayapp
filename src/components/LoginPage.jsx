import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { USERS } from '../config/auth.js';
import waskLogo from '../assets/wask-logo.svg';
import SiteFooter from './SiteFooter.jsx';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const match = USERS.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (match) {
        onLogin(match);
      } else {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-page-bg">
      <header className="w-full min-w-0 bg-dark-navy text-white shadow-sm">
        <div className="mx-auto flex w-full min-w-0 max-w-5xl items-center px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={waskLogo}
              alt="Wask"
              className="h-9 w-auto max-w-[min(136px,42vw)] shrink-0 object-contain object-left"
            />
            <div className="min-w-0">
              <div className="text-xs text-gray-300">
                Instagram Comment Picker
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex min-w-0 w-full flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl bg-card-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <img
                src={waskLogo}
                alt=""
                aria-hidden
                className="mx-auto mb-3 h-10 w-auto max-w-[200px] object-contain"
              />
              <h1 className="text-xl font-bold text-text-primary">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Sign in to access Wask
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border-grey bg-page-bg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border-grey bg-page-bg px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="mt-2 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-[#00A87A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
