/**
 * ImageGrid Component
 * Grid layout for displaying 9 generated images
 * Optimized with useCallback to prevent breaking ImageCard memoization
 * Includes ImageModal for full-screen viewing with keyboard navigation
 */

import { useState, useCallback, useMemo } from 'react';
import ImageCard from './ImageCard';
import ImageModal from '../features/generation/ImageModal';
import styles from './ImageGrid.module.css';

function ImageGrid({ images, modelNames = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Get only completed images for modal navigation
  const completedImages = useMemo(() => {
    return imageSlots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.status === 'completed' && slot.image);
  }, [imageSlots]);

  // Memoize handleExpand to prevent breaking ImageCard memoization
  const handleExpand = useCallback((index) => {
    // Find the index in completedImages array
    const completedIndex = completedImages.findIndex(img => img.originalIndex === index);
    if (completedIndex !== -1) {
      setCurrentImageIndex(completedIndex);
      setModalOpen(true);
    }
  }, [completedImages]);

  // Memoize handleCloseModal callback
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // Memoize handleNavigate callback for modal navigation
  const handleNavigate = useCallback((newIndex) => {
    setCurrentImageIndex(newIndex);
  }, []);

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

      {/* Image Modal with keyboard navigation */}
      <ImageModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        images={completedImages}
        currentIndex={currentImageIndex}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export default ImageGrid;
