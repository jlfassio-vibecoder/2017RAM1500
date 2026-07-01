import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Menu, X } from 'lucide-react';
import ChatWidget from './ChatWidget';
import Gallery from './Gallery';
import ContactForm from './ContactForm';
import ImageCarousel from './ImageCarousel';
import truckPhoto from '../assets/images/red_truck_snow_1782740280647.jpg';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [truckDetails, setTruckDetails] = useState<any>({ mileage: '78,000', price: '23,900', windowStickerUrl: '', carfaxReportUrl: '', kbbReportUrl: '', smogReportUrl: '' });

  // Compute market data dynamically using updated price and mileage
  const numericPrice = parseInt(truckDetails.price.replace(/,/g, ''), 10) || 23900;
  const shortMileage = truckDetails.mileage ? `${Math.round(parseInt(truckDetails.mileage.replace(/,/g, ''), 10) / 1000)}k` : '102k';
  
  const marketData = [
    { name: 'Dealer (118k)', value: 24495, color: 'rgba(203, 213, 225, 0.5)' },
    { name: `This Truck (${shortMileage})`, value: numericPrice, color: 'rgba(220, 38, 38, 0.9)' },
    { name: 'Dealer (98k)', value: 24593, color: 'rgba(203, 213, 225, 0.5)' },
    { name: 'Dealer (94k)', value: 25999, color: 'rgba(203, 213, 225, 0.5)' },
    { name: 'Dealer (89k)', value: 29244, color: 'rgba(203, 213, 225, 0.5)' }
  ];

  useEffect(() => {
    fetch('/api/truck-details')
      .then(res => res.json())
      .then(data => setTruckDetails(data))
      .catch(err => console.error(err));
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'pitch', 'gallery', 'maintenance', 'market', 'features', 'build-sheet', 'kbb', 'carfax', 'smog', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPosition && (el.offsetTop + el.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans bg-[#f8f9fa] text-slate-900 min-h-screen">
      <nav className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 bg-slate-900 text-white flex-shrink-0 shadow-sm">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">RAM 1500 <span className="font-light text-slate-400">NIGHT EDITION</span></span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-red-600 font-semibold">VIN Verified: 1C6RR7MT3HS761025</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {['pitch', 'gallery', 'market', 'build-sheet', 'carfax'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`capitalize pb-1 border-b-2 transition-colors ${
                    activeSection === section
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {section === 'pitch' ? "Seller's Note" : section === 'market' ? 'Market Value' : section === 'build-sheet' ? 'Build Sheet' : section === 'carfax' ? 'Carfax' : section}
                </button>
              ))}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors ml-4"
              >
                More <Menu size={16} />
              </button>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div 
        className={`fixed top-0 right-0 z-50 w-64 h-full bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col space-y-6 text-sm font-medium">
            {['overview', 'pitch', 'gallery', 'maintenance', 'market', 'features', 'build-sheet', 'kbb', 'carfax', 'smog', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-left capitalize pb-2 border-b transition-colors ${
                  activeSection === section
                    ? 'border-red-600 text-red-600'
                    : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {section === 'pitch' ? "Seller's Note" : section === 'features' ? 'Utility' : section === 'market' ? 'Market Value' : section === 'build-sheet' ? 'Build Sheet' : section === 'kbb' ? 'KBB Report' : section === 'carfax' ? 'Carfax' : section === 'smog' ? 'Smog Report' : section === 'contact' ? 'Contact' : section}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Hero Section */}
        <section id="overview" className="mb-16 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Premium Utility meets <br /><span className="text-red-600">Night Edition</span> Rarity
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                A meticulously maintained 2017 Ram 1500 Crew Cab, featuring the iconic blacked-out Night Edition styling and over $4,000 in recent preventative mechanical upgrades.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">VIN VERIFIED</span>
                  <span className="font-semibold text-sm">1C6RR7MT3HS761025</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">DRIVETRAIN</span>
                  <span className="font-semibold text-sm uppercase">4WD Fully Loaded</span>
                </div>
              </div>
            </div>
            <div className="relative h-80 w-full bg-slate-200 rounded-2xl overflow-hidden group shadow-sm border border-slate-200">
              <img src={truckPhoto} alt="2017 Ram 1500 Crew Cab Night Edition" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-6 z-10">
                <div className="w-full flex justify-between items-end text-white">
                  <div>
                    <h2 className="text-2xl font-bold drop-shadow-md">2017 Crew Cab 4WD</h2>
                    <p className="text-slate-100 text-sm mt-1 drop-shadow-md">Monochromatic Black Trim & Wheels</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur rounded text-xs font-semibold uppercase tracking-wider border border-white/10">Night Ed.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ImageCarousel />

        {/* Walkaround Video Section */}
        <section className="mb-16 pt-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Detailed Walkaround</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Take a closer look at the exterior, interior, and engine bay in this comprehensive 3-minute walkaround video.
            </p>
            <div className="w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
              <video 
                controls 
                preload="none" 
                poster={truckDetails.videoPosterUrl || "https://picsum.photos/seed/ramVideoPoster/1280/720"}
                className="w-full h-full object-cover"
              >
                <source src={truckDetails.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* Sales Pitch Section */}
        <section id="pitch" className="mb-16 pt-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header Area */}
            <div className="bg-slate-900 text-white p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Seller's Note</h2>
              <p className="font-semibold text-lg md:text-xl text-slate-300 leading-snug max-w-3xl whitespace-pre-wrap">
                {truckDetails.subtitle || "2017 Ram 1500 Crew Cab Night Edition 4x4 – Fully Loaded, Zero Codes, Bulletproofed Suspension"}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Asking Price</p>
                  <p className="text-2xl font-bold text-white">${truckDetails.price}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Mileage</p>
                  <p className="text-2xl font-bold text-white">{truckDetails.mileage}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Original MSRP</p>
                  <p className="text-2xl font-bold text-slate-300">{truckDetails.msrp || "$59,895"}</p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-10">
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm md:text-base">
                <div className="mb-10 text-lg text-slate-800 space-y-4 whitespace-pre-wrap">
                  {truckDetails.sellersNoteIntro ? (
                    <p>{truckDetails.sellersNoteIntro}</p>
                  ) : (
                    <>
                      <p>If you are looking for a fully-loaded, turn-key truck that has already had all the expensive, common Ram maintenance issues taken care of, this is it.</p>
                      <p>This is a rare Flame Red Night Edition with almost $16,000 in factory upgrades. It has been meticulously cared for, mechanically vetted, and is ready for its next owner.</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* The Peace of Mind Guarantee */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-100">
                        <span className="text-xl">🛡️</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 m-0">The Peace of Mind Guarantee</h3>
                    </div>
                    {truckDetails.peaceOfMindText ? (
                       <div className="whitespace-pre-wrap">{truckDetails.peaceOfMindText}</div>
                    ) : (
                      <>
                        <p className="mb-3">Let's talk about the elephant in the room with 4th Gen Rams: the factory air suspension. It's notorious for failing and costing thousands to fix. I have already paid to have the factory air ride professionally deleted and converted to a premium conventional coil/shock suspension. You get the perfect ride height with zero anxiety about winter suspension failures.</p>
                        <p>Additionally, this truck was just evaluated by a major commercial truck buying center. It was thoroughly test-driven and throws ZERO diagnostic codes.</p>
                      </>
                    )}
                  </div>

                  {/* Recent Maintenance */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-slate-100 text-slate-700 p-2 rounded-lg border border-slate-200">
                        <span className="text-xl">🔧</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 m-0">Recent Maintenance & Upgrades</h3>
                    </div>
                    {truckDetails.maintenanceText ? (
                      <div className="whitespace-pre-wrap">{truckDetails.maintenanceText}</div>
                    ) : (
                      <>
                        <p className="mb-3">I don't believe in passing off worn-out parts to the next guy. In preparation for this sale, I have invested heavily in making sure this truck is perfect:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 marker:text-slate-400">
                          <li><strong>Brand New Tires</strong></li>
                          <li><strong>Brand New Hubs and Bearings</strong></li>
                          <li><strong>Bulletproofed Suspension</strong> (Air-ride delete mentioned above)</li>
                          <li><strong>Fresh Cosmetic Restoration:</strong> Just got out of the body shop to have minor scratches and door dings professionally removed. The exterior looks phenomenal. (Note: Driver's seat has minimal wear along the outside seam, typical for the year, but the interior is otherwise immaculate).</li>
                        </ul>
                      </>
                    )}
                  </div>

                  {/* Utility & Towing */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-slate-100 text-slate-700 p-2 rounded-lg border border-slate-200">
                        <span className="text-xl">🧰</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 m-0">The Ultimate Utility & Towing Rig</h3>
                    </div>
                    {truckDetails.utilityTowingText ? (
                      <div className="whitespace-pre-wrap">{truckDetails.utilityTowingText}</div>
                    ) : (
                      <>
                        <p className="mb-3">This truck isn't just a pavement princess; it is optioned for serious work.</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 marker:text-slate-400">
                          <li><strong>RamBox® Cargo Management System:</strong> Lockable, weatherproof, and drainable bedside boxes.</li>
                          <li><strong>Hidden In-Floor Storage:</strong> The rear footwells feature insulated, hidden storage bins.</li>
                          <li><strong>Heavy Duty Towing:</strong> 5.7L HEMI V8 paired with the highly desirable 3.92 Rear Axle Ratio and Anti-Spin Differential. Includes factory Trailer Brake Control and Class IV Hitch.</li>
                          <li><strong>Bed Setup:</strong> Factory Spray-in Bedliner, Tri-Fold Tonneau Cover, and Bed Cargo Divider/Extender.</li>
                        </ul>
                      </>
                    )}
                  </div>

                  {/* Luxury Options */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-slate-100 text-slate-700 p-2 rounded-lg border border-slate-200">
                        <span className="text-xl">💎</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 m-0">Luxury Options (Original $60k MSRP)</h3>
                    </div>
                    {truckDetails.luxuryOptionsText ? (
                      <div className="whitespace-pre-wrap">{truckDetails.luxuryOptionsText}</div>
                    ) : (
                      <>
                        <p className="mb-3">You will be hard-pressed to find a truck with more interior features than this one:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 marker:text-slate-400">
                          <li><strong>Interior Comfort:</strong> Black Leather-Trimmed Bucket Seats that are both Heated and Ventilated (Cooled). Heated Leather steering wheel. Power Sunroof.</li>
                          <li><strong>Tech & Audio:</strong> Uconnect 8.4 NAV with Apple/Android capability, backed by the 9-Speaker Alpine Premium Audio System with Subwoofer.</li>
                          <li><strong>Exterior Styling:</strong> Sport Performance Hood, Flat Black Badging, Black Painted Honeycomb Grille, 20-inch Black Aluminum Wheels, and Dual Rear Exhaust.</li>
                          <li><strong>Convenience:</strong> Keyless Enter 'n Go, Remote Start, Rain-Sensitive Wipers, Auto High-Beams, and ParkSense Front/Rear Park Assist with Backup Camera.</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 text-center">
                  {truckDetails.ctaText ? (
                    <div className="whitespace-pre-wrap mb-6 text-slate-700">{truckDetails.ctaText}</div>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-slate-900 mb-4">
                        This truck represents a massive value. Dealers are selling standard, stripped-down trades for this price. KBB Private Party values this exact spec and condition at over $23,500.
                      </p>
                      <p className="text-base text-slate-700 mb-6">
                        Clean title in hand. Serious inquiries only. Come take it for a test drive and see for yourself—you won't find a better-equipped, better-sorted 2017 Ram on the market right now.
                      </p>
                    </>
                  )}
                  <button 
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Contact Seller to Schedule a Showing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Gallery />

        {/* Mechanical Integrity Section */}
        <section id="maintenance" className="mb-16 pt-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Mechanical Integrity & Upgrades</h2>
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                {truckDetails.mechanicalIntegrityIntro || 'Most used Rams in this mileage bracket face expensive repairs. We have proactively addressed the two most common "pain points" for this generation, ensuring this truck is turn-key for the next 100,000 miles.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300">
                <div className="h-1 bg-red-600 w-8 mb-4"></div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{truckDetails.mechanicalItem1Title || 'Air Suspension Delete'}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.mechanicalItem1Text || 'Converted to heavy-duty regular shocks. Eliminates the risk of the $3,000 factory air-ride failure common in cold climates.'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300">
                <div className="h-1 bg-red-600 w-8 mb-4"></div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{truckDetails.mechanicalItem2Title || 'Drivetrain Refresh'}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.mechanicalItem2Text || 'Brand new hubs and bearings installed. Smooth, quiet, and vibration-free operation at highway speeds.'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300">
                <div className="h-1 bg-red-600 w-8 mb-4"></div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{truckDetails.mechanicalItem3Title || 'New All-Terrain Rubber'}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.mechanicalItem3Text || 'Fresh tires provide maximum traction and improved ride quality. Zero immediate maintenance needed.'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Market Comparison */}
        <section id="market" className="mb-16 pt-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Market Valuation Context</h2>
            <p className="text-sm text-slate-500 max-w-2xl whitespace-pre-wrap">
              {truckDetails.marketValuationIntro || `While algorithmic offers from dealers focus on wholesale turnover, a true market analysis illustrates the replacement cost for a vehicle of this specific configuration and condition. As a buyer, you must understand the difference between purchasing a fully sorted vehicle from a private party versus walking onto a retail dealership lot. Finding an equivalent 2017 Ram 1500 Night Edition in Good to Excellent condition with roughly ${truckDetails.mileage} miles is currently incredibly difficult, driving up its intrinsic value.`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Pricing Comparison (Dealership Asking Prices)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis 
                      domain={[15000, 30000]}
                      tickFormatter={(value) => `$${value / 1000}k`} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Valuation']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {marketData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color === 'rgba(220, 38, 38, 0.9)' ? '#dc2626' : entry.color === 'rgba(220, 38, 38, 0.4)' ? '#fca5a5' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Dealer Retail Reality</span>
                {truckDetails.marketDealerReality ? (
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.marketDealerReality}</div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900 mb-1">$25,500 - $26,500+</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Dealerships price these trucks at a premium, then frequently add mandatory documentation fees, prep fees, and taxes that drive the "out-the-door" cost even higher.</p>
                  </>
                )}
              </div>
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">KBB Private Party Value</span>
                {truckDetails.marketKbbValue ? (
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.marketKbbValue}</div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900 mb-1">$23,652 Target Value</p>
                    <p className="text-xs text-slate-500 leading-relaxed">The specific target value based on mileage and standard options. The recognized fair market range is $22,552 - $24,752 for a private transaction in Good condition.</p>
                  </>
                )}
              </div>
              <div className="flex flex-col p-5 bg-slate-900 text-white rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">This Night Edition</span>
                  <span className="text-xl font-bold text-red-600">${truckDetails.price}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {truckDetails.marketThisTruck || "A fair, data-backed price that reflects the truck's pristine mechanical state and thousands in recent maintenance."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Utility & Features */}
        <section id="features" className="mb-16 pt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Vehicle Highlights & Utility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-red-600 font-bold italic text-lg">✔</span>
                <h3 className="text-sm font-bold text-slate-900">{truckDetails.highlight1Title || 'RAM Boxes'}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.highlight1Text || 'Integrated, lockable, and lighted storage bins built into the bed rails.'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-red-600 font-bold italic text-lg">✔</span>
                <h3 className="text-sm font-bold text-slate-900">{truckDetails.highlight2Title || 'Hidden Storage'}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.highlight2Text || 'Discrete storage boxes located in the rear footwells. Ideal for keeping valuables out of sight.'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-red-600 font-bold italic text-lg">✔</span>
                <h3 className="text-sm font-bold text-slate-900">{truckDetails.highlight3Title || 'Max Tow Package'}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.highlight3Text || 'Factory-installed hitch and trailer wiring. Ready to haul trailers, boats, or campers.'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-red-600 font-bold italic text-lg">✔</span>
                <h3 className="text-sm font-bold text-slate-900">{truckDetails.highlight4Title || 'Premium Interior'}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{truckDetails.highlight4Text || 'Fully loaded interior with only minimal wear on driver seat seam. Clean, non-smoker.'}</p>
            </div>
          </div>
        </section>

        {/* Build Sheet Section */}
        <section id="build-sheet" className="mb-16 pt-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Original Window Sticker</h2>
                <p className="text-sm text-slate-500">Factory installed options and original MSRP.</p>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Total Price</span>
                <span className="text-3xl font-bold text-slate-900">$59,895</span>
              </div>
            </div>

            {/* Window Sticker Placeholder */}
            {truckDetails.windowStickerUrl ? (
              <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                {truckDetails.windowStickerUrl.startsWith('data:application/pdf') ? (
                  <iframe 
                    src={truckDetails.windowStickerUrl} 
                    title="Original Window Sticker"
                    className="w-full h-[600px] bg-white border-0"
                  />
                ) : (
                  <img 
                    src={truckDetails.windowStickerUrl} 
                    alt="Original Window Sticker" 
                    className="w-full h-auto object-contain bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="mb-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FileText size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Window Sticker Document</h3>
                <p className="text-slate-500 text-sm mb-4">The original factory window sticker will be displayed here once uploaded.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-900">Base Price</span>
                <span className="text-slate-600">$44,095</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Leather-Trimmed Bucket Seats</span>
                <span className="text-slate-600">$1,545</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Night Edition Package 26Q</span>
                <span className="text-slate-600">$395</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Convenience Group</span>
                <span className="text-slate-600">$545</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">9-Speaker Alpine® Audio w/ Sub</span>
                <span className="text-slate-600">$345</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Tri-Fold Tonneau Cover</span>
                <span className="text-slate-600">$595</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">8-Speed Auto 8HP70 Transmission</span>
                <span className="text-slate-600">$500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Anti-Spin Differential Rear Axle</span>
                <span className="text-slate-600">$435</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">5.7-Liter V8 HEMI® MDS VVT Engine</span>
                <span className="text-slate-600">$1,450</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Power Sunroof</span>
                <span className="text-slate-600">$1,095</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Sport Performance Hood</span>
                <span className="text-slate-600">$775</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Black Tubular Side Steps</span>
                <span className="text-slate-600">$425</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">32-Gallon Fuel Tank</span>
                <span className="text-slate-600">$405</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Uconnect® 8.4 NAV</span>
                <span className="text-slate-600">$795</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">4-Corner Air Suspension</span>
                <span className="text-slate-600">$1,715</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">ParkSense® Front / Rear Park Assist</span>
                <span className="text-slate-600">$445</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Ram Box® Cargo Management System</span>
                <span className="text-slate-600">$1,295</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Spray-In Bedliner</span>
                <span className="text-slate-600">$495</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Class IV Receiver Hitch</span>
                <span className="text-slate-600">$345</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Trailer Brake Control</span>
                <span className="text-slate-600">$295</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Rear Window Defroster</span>
                <span className="text-slate-600">$195</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">Front & Rear Rubber Floor Mats</span>
                <span className="text-slate-600">$125</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-700">3.92 Rear Axle / Engine Block Heater</span>
                <span className="text-slate-600">$190</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-900">Destination Charge</span>
                <span className="text-slate-600">$1,395</span>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />

        {/* Condition Report */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">Aesthetic Restoration</h2>
              <p className="text-xs text-slate-500">Currently undergoing full professional paint correction and dent repair to ensure Good-to-Excellent exterior status.</p>
            </div>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 bg-slate-50 rounded text-xs font-semibold border border-slate-200 text-slate-700">✓ No Accidents</div>
              <div className="px-3 py-1.5 bg-slate-50 rounded text-xs font-semibold border border-slate-200 text-slate-700">✓ Clean Title</div>
            </div>
          </div>
        </section>

        {/* KBB Report Document Viewer */}
        <section id="kbb" className="bg-white border border-slate-200 rounded-xl p-8 mb-16 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Kelley Blue Book Report</h2>
              <p className="text-slate-500 text-sm">Official KBB valuation and condition report.</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl bg-white p-6 shadow-sm">
            {truckDetails.kbbReportUrl ? (
              <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
                {truckDetails.kbbReportUrl.startsWith('data:application/pdf') ? (
                  <iframe 
                    src={truckDetails.kbbReportUrl} 
                    title="KBB Report"
                    className="w-full h-[600px] bg-white border-0"
                  />
                ) : (
                  <img 
                    src={truckDetails.kbbReportUrl} 
                    alt="KBB Report" 
                    className="w-full h-auto object-contain bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FileText size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Kelley Blue Book Report</h3>
                <p className="text-slate-500 text-sm mb-4">The KBB Report will be displayed here once uploaded.</p>
              </div>
            )}
          </div>
        </section>

        {/* Carfax Report Document Viewer */}
        <section id="carfax" className="bg-white border border-slate-200 rounded-xl p-8 mb-16 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Carfax Report</h2>
              <p className="text-slate-500 text-sm">Detailed vehicle history and condition report.</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl bg-white p-6 shadow-sm">
            {truckDetails.carfaxReportUrl ? (
              <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
                {truckDetails.carfaxReportUrl.startsWith('data:application/pdf') ? (
                  <iframe 
                    src={truckDetails.carfaxReportUrl} 
                    title="Carfax Report"
                    className="w-full h-[600px] bg-white border-0"
                  />
                ) : (
                  <img 
                    src={truckDetails.carfaxReportUrl} 
                    alt="Carfax Report" 
                    className="w-full h-auto object-contain bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FileText size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Carfax Report</h3>
                <p className="text-slate-500 text-sm mb-4">The Carfax Report will be displayed here once uploaded.</p>
              </div>
            )}
          </div>
        </section>

        {/* Smog Report Document Viewer */}
        <section id="smog" className="bg-white border border-slate-200 rounded-xl p-8 mb-16 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Smog Report</h2>
              <p className="text-slate-500 text-sm">Official emissions and smog check certification.</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl bg-white p-6 shadow-sm">
            {truckDetails.smogReportUrl ? (
              <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
                {truckDetails.smogReportUrl.startsWith('data:application/pdf') ? (
                  <iframe 
                    src={truckDetails.smogReportUrl} 
                    title="Smog Report"
                    className="w-full h-[600px] bg-white border-0"
                  />
                ) : (
                  <img 
                    src={truckDetails.smogReportUrl} 
                    alt="Smog Report" 
                    className="w-full h-auto object-contain bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FileText size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Smog Report</h3>
                <p className="text-slate-500 text-sm mb-4">The Smog Report will be displayed here once uploaded.</p>
              </div>
            )}
          </div>
        </section>

        <ChatWidget />
      </main>

      <footer className="bg-slate-900 py-8 text-center border-t border-slate-800">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">2017 Ram 1500 Crew Cab Night Edition • Buyer's Guide</p>
      </footer>
    </div>
  );
}
