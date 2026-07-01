import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import truckPhoto from '../assets/images/red_truck_snow_1782740280647.jpg';

// Generate an array of 30 images. 
// We'll use the main truck photo for the first one, and picsum placeholders for the rest to simulate a gallery.
const images = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  thumb: i === 0 ? truckPhoto : `https://picsum.photos/seed/ram${i}/600/600`,
  full: i === 0 ? truckPhoto : `https://picsum.photos/seed/ram${i}/1600/900`,
  alt: `Ram 1500 image ${i + 1}`,
}));

export default function ImageCarousel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="w-full my-8">
      {/* Horizontal Scrollable Thumbnail Carousel */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 pb-4 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory hide-scrollbar">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className="flex-none w-32 h-32 md:w-48 md:h-48 cursor-pointer overflow-hidden rounded-xl shadow-sm hover:opacity-90 transition-opacity snap-center border border-slate-200 bg-slate-100"
              onClick={() => openModal(index)}
            >
              <img 
                src={img.thumb} 
                alt={img.alt} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
          {/* Close Button */}
          <button 
            onClick={closeModal}
            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          <button 
            onClick={prevImage}
            className="absolute left-4 md:left-8 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-4 md:right-8 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>

          {/* Image Container (16:9 AR) */}
          <div className="w-full max-w-6xl px-4 md:px-20" onClick={closeModal}>
            <div className="relative w-full aspect-video bg-black/20 rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <img 
                src={images[currentIndex].full} 
                alt={images[currentIndex].alt} 
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm font-medium drop-shadow-md">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
