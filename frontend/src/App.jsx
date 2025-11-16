/**
 * App Component
 * Root application component with error boundaries and lazy-loaded routes
 */

import { lazy, Suspense } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/common/Header';
import Container from './components/common/Container';
import Footer from './components/common/Footer';
import GenerationPanel from './components/generation/GenerationPanel';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/features/errors/ErrorBoundary';
import ErrorFallback from './components/features/errors/ErrorFallback';
import styles from './App.module.css';

// Lazy load GalleryBrowser for code splitting
const GalleryBrowser = lazy(() => import('./components/gallery/GalleryBrowser'));

function App() {
  const { currentView } = useApp();

  return (
    <div className={styles.app}>
      {/* Keep Header and Footer outside error boundary - always visible */}
      <Header />
      <main className={styles.main}>
        <Container>
          {/* Conditionally render view based on currentView state */}
          {currentView === 'generation' && (
            <ErrorBoundary
              fallback={ErrorFallback}
              componentName="GenerationPanel"
            >
              <GenerationPanel />
            </ErrorBoundary>
          )}

          {currentView === 'gallery' && (
            <ErrorBoundary
              fallback={ErrorFallback}
              componentName="GalleryBrowser"
            >
              {/* Suspense boundary for lazy-loaded GalleryBrowser */}
              <Suspense fallback={<LoadingSpinner message="Loading gallery..." />}>
                <GalleryBrowser />
              </Suspense>
            </ErrorBoundary>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default App;
