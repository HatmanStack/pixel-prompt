/**
 * App Component
 * Root application component with error boundaries
 */

import Header from './components/common/Header';
import Container from './components/common/Container';
import Footer from './components/common/Footer';
import GenerationPanel from './components/generation/GenerationPanel';
import ErrorBoundary from './components/features/errors/ErrorBoundary';
import ErrorFallback from './components/features/errors/ErrorFallback';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      {/* Keep Header and Footer outside error boundary - always visible */}
      <Header />
      <main className={styles.main}>
        <Container>
          {/* Wrap GenerationPanel in error boundary to catch rendering errors */}
          <ErrorBoundary
            fallback={ErrorFallback}
            componentName="GenerationPanel"
          >
            <GenerationPanel />
          </ErrorBoundary>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default App;
