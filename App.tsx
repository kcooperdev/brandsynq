
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowRight,
  ChevronRight,
  Globe,
  Zap,
  Layers,
  Cpu,
  Users,
  Handshake,
  Megaphone,
  TrendingUp,
  Star
} from 'lucide-react';
import { NAVIGATION_LINKS } from './constants';

// ============================================================
// HOOKS
// ============================================================

const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
};

const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

// ============================================================
// SCROLL TO TOP ON ROUTE CHANGE + POSTHOG PAGE VIEW
// ============================================================

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const posthog = usePostHog();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (posthog) {
      posthog.capture('$pageview', { path: pathname });
    }
  }, [pathname, posthog]);
  useEffect(() => {
    if (posthog) {
      const stored = localStorage.getItem('brandsynq_visitor_id');
      const visitorId = stored || crypto.randomUUID();
      if (!stored) localStorage.setItem('brandsynq_visitor_id', visitorId);
      posthog.identify(visitorId);
      if (import.meta.env.DEV) (window as any).posthog = posthog;
    }
  }, [posthog]);
  return null;
};

// ============================================================
// SCROLL REVEAL WRAPPER
// ============================================================

const Reveal = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) => {
  const { ref, inView } = useInView();
  const transforms: Record<string, string> = {
    up: 'translateY(50px)',
    down: 'translateY(-50px)',
    left: 'translateX(50px)',
    right: 'translateX(-50px)'
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: inView ? 'translate(0)' : transforms[direction],
        opacity: inView ? 1 : 0,
        transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// ============================================================
// HEADER
// ============================================================

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'py-3 bg-brand-black/90 backdrop-blur-xl border-b border-white/5' 
          : 'py-5 md:py-8'
      }`}>
        <div className="container mx-auto px-5 md:px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="BrandSynq" className="w-9 h-9 md:w-11 md:h-11 object-contain" />
            <span className="text-lg md:text-xl font-display font-bold tracking-tighter uppercase">
              Brand<span className="text-brand-gold">Synq</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {NAVIGATION_LINKS.map(link => (
              <NavLink 
                key={link.name} 
                to={link.href}
                className={({ isActive }) => 
                  `text-[10px] uppercase tracking-[0.3em] font-bold transition-colors duration-300 ${
                    isActive ? 'text-brand-gold' : 'text-white/50 hover:text-brand-gold'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <a href="https://tidycal.com/book-a-session/30-minute-meeting-1xo6859-m48npd0" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-black text-[10px] uppercase tracking-widest font-black hover:bg-brand-gold transition-all duration-300">
              Work With Us
            </a>
          </div>
          
          <button 
            className="lg:hidden text-brand-gold z-[110] relative p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[105] bg-brand-black/[0.98] backdrop-blur-2xl transition-all duration-500 lg:hidden flex flex-col justify-center items-center ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <button
          className="absolute top-5 right-5 text-brand-gold p-2 z-10"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-7 h-7" />
        </button>

        <div className="flex flex-col items-center gap-6 sm:gap-8">
          {NAVIGATION_LINKS.map((link, i) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-wider text-white/80 hover:text-brand-gold transition-all duration-300"
              style={{
                transform: menuOpen ? 'translateY(0)' : `translateY(${20 + i * 10}px)`,
                opacity: menuOpen ? 1 : 0,
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 80}ms`
              }}
            >
              {link.name}
            </Link>
          ))}
          <a
            href="https://tidycal.com/book-a-session/30-minute-meeting-1xo6859-m48npd0"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-4 px-8 py-3 bg-brand-gold text-black text-sm uppercase tracking-widest font-black hover:bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? 'translateY(0)' : 'translateY(40px)',
              opacity: menuOpen ? 1 : 0,
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${150 + NAVIGATION_LINKS.length * 80}ms`
            }}
          >
            Work With Us
          </a>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <p className="text-[10px] text-white/15 uppercase tracking-[0.4em] font-bold">
            Synchronizing Innovation
          </p>
        </div>
      </div>
    </>
  );
};

// ============================================================
// FOOTER
// ============================================================

const Footer: React.FC = () => {
  return (
    <footer className="py-12 md:py-20 border-t border-white/5">
      <div className="container mx-auto px-5 md:px-6">
        <div className="flex flex-col gap-8 md:gap-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="BrandSynq" className="w-9 h-9 object-contain" />
                <span className="text-lg md:text-xl font-display font-bold tracking-tighter">BrandSynq</span>
              </Link>
              <p className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-widest font-bold text-center md:text-left">
                Tech that moves communities forward.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {NAVIGATION_LINKS.map(link => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-white/40 hover:text-brand-gold transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-white/5"></div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[9px] md:text-[10px] text-white/20 font-bold tracking-widest uppercase">
              &copy; 2025 BrandSynq LLC. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-[9px] md:text-[10px] text-white/20 hover:text-brand-gold transition-colors duration-300 font-bold tracking-widest uppercase">
                Privacy
              </a>
              <a href="#" className="text-[9px] md:text-[10px] text-white/20 hover:text-brand-gold transition-colors duration-300 font-bold tracking-widest uppercase">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// PAGE: HOME
// ============================================================

const HomePage: React.FC = () => {
  const scrollY = useScrollY();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen pt-28 md:pt-40 pb-16 md:pb-20 flex flex-col justify-center overflow-hidden">
        <div className="container mx-auto px-5 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <Reveal>
              <p className="text-brand-gold font-display font-medium tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                <span className="w-8 md:w-12 h-[1px] bg-brand-gold/30"></span>
                Synchronizing Innovation
              </p>
            </Reveal>

            <Reveal delay={150}>
              <h1 className="text-[2.75rem] leading-[0.92] sm:text-6xl md:text-7xl lg:text-[110px] font-display font-bold tracking-tighter mb-8 md:mb-10">
                TECH THAT MOVES <br />
                <span className="text-outline">COMMUNITIES</span> <br />
                <span className="gold-shimmer">FORWARD.</span>
              </h1>
            </Reveal>
            
            <Reveal delay={300}>
              <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-12 mt-8 md:mt-16">
                <div className="max-w-md">
                  <p className="text-base md:text-lg text-white/60 leading-relaxed font-light">
                    We design digital infrastructure that bridges the gap between raw data and human connection. BrandSynq builds for the overlooked and the ambitious.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link to="/initiatives" className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b border-brand-gold pb-1 hover:text-brand-gold transition-all duration-300">
                    The Ecosystem <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        
        {/* Parallax Background */}
        <div 
          className="absolute top-[15%] right-[-15%] md:right-[-10%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-brand-gold/5 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow parallax-bg"
          style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] md:left-[-5%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-white/[0.03] rounded-full blur-[60px] md:blur-[100px] parallax-bg"
          style={{ transform: `translate3d(0, ${scrollY * -0.08}px, 0)` }}
        />
        <div 
          className="hidden md:block absolute top-[55%] left-[35%] w-[150px] h-[150px] bg-brand-gold/[0.02] rounded-full blur-[80px] parallax-bg"
          style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }}
        />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-brand-gold/30 to-brand-gold/60 animate-pulse-slow" />
        </div>
      </section>

    </>
  );
};

// ============================================================
// PAGE: ABOUT
// ============================================================

const AboutPage: React.FC = () => {
  const scrollY = useScrollY();

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 relative overflow-hidden">
      <div className="container mx-auto px-5 md:px-6">
        <Reveal>
          <div className="mb-12 md:mb-20">
            <h2 className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] text-brand-gold mb-3 md:mb-4 font-medium">About Us</h2>
            <div className="section-line mb-6"></div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <Reveal delay={100}>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-brand-gold font-bold">Founder & CEO</p>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.05] tracking-tighter mt-2">
                Khalif <span className="text-brand-gold">Cooper</span>
              </h3>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-white/60 text-base md:text-lg leading-relaxed font-light max-w-lg">
                Self-taught engineer. Community architect. Ecosystem catalyst. Khalif built BLK Tech Connect from a simple idea in Baltimore into a <span className="text-white font-medium">750+ member network</span> of technologists, innovators, and creators -- in under a year.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <p className="text-white/40 text-sm md:text-base leading-relaxed font-light max-w-lg">
                With over a decade navigating the tech industry, he now channels that experience into building spaces others never had. He also founded <span className="text-white/60">Baltimore Tech Week</span>, spotlighting the builders, founders, and creators shaping the city's tech future.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <p className="text-white/40 text-sm md:text-base leading-relaxed font-light max-w-lg">
                His mission is simple: create curated, inclusive experiences that blend technology, culture, and community -- and make sure the next generation of underrepresented tech leaders has a seat at the table.
              </p>
            </Reveal>

          </div>

          <div className="relative order-1 lg:order-2">
            <Reveal direction="left" delay={200}>
              <div className="relative">
                <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
                  <img 
                    src="/founder.png" 
                    alt="Khalif Cooper - Founder" 
                    className="w-full h-full object-cover object-top grayscale transition-all duration-700 parallax-img"
                    style={{ transform: `scale(1.05) translate3d(0, ${scrollY * 0.03}px, 0)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-brand-black/20"></div>
                </div>
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-full h-full border border-brand-gold/20 -z-10"></div>
                <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 glass-morphism px-4 py-3 md:px-6 md:py-4 z-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold mb-1">Founded</p>
                  <p className="text-xl md:text-2xl font-display font-bold">2025</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div 
        className="absolute top-[30%] right-[-20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-gold/[0.02] rounded-full blur-[100px] parallax-bg"
        style={{ transform: `translate3d(0, ${scrollY * 0.06}px, 0)` }}
      />

    </section>
  );
};

// ============================================================
// PAGE: INITIATIVES
// ============================================================

const InitiativesPage: React.FC = () => {
  const scrollY = useScrollY();

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 relative overflow-hidden">
      <div className="container mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-12 md:mb-20">
          <div className="md:col-span-7">
            <Reveal>
              <h2 className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] text-brand-gold mb-3 md:mb-4 font-medium">Focus Areas</h2>
              <div className="section-line mb-6"></div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tighter">
                Empowerment through <br className="hidden md:block"/> digital ecosystems.
              </h3>
            </Reveal>
          </div>
          <div className="md:col-span-5 md:text-right">
            <Reveal delay={200}>
              <p className="text-white/40 text-sm italic">"Intelligence is only valuable when it's accessible."</p>
            </Reveal>
          </div>
        </div>

        {/* BLK Tech Connect */}
        <Reveal delay={100}>
          <div className="group relative bg-brand-dark border border-white/5 hover:border-brand-gold/20 transition-all duration-500 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[500px] overflow-hidden">
                <img 
                  src="/blk-tech-connect.png" 
                  alt="BLK Tech Connect community collaborating" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 parallax-img"
                  style={{ transform: `scale(1.08) translate3d(0, ${Math.max(0, (scrollY - 200) * 0.04)}px, 0)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-black/60 via-brand-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-brand-dark"></div>
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 bg-brand-gold text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  Community Hub
                </div>
              </div>

              <div className="p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-center space-y-5 md:space-y-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brand-gold" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Initiative</span>
                </div>
                
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight">BLK Tech Connect</h4>
                
                <p className="text-white/50 leading-relaxed font-light text-sm md:text-base max-w-md">
                  Baltimore-based. Redefining the tech pipeline. We build networks that turn isolated talent into collaborative powerhouses. BLK Tech Connect creates pathways for underrepresented professionals to access opportunities, mentorship, and resources in the technology sector.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {['Baltimore', 'Community', 'Inclusion', 'Tech Access', 'Mentorship'].map(tag => (
                    <span key={tag} className="px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold border border-white/10 text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 md:pt-6 border-t border-white/5">
                  <div>
                    <p className="text-xl sm:text-2xl font-display font-bold text-brand-gold">800+</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/30 mt-1">Members</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-display font-bold text-brand-gold">10+</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/30 mt-1">Events</p>
                  </div>
                </div>

                <a href="https://www.blktechconnect.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold group-hover:gap-4 transition-all duration-300 pt-2">
                  Join the Movement <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Sub-initiatives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
          <Reveal delay={200}>
            <div className="group glass-morphism p-6 md:p-8 hover:border-brand-gold/20 transition-all duration-500 h-full">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/10 rounded-full mb-4 md:mb-6 group-hover:border-brand-gold/30 transition-colors">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
              </div>
              <h5 className="text-base md:text-lg font-bold mb-2 md:mb-3">Digital Access</h5>
              <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed">
                Breaking barriers to technology education and professional development in underserved communities.
              </p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="group glass-morphism p-6 md:p-8 hover:border-brand-gold/20 transition-all duration-500 h-full">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/10 rounded-full mb-4 md:mb-6 group-hover:border-brand-gold/30 transition-colors">
                <Layers className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
              </div>
              <h5 className="text-base md:text-lg font-bold mb-2 md:mb-3">Talent Pipeline</h5>
              <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed">
                Creating structured pathways connecting emerging talent with leading technology companies.
              </p>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="group glass-morphism p-6 md:p-8 hover:border-brand-gold/20 transition-all duration-500 h-full sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/10 rounded-full mb-4 md:mb-6 group-hover:border-brand-gold/30 transition-colors">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
              </div>
              <h5 className="text-base md:text-lg font-bold mb-2 md:mb-3">Innovation Labs</h5>
              <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed">
                Incubating bold ideas from the community and transforming them into scalable products.
              </p>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div className="group glass-morphism p-6 md:p-8 hover:border-brand-gold/20 transition-all duration-500 h-full sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/10 rounded-full mb-4 md:mb-6 group-hover:border-brand-gold/30 transition-colors">
                  <Handshake className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
                </div>
                <h5 className="text-base md:text-lg font-bold mb-2 md:mb-3">Partnerships & Sponsors</h5>
                <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed">
                  Invest in our community. Partner with us to amplify impact, sponsor events, or grow alongside the next generation of tech leaders.
                </p>
              </div>
              <a href="https://tidycal.com/book-a-session/30-minute-meeting-1xo6859-m48npd0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold group-hover:gap-4 transition-all duration-300 mt-6 pt-4 border-t border-white/5">
                Support Our Initiative <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <div 
        className="absolute bottom-[-10%] left-[-15%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-brand-gold/[0.015] rounded-full blur-[100px] parallax-bg"
        style={{ transform: `translate3d(0, ${scrollY * -0.05}px, 0)` }}
      />
    </section>
  );
};

// ============================================================
// PAGE: SERVICES
// ============================================================

const CapabilityItem = ({ title, desc, icon: Icon, index }: { title: string; desc: string; icon: any; index: number }) => {
  const { ref, inView } = useInView();
  return (
    <div 
      ref={ref}
      className="group py-8 md:py-12 border-b border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 hover:bg-white/[0.01] transition-all duration-300 px-4 cursor-pointer"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-30px)',
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`
      }}
    >
      <div className="md:col-span-1 flex items-center">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-brand-gold/40 group-hover:text-brand-gold transition-colors duration-300" />
      </div>
      <div className="md:col-span-4 flex items-center">
        <h5 className="text-base md:text-xl font-bold uppercase tracking-widest">{title}</h5>
      </div>
      <div className="md:col-span-6 flex items-center">
        <p className="text-white/50 font-light text-xs md:text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="hidden md:flex col-span-1 items-center justify-end">
        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
      </div>
    </div>
  );
};

const ServicesPage: React.FC = () => {
  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-brand-black relative overflow-hidden">
      <div className="container mx-auto px-5 md:px-6">
        <div className="mb-12 md:mb-20">
          <Reveal>
            <h2 className="text-brand-gold font-display font-medium tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs mb-3 md:mb-4">Core Competencies</h2>
            <div className="section-line mb-6"></div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tighter">We build for scale.</h3>
          </Reveal>
        </div>
        
        <div className="flex flex-col">
          <CapabilityItem title="Analytics" desc="Stop guessing. See what drives your growth. We turn your data into decisions that actually move the needle—so you know exactly where to invest next." icon={Layers} index={0} />
          <CapabilityItem title="App Development" desc="Your idea, shipped. From concept to launch, we build the software that scales with you. No endless revisions. No tech debt. Just products that work." icon={Cpu} index={1} />
          <CapabilityItem title="Growth Strategy" desc="Stuck at the same revenue? We map the path from where you are to where you want to be—with playbooks that have helped founders 2x their reach." icon={Zap} index={2} />
        </div>

        <Reveal delay={200}>
          <div className="mt-12 md:mt-20 p-6 sm:p-8 md:p-12 border border-white/5 bg-brand-dark/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h4 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">Ready to build something?</h4>
              <p className="text-white/40 text-sm font-light">Let's discuss how we can engineer your vision into reality.</p>
            </div>
            <a href="https://tidycal.com/book-a-session/30-minute-meeting-1xo6859-m48npd0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-brand-gold text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all duration-300 flex-shrink-0">
              Work With Us <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ============================================================
// PAGE: WORK WITH US
// ============================================================

const PartnersPage: React.FC = () => {
  const scrollY = useScrollY();

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-brand-dark relative overflow-hidden">
      <div className="container mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-12 md:mb-20">
          <div className="md:col-span-8">
            <Reveal>
              <h2 className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] text-brand-gold mb-3 md:mb-4 font-medium">Partnerships & Sponsorships</h2>
              <div className="section-line mb-6"></div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tighter">
                Work with us. <br className="hidden sm:block"/>
                <span className="text-outline">Build with us.</span>
              </h3>
            </Reveal>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Reveal delay={200}>
              <p className="text-white/40 text-sm md:text-base font-light leading-relaxed">
                Partner with BrandSynq to amplify your brand while making a direct impact on the communities we serve.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Why Partner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-24">
          {[
            { icon: TrendingUp, title: 'Brand Visibility', desc: 'Reach an engaged audience of tech professionals and innovators across our ecosystem.' },
            { icon: Users, title: 'Community Access', desc: 'Connect directly with a diverse network of developers, designers, and entrepreneurs.' },
            { icon: Megaphone, title: 'Event Presence', desc: 'Featured placement at BLK Tech Connect events, workshops, and conferences.' },
            { icon: Star, title: 'Impact Storytelling', desc: 'Co-create content that highlights your commitment to diversity and inclusion in tech.' },
          ].map((item, i) => (
            <div key={item.title}>
              <Reveal delay={100 + i * 100}>
                <div className="group glass-morphism p-5 md:p-6 hover:border-brand-gold/20 transition-all duration-500 h-full">
                  <item.icon className="w-5 h-5 text-brand-gold mb-3 md:mb-4" />
                  <h5 className="text-sm md:text-base font-bold mb-2 uppercase tracking-wider">{item.title}</h5>
                  <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={200}>
          <div className="mt-12 md:mt-16 p-6 sm:p-8 md:p-12 border border-white/5 bg-brand-black/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-brand-gold/40 via-brand-gold/10 to-transparent"></div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8">
              <div className="max-w-xl">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">Interested in partnering?</h4>
                <p className="text-white/40 text-sm md:text-base font-light leading-relaxed">
                  Reach out and let's explore how we can create impact together. From event sponsorships to long-term ecosystem partnerships, we'd love to hear from you.
                </p>
              </div>
              <a href="https://tidycal.com/book-a-session/30-minute-meeting-1xo6859-m48npd0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-brand-gold transition-all duration-300 flex-shrink-0">
                Let's Talk <Handshake className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="absolute top-[10%] left-[-10%] w-[250px] md:w-[450px] h-[250px] md:h-[450px] bg-brand-gold/[0.015] rounded-full blur-[100px] parallax-bg" style={{ transform: `translate3d(0, ${scrollY * 0.05}px, 0)` }} />
      <div className="absolute bottom-[10%] right-[-15%] w-[200px] md:w-[350px] h-[200px] md:h-[350px] bg-white/[0.01] rounded-full blur-[80px] parallax-bg" style={{ transform: `translate3d(0, ${scrollY * -0.03}px, 0)` }} />
    </section>
  );
};

// ============================================================
// PAGE: CONTACT
// ============================================================

const ContactPage: React.FC = () => {
  const scrollY = useScrollY();

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-brand-dark relative overflow-hidden">
      <div className="container mx-auto px-5 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 lg:gap-24">
          <div className="md:col-span-5 space-y-8 md:space-y-10">
            <Reveal>
              <h2 className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] text-brand-gold mb-3 md:mb-4 font-medium">Get In Touch</h2>
              <div className="section-line mb-6"></div>
              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tighter">
                START A <br/><span className="text-brand-gold">SYNQ.</span>
              </h3>
            </Reveal>

            <Reveal delay={150}>
              <p className="text-white/40 text-base md:text-lg font-light leading-relaxed">
                We're looking for partners who believe that technology should move everyone forward, not just a few. 
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="space-y-5 md:space-y-6 pt-6 md:pt-10">
                <a href="mailto:hello@brandsynq.tech" className="block text-lg sm:text-xl md:text-2xl font-bold border-b border-white/10 pb-3 md:pb-4 hover:text-brand-gold transition-all duration-300">
                  hello@brandsynq.tech
                </a>
                <div className="flex gap-6 md:gap-8">
                  <a href="#" className="text-xs md:text-sm font-bold tracking-widest text-white/50 hover:text-white transition-colors duration-300">LINKEDIN</a>
                  <a href="#" className="text-xs md:text-sm font-bold tracking-widest text-white/50 hover:text-white transition-colors duration-300">TWITTER</a>
                </div>
              </div>
            </Reveal>
          </div>
          
          <div className="md:col-span-7">
            <Reveal direction="left" delay={200}>
              <div className="bg-brand-black p-6 sm:p-8 md:p-10 lg:p-16 border border-white/5 relative">
                <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 border-t border-r border-brand-gold/20 -m-[1px]"></div>
                <form className="space-y-8 md:space-y-12">
                  <div className="relative group">
                    <input type="text" placeholder="YOUR NAME" className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 outline-none focus:border-brand-gold text-sm md:text-lg transition-all duration-300 placeholder:text-white/10 uppercase tracking-widest" />
                  </div>
                  <div className="relative group">
                    <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 outline-none focus:border-brand-gold text-sm md:text-lg transition-all duration-300 placeholder:text-white/10 uppercase tracking-widest" />
                  </div>
                  <div className="relative group">
                    <textarea rows={3} placeholder="HOW CAN WE COLLABORATE?" className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 outline-none focus:border-brand-gold text-sm md:text-lg transition-all duration-300 placeholder:text-white/10 uppercase tracking-widest resize-none" />
                  </div>
                  <button className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black tracking-[0.3em] md:tracking-[0.4em] uppercase group">
                    Send Message 
                    <span className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-brand-gold text-black rounded-full group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="absolute top-[20%] right-[-10%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-brand-gold/[0.02] rounded-full blur-[100px] parallax-bg" style={{ transform: `translate3d(0, ${scrollY * 0.04}px, 0)` }} />
    </section>
  );
};

// ============================================================
// APP WITH ROUTER
// ============================================================

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="antialiased selection:bg-brand-gold selection:text-black">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/initiatives" element={<InitiativesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
