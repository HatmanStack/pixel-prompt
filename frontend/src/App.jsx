/**
 * App Component
 * Root application component
 */

import Header from './components/common/Header';
import Container from './components/common/Container';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Container>
          <div className={styles.placeholder}>
            <h2>Pixel Prompt Complete</h2>
            <p>Image generation UI coming soon...</p>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default App;
