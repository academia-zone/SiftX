import { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ToolStudioPage } from './pages/ToolStudioPage';
import { ToolLandingPage } from './pages/ToolLandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ContactPage } from './pages/ContactPage';
import { Footer } from './components/Footer';
import { WorkspaceTray } from './components/WorkspaceTray';

import { ThemeProvider } from './context/ThemeContext';
import { WorkspaceTrayProvider } from './context/WorkspaceTrayContext';
import { resolveToolById, type ResolvedToolInfo } from './utils/toolResolver';

// Studio Apps
import { AudioStudioApp } from './modules/audio/AudioStudioApp';
import { CalculatorsStudioApp } from './modules/calculators/CalculatorsStudioApp';
import { PdfStudioApp } from './modules/pdf/PdfStudioApp';
import { ImageStudioApp } from './modules/image/ImageStudioApp';
import { VideoStudioApp } from './modules/video/VideoStudioApp';
import { DeveloperStudioApp } from './modules/developer/DeveloperStudioApp';
import { LogoRemoverStudioApp } from './modules/logo-remover/LogoRemoverStudioApp';
import { CvCreatorStudioApp } from './modules/cv-creator/CvCreatorStudioApp';
import { ImageSeparatorStudioApp } from './modules/image-separator/ImageSeparatorStudioApp';

export function AppContent() {
  const [activeLandingTool, setActiveLandingTool] = useState<ResolvedToolInfo | null>(null);
  const [currentStudioTool, setCurrentStudioTool] = useState<string | null>(null);

  const getInitialState = (): { page: string; landingTool: ResolvedToolInfo | null; studioTool: string | null } => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;

      if (path.startsWith('/tool/') || path.startsWith('/tools/')) {
        const slug = path.replace(/^\/tools?\//, '').replace(/\/$/, '');
        const resolved = resolveToolById(slug);
        if (resolved) {
          return { page: 'tool-landing', landingTool: resolved, studioTool: resolved.tool.id };
        }
      }

      if (path.startsWith('/tool-studio')) return { page: 'tool-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/about')) return { page: 'about', landingTool: null, studioTool: null };
      if (path.startsWith('/features')) return { page: 'features', landingTool: null, studioTool: null };
      if (path.startsWith('/contact')) return { page: 'contact', landingTool: null, studioTool: null };
      if (path.startsWith('/audio')) return { page: 'audio-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/calculators')) return { page: 'calculators-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/pdf')) return { page: 'pdf-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/image')) return { page: 'image-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/video')) return { page: 'video-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/developer')) return { page: 'developer-studio', landingTool: null, studioTool: null };
      if (path.startsWith('/logo-remover')) return { page: 'logo-remover-studio', landingTool: null, studioTool: 'logo-remover' };
      if (path.startsWith('/cv-creator')) return { page: 'cv-creator-studio', landingTool: null, studioTool: 'cv-creator' };
      if (path.startsWith('/image-separator')) return { page: 'image-separator-studio', landingTool: null, studioTool: 'image-separator' };
    }
    return { page: 'home', landingTool: null, studioTool: null };
  };

  const initial = getInitialState();
  const [currentPage, setCurrentPage] = useState<string>(initial.page);

  useEffect(() => {
    if (initial.landingTool) {
      setActiveLandingTool(initial.landingTool);
      setCurrentStudioTool(initial.studioTool);
    }
  }, []);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handle browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialState();
      setCurrentPage(state.page);
      setActiveLandingTool(state.landingTool);
      setCurrentStudioTool(state.studioTool);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Launch a tool directly into its studio
  const launchToolInStudio = (toolId: string) => {
    const resolved = resolveToolById(toolId);
    if (!resolved) return;

    setCurrentStudioTool(resolved.tool.id);
    const studioPageMap: Record<ResolvedToolInfo['studio'], string> = {
      audio: 'audio-studio',
      calculators: 'calculators-studio',
      pdf: 'pdf-studio',
      image: 'image-studio',
      video: 'video-studio',
      developer: 'developer-studio',
      'logo-remover': 'logo-remover-studio',
      'cv-creator': 'cv-creator-studio',
      'image-separator': 'image-separator-studio',
    };

    const targetPage = studioPageMap[resolved.studio];
    window.history.pushState(null, '', resolved.studioRoute);
    setCurrentPage(targetPage);
  };

  // Navigate to a tool's dedicated SEO Landing page
  const navigateToToolLanding = (toolId: string) => {
    const resolved = resolveToolById(toolId);
    if (!resolved) return;
    setActiveLandingTool(resolved);
    setCurrentStudioTool(resolved.tool.id);
    window.history.pushState(null, '', `/tool/${resolved.tool.id}`);
    setCurrentPage('tool-landing');
  };

  // FULLSCREEN INDEPENDENT AUDIO STUDIO
  if (currentPage === 'audio-studio') {
    return (
      <AudioStudioApp 
        onExitToMain={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }} 
      />
    );
  }

  // FULLSCREEN INDEPENDENT CALCULATORS STUDIO
  if (currentPage === 'calculators-studio') {
    return (
      <CalculatorsStudioApp
        initialToolId={(currentStudioTool as any) || 'dashboard'}
        onExitToMain={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT PDF & DOCUMENT STUDIO
  if (currentPage === 'pdf-studio') {
    return (
      <PdfStudioApp
        initialToolId={(currentStudioTool as any) || 'dashboard'}
        onExitToMain={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT IMAGE STUDIO
  if (currentPage === 'image-studio') {
    return (
      <ImageStudioApp
        initialToolId={(currentStudioTool as any) || null}
        onBackToTools={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT VIDEO STUDIO
  if (currentPage === 'video-studio') {
    return (
      <VideoStudioApp
        initialToolId={(currentStudioTool as any) || null}
        onBackToTools={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT DEVELOPER STUDIO
  if (currentPage === 'developer-studio') {
    return (
      <DeveloperStudioApp
        initialToolId={(currentStudioTool as any) || 'website-auditor'}
        onBackToTools={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT LOGO & WATERMARK REMOVER STUDIO
  if (currentPage === 'logo-remover-studio') {
    return (
      <LogoRemoverStudioApp
        onExitToMain={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT CV CREATOR STUDIO
  if (currentPage === 'cv-creator-studio') {
    return (
      <CvCreatorStudioApp
        onExitToMain={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  // FULLSCREEN INDEPENDENT IMAGE LAYER & ICON SEPARATOR STUDIO
  if (currentPage === 'image-separator-studio') {
    return (
      <ImageSeparatorStudioApp
        onExitToMain={() => {
          window.history.pushState(null, '', '/');
          setCurrentStudioTool(null);
          setCurrentPage('tool-studio');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-[#020f22] dark:text-slate-100 flex flex-col font-sans selection:bg-[#01bbfd] selection:text-black transition-colors">
      
      {/* Top Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 left-0 right-0 h-1 bg-[#01bbfd] z-50 pointer-events-none"
      />

      {/* Modern Zoom-style Header with Theme & PWA controls */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={(page) => {
          if (page === 'home' || page === 'tool-studio' || page === 'about' || page === 'features' || page === 'contact') {
            window.history.pushState(null, '', page === 'home' ? '/' : `/${page}`);
          }
          setCurrentPage(page);
        }}
      />

      {/* Dynamic Pages */}
      <main className="flex-1">
        {/* Dedicated SEO Tool Landing Page */}
        {currentPage === 'tool-landing' && activeLandingTool && (
          <ToolLandingPage
            toolInfo={activeLandingTool}
            onLaunchTool={() => launchToolInStudio(activeLandingTool.tool.id)}
            onNavigateHome={() => {
              window.history.pushState(null, '', '/');
              setCurrentPage('home');
            }}
            onNavigateToCategory={() => {
              window.history.pushState(null, '', activeLandingTool.studioRoute);
              launchToolInStudio(activeLandingTool.tool.id);
            }}
            onSelectOtherTool={(otherId) => navigateToToolLanding(otherId)}
          />
        )}

        {currentPage === 'home' && (
          <HomePage
            onNavigateToStudio={() => {
              window.history.pushState(null, '', '/tool-studio');
              setCurrentPage('tool-studio');
            }}
            onNavigateToAbout={() => {
              window.history.pushState(null, '', '/about');
              setCurrentPage('about');
            }}
            onLaunchTool={(toolId) => launchToolInStudio(toolId)}
          />
        )}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'tool-studio' && (
          <ToolStudioPage 
            onOpenTool={(toolId) => launchToolInStudio(toolId)}
            onLaunchAudio={() => {
              window.history.pushState(null, '', '/audio');
              setCurrentStudioTool(null);
              setCurrentPage('audio-studio');
            }}
            onLaunchCalculators={() => {
              window.history.pushState(null, '', '/calculators');
              setCurrentStudioTool(null);
              setCurrentPage('calculators-studio');
            }}
            onLaunchPdf={() => {
              window.history.pushState(null, '', '/pdf');
              setCurrentStudioTool(null);
              setCurrentPage('pdf-studio');
            }}
            onLaunchImage={() => {
              window.history.pushState(null, '', '/image');
              setCurrentStudioTool(null);
              setCurrentPage('image-studio');
            }}
            onLaunchVideo={() => {
              window.history.pushState(null, '', '/video');
              setCurrentStudioTool(null);
              setCurrentPage('video-studio');
            }}
            onLaunchDeveloper={() => {
              window.history.pushState(null, '', '/developer');
              setCurrentStudioTool(null);
              setCurrentPage('developer-studio');
            }}
          />
        )}

        {currentPage === 'features' && <FeaturesPage />}

        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Zoom-style Enterprise Footer */}
      <Footer onNavigate={(page) => {
        if (page === 'home' || page === 'tool-studio' || page === 'about' || page === 'features' || page === 'contact') {
          window.history.pushState(null, '', page === 'home' ? '/' : `/${page}`);
        }
        setCurrentPage(page);
      }} />

      {/* Floating Cross-Tool Workspace Tray */}
      <WorkspaceTray onNavigateToTool={(toolId) => launchToolInStudio(toolId)} />

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <WorkspaceTrayProvider>
        <AppContent />
      </WorkspaceTrayProvider>
    </ThemeProvider>
  );
}

export default App;
