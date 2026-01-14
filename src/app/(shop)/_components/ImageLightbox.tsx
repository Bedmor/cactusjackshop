"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  url: string;
  type: "video" | "image";
  isPrimary?: boolean;
}

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex: number;
}

export function ImageLightbox({
  isOpen,
  onClose,
  media,
  initialIndex,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]); // Reset when opening

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  // Safety check
  if (!currentMedia) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="image-lightbox active" id="imageLightbox" onClick={(e) => {
        if(e.target === e.currentTarget) onClose();
    }}>
      <button className="lightbox-close" onClick={onClose}>
        ×
      </button>
      
      {media.length > 1 && (
        <button className="lightbox-nav lightbox-prev" onClick={prevImage}>
          ‹
        </button>
      )}
      
      {media.length > 1 && (
        <button className="lightbox-nav lightbox-next" onClick={nextImage}>
          ›
        </button>
      )}

      <div className="lightbox-content">
        {currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            id="lightboxVideo"
            controls
            autoPlay
            className="lightbox-media"
            style={{ maxHeight: "80vh", maxWidth: "90vw" }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentMedia.url}
            alt="Enlarged view"
            id="lightboxImage"
            className="lightbox-media"
            style={{ maxHeight: "80vh", maxWidth: "90vw", objectFit: "contain" }}
          />
        )}
      </div>
      
      <div className="lightbox-counter">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}
