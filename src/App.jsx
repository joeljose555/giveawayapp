import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from './components/StepIndicator.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';
import StepScanPost from './components/steps/StepScanPost.jsx';
import StepFindAttendance from './components/steps/StepFindAttendance.jsx';
import StepDetermineWinner from './components/steps/StepDetermineWinner.jsx';
import LoginPage from './components/LoginPage.jsx';

const STORAGE_KEYS = {
  url: 'igCommentPicker_url',
  method: 'igCommentPicker_scrapeMethod',
  comments: 'igCommentPicker_comments',
  winners: 'igCommentPicker_winners',
  step: 'igCommentPicker_step',
  auth: 'igCommentPicker_auth',
};

function loadSessionState() {
  if (typeof window === 'undefined') return null;
  try {
    const step = window.sessionStorage.getItem(STORAGE_KEYS.step);
    const url = window.sessionStorage.getItem(STORAGE_KEYS.url) || '';
    const method = window.sessionStorage.getItem(STORAGE_KEYS.method);
    const commentsRaw =
      window.sessionStorage.getItem(STORAGE_KEYS.comments) || '[]';
    const winnersRaw =
      window.sessionStorage.getItem(STORAGE_KEYS.winners) || '[]';
    const authRaw = window.sessionStorage.getItem(STORAGE_KEYS.auth);

    return {
      step: step ? Number(step) : 1,
      url,
      method,
      comments: JSON.parse(commentsRaw || '[]'),
      winners: JSON.parse(winnersRaw || '[]'),
      user: authRaw ? JSON.parse(authRaw) : null,
    };
  } catch {
    return null;
  }
}

const pageVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [appError, setAppError] = useState(null);
  const [postUrl, setPostUrl] = useState('');
  const [comments, setComments] = useState([]);
  const [scrapeMethod, setScrapeMethod] = useState(null);
  const [winners, setWinners] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const restored = loadSessionState();
    if (restored) {
      setCurrentStep(restored.step || 1);
      setPostUrl(restored.url || '');
      setScrapeMethod(restored.method || null);
      setComments(restored.comments || []);
      setWinners(restored.winners || []);
      if (restored.user) {
        setLoggedInUser(restored.user);
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEYS.url, postUrl || '');
  }, [postUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(
      STORAGE_KEYS.comments,
      JSON.stringify(comments || [])
    );
  }, [comments]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (scrapeMethod) {
      window.sessionStorage.setItem(STORAGE_KEYS.method, scrapeMethod);
    }
  }, [scrapeMethod]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(
      STORAGE_KEYS.winners,
      JSON.stringify(winners || [])
    );
  }, [winners]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEYS.step, String(currentStep));
  }, [currentStep]);

  const handleLogin = (user) => {
    setLoggedInUser(user);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      // Store without password for safety
      const { password: _omit, ...safeUser } = user;
      window.sessionStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(safeUser));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setAppError(null);
    setCurrentStep(1);
    setPostUrl('');
    setComments([]);
    setScrapeMethod(null);
    setWinners([]);
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) =>
        window.sessionStorage.removeItem(key)
      );
    }
  };

  const handleResetError = () => {
    setAppError(null);
    setCurrentStep(1);
  };

  const handleStartOver = () => {
    setAppError(null);
    setCurrentStep(1);
    setPostUrl('');
    setComments([]);
    setScrapeMethod(null);
    setWinners([]);

    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS)
        .filter((key) => key !== STORAGE_KEYS.auth)
        .forEach((key) => window.sessionStorage.removeItem(key));
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const sharedStepProps = {
    postUrl,
    setPostUrl,
    comments,
    setComments,
    scrapeMethod,
    setScrapeMethod,
    winners,
    setWinners,
    setCurrentStep,
    onError: (error) => {
      setAppError(error);
    },
    onStartOver: handleStartOver,
  };

  let stepKey = appError ? 'error' : String(currentStep);
  let stepContent = null;

  if (appError) {
    stepContent = (
      <ErrorScreen
        error={appError}
        onTryAgain={handleResetError}
        postUrl={postUrl}
      />
    );
  } else if (currentStep === 1) {
    stepContent = <StepScanPost {...sharedStepProps} />;
  } else if (currentStep === 2) {
    stepContent = <StepFindAttendance {...sharedStepProps} />;
  } else {
    stepContent = <StepDetermineWinner {...sharedStepProps} />;
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <header className="bg-dark-navy text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-lg font-bold">
              IG
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-primary">
                Giveaway Helper
              </div>
              <div className="text-xs text-gray-300">
                Instagram Comment Picker
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loggedInUser?.avatarUrl ? (
              <img
                src={loggedInUser.avatarUrl}
                alt={loggedInUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-xs font-bold text-white">
                {loggedInUser?.initials}
              </div>
            )}
            <span className="hidden text-sm font-medium text-white sm:block">
              {loggedInUser?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/60 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <StepIndicator currentStep={currentStep} />

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
