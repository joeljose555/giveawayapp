import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from './components/StepIndicator.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';
import StepScanPost from './components/steps/StepScanPost.jsx';
import StepFindAttendance from './components/steps/StepFindAttendance.jsx';
import StepDetermineWinner from './components/steps/StepDetermineWinner.jsx';

const STORAGE_KEYS = {
  url: 'igCommentPicker_url',
  method: 'igCommentPicker_scrapeMethod',
  comments: 'igCommentPicker_comments',
  winners: 'igCommentPicker_winners',
  step: 'igCommentPicker_step',
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

    return {
      step: step ? Number(step) : 1,
      url,
      method,
      comments: JSON.parse(commentsRaw || '[]'),
      winners: JSON.parse(winnersRaw || '[]'),
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

  useEffect(() => {
    const restored = loadSessionState();
    if (restored) {
      setCurrentStep(restored.step || 1);
      setPostUrl(restored.url || '');
      setScrapeMethod(restored.method || null);
      setComments(restored.comments || []);
      setWinners(restored.winners || []);
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
      Object.values(STORAGE_KEYS).forEach((key) =>
        window.sessionStorage.removeItem(key)
      );
    }
  };

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
