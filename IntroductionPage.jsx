import React from 'react';
import { Link } from 'react-router-dom';

const IntroductionPage = () => {
  return (
    <div className="min-h-screen travel-landing-bg">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="travel-gradient-banner text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-[hsla(var(--primary-foreground)/0.8)]">
              Your Cozy Travel Companion
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-earth">
              Plan Your Dream Vacation with AI
            </h1>
            <p className="text-lg md:text-xl travel-body-text max-w-3xl mx-auto">
              Let gentle guidance and intelligent insights craft the journey you’ve been dreaming about.
              Discover hidden gems, manage your budget with ease, and stay ahead of every adventure.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/plan" 
                className="travel-button inline-flex items-center justify-center gap-2 text-lg font-semibold"
              >
                Start Planning Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/dashboard"
                className="travel-pill travel-body-text hover:opacity-90 transition-opacity duration-200"
              >
                Explore the Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-earth">Powerful Features for Carefree Planning</h2>
            <p className="travel-body-text max-w-3xl mx-auto">
              Every detail is lovingly designed to simplify decisions and add warmth to your exploration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="travel-feature-card h-full">
              <div className="travel-icon-ring mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-earth mb-2">Destination Discovery</h3>
              <p className="travel-body-text">
                Explore 50+ handpicked destinations across India with lovingly curated local insights and highlights.
              </p>
            </div>
            <div className="travel-feature-card h-full">
              <div className="travel-icon-ring mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-earth mb-2">Smart Budgeting</h3>
              <p className="travel-body-text">
                Relax into your journey with clarity on costs for accommodations, activities, dining, and travel essentials.
              </p>
            </div>
            <div className="travel-feature-card h-full">
              <div className="travel-icon-ring mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-earth mb-2">Attraction Selection</h3>
              <p className="travel-body-text">
                Browse thousands of experiences tailored to your vibe, complete with curated recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 px-4">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-earth">Experience Thoughtful Guidance</h2>
            <p className="travel-body-text max-w-3xl mx-auto">
              We keep things calm and collected while making sure your plans stay flexible and weather-smart.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-earth">Intelligent Itinerary Generation</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="travel-step-circle">1</span>
                  <p className="travel-body-text">Select your destination and travel dates.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="travel-step-circle">2</span>
                  <p className="travel-body-text">Share your interests, pace, and must-dos.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="travel-step-circle">3</span>
                  <p className="travel-body-text">Receive balanced, AI-curated days with room to breathe.</p>
                </div>
              </div>
            </div>
            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-earth">Smart Weather Integration</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="travel-step-circle">✓</span>
                  <p className="travel-body-text">Enjoy weather-ready attraction suggestions for every scenario.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="travel-step-circle">✓</span>
                  <p className="travel-body-text">See sunrise, golden hour, and off-peak timing at a glance.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="travel-step-circle">✓</span>
                  <p className="travel-body-text">Access cozy alternatives when the forecast shifts last minute.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-earth">How It Works</h2>
            <p className="travel-body-text max-w-2xl mx-auto">
              A guided path that keeps every step simple, supported, and stress-free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Enter Details', description: 'Share your travel preferences and companions.' },
              { title: 'Select Attractions', description: 'Handpick experiences from AI-curated lists.' },
              { title: 'Review Budget', description: 'Understand costs before you commit.' },
              { title: 'Plan Complete', description: 'Receive a ready-to-go itinerary with backups.' },
            ].map((item, index) => (
              <div key={item.title} className="travel-section text-center space-y-3">
                <div className="travel-step-circle mx-auto text-2xl">{index + 1}</div>
                <h3 className="text-lg font-semibold text-earth">{item.title}</h3>
                <p className="travel-body-text">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="py-16 px-4">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-earth">What Travelers Are Saying</h2>
            <p className="travel-body-text max-w-3xl mx-auto">
              Real stories from journeys made smoother, safer, and sweeter.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The AI recommendations were spot-on! Saved me hours of research and planning.',
                author: 'Rahul M., Delhi Escape',
              },
              {
                quote: 'Budget planning helped me savor every moment of my Rajasthan tour without overspending.',
                author: 'Sarah K., Desert Adventure',
              },
              {
                quote: 'Weather-smart tips kept our Kerala getaway flexible yet fully packed with memories.',
                author: 'John D., Monsoon Wanderer',
              },
            ].map((testimonial) => (
              <div key={testimonial.author} className="travel-testimonial-card p-6 space-y-4">
                <div className="flex items-center gap-2 travel-body-text">
                  <span className="travel-rating text-lg">★★★★★</span>
                  <span className="travel-subtle-text">5.0</span>
                </div>
                <p className="travel-body-text italic">"{testimonial.quote}"</p>
                <p className="text-sm travel-subtle-text">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="travel-gradient-banner text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-earth">Ready to Start Your Journey?</h2>
            <p className="text-lg md:text-xl travel-body-text max-w-2xl mx-auto">
              Join thousands of happy travelers embracing kinder, smarter trip planning with AI at their side.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/plan" 
                className="travel-button inline-flex items-center justify-center gap-2 text-lg font-semibold"
              >
                Start Planning Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/register"
                className="travel-pill travel-body-text hover:opacity-90 transition-opacity duration-200"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroductionPage; 