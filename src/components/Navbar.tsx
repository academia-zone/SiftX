import React, { useState, useEffect } from 'react';
import { Menu, X, User, ArrowRight, ShieldCheck, Sun, Moon, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install SiftX: Click your browser address bar menu (three dots / share) and select "Install SiftX App" or "Add to Home Screen".');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail) {
      setLoginSuccess(true);
      setTimeout(() => {
        setShowLoginModal(false);
        setLoginSuccess(false);
      }, 1200);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between relative">
          
          {/* Left: Brand Logo (Acts as Home Gateway) */}
          <div className="flex items-center shrink-0">
            <div 
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center cursor-pointer select-none group py-1"
              title="SiftX Tool - Home"
            >
              <img 
                src={theme === 'dark' ? '/logo-white.png' : '/logo.png'} 
                alt="SiftX Tool" 
                className="h-12 sm:h-14 md:h-15 w-auto object-contain hover:opacity-95 transition-transform group-hover:scale-102" 
              />
            </div>
          </div>

          {/* Center: Navigation Links in Exact Middle ("mid mein aye bus") */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-sm font-semibold">
            <button
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`py-2 transition-colors cursor-pointer ${
                currentPage === 'home'
                  ? 'text-[#0176fd] dark:text-[#01bbfd] font-bold border-b-2 border-[#0176fd] dark:border-[#01bbfd]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0176fd] dark:hover:text-[#01bbfd]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setCurrentPage('tool-studio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`py-2 transition-colors cursor-pointer ${
                currentPage === 'tool-studio'
                  ? 'text-[#0176fd] dark:text-[#01bbfd] font-bold border-b-2 border-[#0176fd] dark:border-[#01bbfd]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0176fd] dark:hover:text-[#01bbfd]'
              }`}
            >
              Tools
            </button>

            <button
              onClick={() => {
                setCurrentPage('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`py-2 transition-colors cursor-pointer ${
                currentPage === 'about'
                  ? 'text-[#0176fd] dark:text-[#01bbfd] font-bold border-b-2 border-[#0176fd] dark:border-[#01bbfd]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0176fd] dark:hover:text-[#01bbfd]'
              }`}
            >
              About Us
            </button>
          </nav>

          {/* Right Side: Install App + Theme Toggle + Clean Login Action */}
          <div className="hidden md:flex items-center justify-end gap-3 shrink-0">
            {/* Install Desktop / Mobile PWA App Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Install SiftX to Desktop or Mobile"
              >
                <Download className="w-3.5 h-3.5 text-[#0176fd] dark:text-[#01bbfd]" />
                <span>Install App</span>
              </button>
            )}

            {/* Sun / Moon Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Login Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-7 py-2.5 rounded-full siftx-pill-btn font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:shadow-lg hover:shadow-[#0176fd]/25"
            >
              <User className="w-4 h-4 text-white" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile Actions Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 rounded-full siftx-pill-btn font-bold text-xs"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Clean Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
            <button
              onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold ${
                currentPage === 'home' ? 'bg-sky-50 dark:bg-slate-800 text-[#0176fd] dark:text-[#01bbfd]' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentPage('tool-studio'); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold ${
                currentPage === 'tool-studio' ? 'bg-sky-50 dark:bg-slate-800 text-[#0176fd] dark:text-[#01bbfd]' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold ${
                currentPage === 'about' ? 'bg-sky-50 dark:bg-slate-800 text-[#0176fd] dark:text-[#01bbfd]' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              About Us
            </button>
            {!isInstalled && (
              <button
                onClick={() => { handleInstallClick(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#0176fd] dark:text-[#01bbfd]" />
                <span>Install SiftX App</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Interactive Zoom-Style Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-8 sm:p-10 space-y-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Brand Monogram */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl p-1 bg-white border border-slate-200 shadow-md flex items-center justify-center">
                  <img src="/favicon.png" alt="SiftX Monogram" className="w-10 h-10 object-contain" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-[#020f22] tracking-tight">
                    Welcome to SiftX
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sign in to sync your workspace & custom tool preferences
                  </p>
                </div>
              </div>

              {loginSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm text-emerald-900">Signed In Successfully!</p>
                  <p className="text-xs text-emerald-700">Workspace connected with local privacy.</p>
                </div>
              ) : (
                <>
                  {/* Google 1-Click Button */}
                  <button
                    onClick={() => {
                      setLoginSuccess(true);
                      setTimeout(() => setShowLoginModal(false), 1200);
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span>or with email</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Email & Submit Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0176fd] text-xs sm:text-sm text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full siftx-pill-btn font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Continue to Studio</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </form>

                  {/* Continue as Guest option */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setShowLoginModal(false)}
                      className="text-xs text-slate-500 hover:text-[#0176fd] font-medium underline cursor-pointer"
                    >
                      Skip & use all 62 tools as guest (100% Free)
                    </button>
                  </div>
                </>
              )}

              {/* Privacy Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero server logs • Pure browser-memory session</span>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
