/**
 * ImageCard Component
 * Individual image card with loading states
 */

import { useState } from 'react';
import styles from './ImageCard.module.css';

function ImageCard({
  image,
  model,
  status = 'pending',
  error = null,
  onExpand
}) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (status === 'completed' && image && !imageError && onExpand) {
      onExpand();
    }
  };

  const renderContent = () => {
    if (status === 'pending' || status === 'loading') {
      return (
        <div className={styles.placeholder}>
          <div className={styles.placeholderAnimation}></div>
          <span className={styles.statusText}>
            {status === 'loading' ? 'Generating...' : 'Waiting...'}
          </span>
        </div>
      );
    }

    if (status === 'error' || imageError) {
      return (
        <div className={styles.error}>
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          <span className={styles.errorText}>
            {error || 'Failed to load'}
          </span>
        </div>
      );
    }

    if (status === 'completed' && image) {
      return (
        <img
          src={image}
          alt={`Generated image from ${model}`}
          className={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
      );
    }

    return null;
  };

  return (
    <div
      className={`${styles.card} ${status === 'completed' && image ? styles.clickable : ''}`}
      onClick={handleClick}
      role={status === 'completed' ? 'button' : undefined}
      tabIndex={status === 'completed' ? 0 : undefined}
      aria-label={status === 'completed' ? `View ${model} image` : undefined}
    >
      <div className={styles.imageContainer}>
        {renderContent()}
      </div>

      <div className={styles.footer}>
        <span className={styles.modelName} title={model}>
          {model}
        </span>
        {status === 'completed' && (
          <span className={styles.badge}>✓</span>
        )}
      </div>
    </div>
  );
}

export default ImageCard;
