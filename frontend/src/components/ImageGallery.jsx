import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ImageGallery.css';

function ImageGallery({ images = [] }) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Default images if none provided
  const galleryImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631049307038-da0ec629540d?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=600&fit=crop'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="image-gallery">
      {/* Main Image */}
      <div className="main-image-container">
        <img 
          key={currentImageIndex}
          src={galleryImages[currentImageIndex]}
          alt={`Alt-Berliner Eckkneipe apartment – ${t('gallery.imageAlt', { number: currentImageIndex + 1 })}`}
          className="main-image"
          loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
          fetchPriority={currentImageIndex === 0 ? 'high' : undefined}
        />
        
        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button className="gallery-nav prev" onClick={prevImage} aria-label={t('gallery.prevImage')} title={t('gallery.prevImage')}>
              ‹
            </button>
            <button className="gallery-nav next" onClick={nextImage} aria-label={t('gallery.nextImage')} title={t('gallery.nextImage')}>
              ›
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="image-counter">
          {currentImageIndex + 1} / {galleryImages.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && (
        <div className="thumbnails">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => goToImage(index)}
              title={t('gallery.goToImage', { number: index + 1 })}
            >
              <img src={image} alt={t('gallery.thumbnail', { number: index + 1 })} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
