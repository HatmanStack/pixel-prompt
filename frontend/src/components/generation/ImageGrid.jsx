/**
 * ImageGrid Component
 * Grid layout for displaying 9 generated images
 * Optimized with useCallback to prevent breaking ImageCard memoization
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import ImageCard from './ImageCard';
import styles from './ImageGrid.module.css';

function ImageGrid({ images, modelNames = [] }) {
  const [expandedImage, setExpandedImage] = useState(null);

  // Memoize image slots to prevent recreation on every render
  const imageSlots = useMemo(() => {
    return Array(9).fill(null).map((_, index) => {
      const imageData = images[index];
      const modelName = modelNames[index] || `Model ${index + 1}`;

      return {
        image: imageData?.imageUrl || imageData?.image || null,
        model: imageData?.model || modelName,
        status: imageData?.status || 'pending',
        error: imageData?.error || null,
      };
    });
  }, [images, modelNames]);

  // Memoize handleExpand to prevent breaking ImageCard memoization
  const handleExpand = useCallback((index) => {
    setExpandedImage(imageSlots[index]);
  }, [imageSlots]);

  // Memoize handleCloseModal callback
  const handleCloseModal = useCallback(() => {
    setExpandedImage(null);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && expandedImage) {
        handleCloseModal();
      }
    };

    if (expandedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [expandedImage]);

  return (
    <>
      <div className={styles.grid}>
        {imageSlots.map((slot, index) => (
          <ImageCard
            key={index}
            image={slot.image}
            model={slot.model}
            status={slot.status}
            error={slot.error}
            onExpand={() => handleExpand(index)}
          />
        ))}
      </div>

      {/* Image Modal */}
      {expandedImage && expandedImage.image && (
        <div
          className={styles.modal}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image view"
        >
          <button
            className={styles.closeButton}
            onClick={handleCloseModal}
            aria-label="Close modal"
          >
            ✕
          </button>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expandedImage.image}
              alt={`Expanded view of ${expandedImage.model} image`}
              className={styles.modalImage}
            />
            <div className={styles.modalFooter}>
              <h3>{expandedImage.model}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGrid;
