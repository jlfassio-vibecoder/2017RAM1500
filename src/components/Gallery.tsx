import React, { useState } from 'react';
import exteriorImg from '../assets/images/gallery_exterior_1782746052182.jpg';
import interiorImg from '../assets/images/gallery_interior_1782746064770.jpg';
import utilityImg from '../assets/images/gallery_utility_1782746076050.jpg';
import upgradesImg from '../assets/images/gallery_upgrades_1782746088253.jpg';

const ALL_PHOTOS = [
  {
    id: 1,
    url: exteriorImg,
    category: 'Exterior',
    alt: 'The Flame Red paint contrasting with the blacked-out Night Edition grille, 20-inch black wheels, and Sport Performance Hood.',
    caption: 'Night Edition Exterior'
  },
  {
    id: 2,
    url: interiorImg,
    category: 'Interior',
    alt: 'The pristine black leather bucket seats (heated/ventilated), Uconnect 8.4 NAV screen, and sunroof.',
    caption: 'Luxury Interior'
  },
  {
    id: 3,
    url: utilityImg,
    category: 'Utility & Upgrades',
    alt: 'The RamBox Cargo Management system open and illuminated, the hidden rear footwell storage boxes, and the Tri-Fold Tonneau cover.',
    caption: 'RamBox & Utility'
  },
  {
    id: 4,
    url: upgradesImg,
    category: 'Utility & Upgrades',
    alt: 'A shot showing the new tires and the upgraded conventional coil/shock suspension (air-ride delete).',
    caption: 'Bulletproofed Suspension & New Tires'
  }
];

const CATEGORIES = ['All', 'Exterior', 'Interior', 'Utility & Upgrades'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPhotos = activeCategory === 'All' 
    ? ALL_PHOTOS 
    : ALL_PHOTOS.filter(photo => photo.category === activeCategory);

  return (
    <section id="gallery" className="mb-16 pt-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Photo Gallery</h2>
        
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-100 pb-4">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-slate-100 aspect-video border border-slate-200">
              <img 
                src={photo.url} 
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div>
                  <h3 className="text-white font-semibold text-lg">{photo.caption}</h3>
                  <p className="text-slate-200 text-sm mt-1">{photo.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
