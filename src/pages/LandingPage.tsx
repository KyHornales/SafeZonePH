import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Heart, CheckCircle, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Buddy System',
      description: 'Connect with trained volunteers and community members for mutual support during emergencies.',
    },
    {
      icon: Award,
      title: 'Bayanihan Points',
      description: 'Earn rewards for helping your community. Climb ranks and unlock achievements.',
    },
    {
      icon: Heart,
      title: 'Community Care',
      description: 'Regular check-ins ensure no one is left behind. Build lasting connections.',
    },
    {
      icon: CheckCircle,
      title: 'Task Coordination',
      description: 'Organize relief efforts, wellness checks, and community tasks efficiently.',
    },
  ];

  const steps = [
    { number: '01', title: 'Sign Up', description: 'Create your account and complete your profile' },
    { number: '02', title: 'Get Matched', description: 'Connect with buddies in your community' },
    { number: '03', title: 'Stay Connected', description: 'Regular check-ins keep everyone safe' },
    { number: '04', title: 'Help & Earn', description: 'Complete tasks and earn Bayanihan Points' },
  ];

  const testimonials = [
    {
      quote: "SafeZonePH helped me find reliable neighbors to look after my elderly mother during typhoon season.",
      author: 'Maria Santos',
      location: 'Quezon City',
    },
    {
      quote: "The buddy system gave me peace of mind knowing someone would check on me during emergencies.",
      author: 'Lolo Pedro',
      location: 'Makati',
    },
    {
      quote: "I've earned over 2,000 Bayanihan Points helping my community. It's rewarding work!",
      author: 'Juan Dela Cruz',
      location: 'Pasig',
    },
  ];

  return (
    <div className="min-h-screen bg-warm-sand">
      {/* Header */}
      <header className="bg-deep-slate text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              <span className="font-display font-bold text-lg md:text-xl">SafeZonePH</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/login" className="text-white/70 hover:text-white transition-colors font-medium text-sm md:text-base px-2 py-1">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-slate to-deep-slate-700 text-white py-12 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Building Resilient<br />
              <span className="text-primary">Filipino Communities</span>
            </h1>
            <p className="text-base md:text-xl text-white/70 mb-6 md:mb-8 leading-relaxed">
              SafeZonePH connects neighbors through a powerful buddy system, ensuring no one is left behind during emergencies. Join thousands of Filipinos building stronger, safer communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/register" className="btn btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto justify-center">
                Join SafeZonePH
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn btn-outline border-white text-white hover:bg-white hover:text-deep-slate text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto justify-center">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-4xl font-bold mb-1">10K+</div>
              <div className="text-white/70 text-xs md:text-base">Active Users</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold mb-1">5K+</div>
              <div className="text-white/70 text-xs md:text-base">Buddy Pairs</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold mb-1">50K+</div>
              <div className="text-white/70 text-xs md:text-base">Check-ins</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold mb-1">100+</div>
              <div className="text-white/70 text-xs md:text-base">Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-deep-slate mb-3 md:mb-4">
              Empowering Communities
            </h2>
            <p className="text-base md:text-lg text-deep-slate/60 max-w-2xl mx-auto">
              SafeZonePH provides the tools you need to stay connected, prepared, and resilient.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-bold text-base md:text-xl text-deep-slate mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-deep-slate/60 text-xs md:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-deep-slate mb-3 md:mb-4">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-deep-slate/60 max-w-2xl mx-auto">
              Getting started with SafeZonePH is easy. Follow these simple steps.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-4xl md:text-6xl font-display font-bold text-primary/20 mb-2 md:mb-4">{step.number}</div>
                <h3 className="font-bold text-base md:text-xl text-deep-slate mb-1 md:mb-2">{step.title}</h3>
                <p className="text-deep-slate/60 text-xs md:text-base">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-8 h-8 text-primary/30 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-deep-slate mb-3 md:mb-4">
              Community Stories
            </h2>
            <p className="text-base md:text-lg text-deep-slate/60 max-w-2xl mx-auto">
              See how SafeZonePH is making a difference in Filipino communities.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-4 md:p-6">
                <p className="text-deep-slate/80 mb-3 md:mb-4 italic text-sm md:text-base">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:text-base">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-deep-slate text-sm md:text-base">{testimonial.author}</div>
                    <div className="text-xs md:text-sm text-deep-slate/60">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-burnt-orange text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-3 md:mb-4">
            Ready to Join SafeZonePH?
          </h2>
          <p className="text-base md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto">
            Start building connections and making your community more resilient today.
          </p>
          <Link to="/register" className="btn bg-white text-burnt-orange hover:bg-white/90 text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-slate text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <span className="font-display font-bold text-xl">SafeZonePH</span>
              </div>
              <p className="text-white/60 text-sm">
                Building resilient Filipino communities through connection and care.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Hotlines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-white/60">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@safezoneph.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (02) 8123-4567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Manila, Philippines
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/40 text-sm">
            © 2026 SafeZonePH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
