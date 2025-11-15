/**
 * App Component
 * Root application component
 */

import Header from './components/common/Header';
import Container from './components/common/Container';
import GenerationPanel from './components/generation/GenerationPanel';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Container>
          <GenerationPanel />
        </Container>
      </main>
    </div>
  );
}

export default App;
