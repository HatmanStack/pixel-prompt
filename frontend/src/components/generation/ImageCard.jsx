/**
 * ImageCard Component
 * Individual image card with loading states
 */

import { useState } from 'react';
import { downloadImage } from '../../utils/imageHelpers';
import styles from './ImageCard.module.css';

function ImageCard({
  image,
  model,
  status = 'pending',
  error = null,
  onExpand
}) {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (status === 'completed' && image && !imageError && onExpand) {
      onExpand();
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (image) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      downloadImage(image, `pixel-prompt-${model.replace(/\s+/g, '-')}-${timestamp}.png`);
    }
  };

  const handleCopyUrl = async (e) => {
    e.stopPropagation();
    if (image) {
      try {
        await navigator.clipboard.writeText(image);
        alert('Image URL copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy URL:', error);
        alert('Failed to copy URL');
      }
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
        <>
          <img
            src={image}
            alt={`Generated image from ${model}`}
            className={styles.image}
            onError={handleImageError}
            loading="lazy"
          />
          {showActions && (
            <div className={styles.actions}>
              <button
                className={styles.actionButton}
                onClick={handleDownload}
                aria-label="Download image"
                title="Download"
              >
                ⬇
              </button>
              <button
                className={styles.actionButton}
                onClick={handleCopyUrl}
                aria-label="Copy image URL"
                title="Copy URL"
              >
                🔗
              </button>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div
      className={`${styles.card} ${status === 'completed' && image ? styles.clickable : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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
