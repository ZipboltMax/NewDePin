import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  Shield,
  Leaf,
  Zap,
  Server,
  Battery,
  Sun,
  CheckCircle2,
  ChevronRight,
  Brain,
  Cpu,
  Car,
  Plane,
  PlugZap,
  Activity,
  Timer,
  Target,
  Gauge,
  Route,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/segments`);
        if (response.ok) {
          const result = await response.json();
          // Handle both formats: direct array or {success, data} wrapper
          const data = result.data || result;
          setSegments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch segments:', error);
      }
    };
    fetchSegments();
  }, []);

  const getIcon = (iconName) => {
    const icons = {
      Server: Server,
      Battery: Battery,
      Zap: Zap,
      Sun: Sun,
      Leaf: Leaf,
    };
    const Icon = icons[iconName] || Leaf;
    return <Icon className="h-6 w-6" />;
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'High Yield Returns',
      description: 'Earn up to 18% APY on your investments backed by real-world infrastructure assets.',
      stat: '18%',
      statLabel: 'Max APY',
    },
    {
      icon: Shield,
      title: 'Real Asset Backing',
      description: 'Every token is backed by physical infrastructure generating real revenue.',
      stat: '$190M+',
      statLabel: 'Total TVL',
    },
    {
      icon: Leaf,
      title: 'Carbon Negative',
      description: 'Your investments actively reduce carbon emissions and support sustainable growth.',
      stat: '50K+',
      statLabel: 'Tons CO₂ Offset',
    },
    {
      icon: PiggyBank,
      title: 'Daily Payouts',
      description: 'Receive your rewards daily, directly to your connected Polygon wallet.',
      stat: '13K+',
      statLabel: 'Active Investors',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Your Wallet',
      description: 'Link your MetaMask or Trust Wallet to access the platform on Polygon network.',
    },
    {
      step: '02',
      title: 'Choose Your Segment',
      description: 'Select from data centers, batteries, EV charging, renewable energy, or green credits.',
    },
    {
      step: '03',
      title: 'Invest & Earn',
      description: 'Pick a plan that fits your goals and start earning daily rewards immediately.',
    },
  ];

  // Agentic AI Use Cases
  const agenticAIUseCases = [
    {
      icon: Battery,
      title: 'Energy Storage Systems (BESS)',
      subtitle: 'The Self-Balancing Grid',
      description: 'When a thermal anomaly is detected, the agent doesn\'t just alert a technician. It autonomously throttles the specific cell\'s load, redirects energy flow to healthier modules, and orders a replacement part via the supply chain.',
      result: '40% increase in component life',
      resultDetail: 'by eliminating human latency in critical safety decisions',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Server,
      title: 'Data Centers',
      subtitle: 'Zero-Downtime Power Orchestration',
      description: 'The AI agents act as "Virtual Facility Managers." They monitor electricity pricing and grid load to decide—without human input—when to switch the data center from grid power to BESS, ensuring the lowest carbon footprint and cost.',
      result: '30% reduction in energy costs',
      resultDetail: 'through autonomous demand-response participation',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: PlugZap,
      title: 'EV Charging Infra',
      subtitle: 'Autonomous Maintenance Engines',
      description: 'If a charger fails a handshake with a vehicle, the agent initiates a remote self-reboot, updates its status on ZeFlash.App to "Maintenance," and reroutes incoming drivers to the nearest functional stall.',
      result: '99% uptime for CPOs',
      resultDetail: 'by resolving common software glitches before a driver even arrives',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Car,
      title: 'EV Fleets',
      subtitle: 'Dynamic Mission Planning',
      description: 'Agents analyze real-time factors like weather, terrain, and individual driver behavior to dynamically adjust a vehicle\'s route. If a battery\'s health drops mid-route, the agent automatically books a "flash-charge" slot at an upcoming station.',
      result: '60% reduction in roadside breakdowns',
      resultDetail: 'and optimized delivery windows',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Plane,
      title: 'eVTOL & Drones',
      subtitle: 'Mission-Critical Flight Agency',
      description: 'During flight, the agent constantly runs "Safety-to-Fly" simulations. If it detects a voltage sag that compromises landing safety, it takes over power-splitting between battery sources and autonomously designates an emergency landing pad.',
      result: 'Unparalleled safety benchmarks',
      resultDetail: 'for Urban Air Mobility (UAM)',
      gradient: 'from-indigo-500 to-violet-500',
    },
  ];

  const formatTVL = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center hero-gradient grain overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1654419189892-d8814766c4fd?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Live on Polygon Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 font-['Outfit'] text-white">
              Invest in the{' '}
              <span className="text-gradient">Infrastructure</span>{' '}
              of Tomorrow
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-200 mb-10 max-w-2xl">
              Earn sustainable yields by investing in real-world assets like data centers, 
              battery storage, EV charging, and renewable energy through decentralized 
              physical infrastructure on Polygon.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                onClick={() => user ? navigate('/dashboard') : login()}
                data-testid="hero-cta-primary"
              >
                Start Investing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-medium border-2 hover:bg-muted/50"
                onClick={() => navigate('/segments')}
                data-testid="hero-cta-secondary"
              >
                View Segments
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-200">Audited Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-200">Non-Custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-200">Multi-Wallet Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-['Outfit'] text-white">
              Why Choose <span className="text-gradient">Investyz</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining the power of DeFi with real-world sustainable infrastructure
            </p>
          </div>

          <div className="bento-grid">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:-translate-y-1 group ${
                  index === 0 ? 'col-span-2 row-span-2' : ''
                }`}
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 font-['Outfit']">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{feature.description}</p>
                  <div className="mt-auto">
                    <span className="text-3xl font-bold text-gradient">{feature.stat}</span>
                    <p className="text-sm text-muted-foreground">{feature.statLabel}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Agentic AI Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-slate-950 to-slate-900 text-white relative overflow-hidden" id="agentic-ai">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-1">
              <Brain className="h-4 w-4 mr-2" />
              Powered by Agentic AI
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-['Outfit']">
              The <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Agentic AI</span> Advantage
            </h2>
            <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
              By integrating Agentic AI—autonomous systems that can reason, plan, and act independently—
              we're moving beyond simple diagnostics into an era of <span className="text-white font-semibold">self-diagnosing energy infrastructure</span>.
            </p>
          </div>

          {/* AI Use Cases Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {agenticAIUseCases.map((useCase, index) => (
              <Card 
                key={index}
                className={`bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden group ${
                  index === 4 ? 'lg:col-span-2' : ''
                }`}
                data-testid={`agentic-ai-card-${index}`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Icon Column */}
                    <div className={`p-6 md:p-8 flex items-center justify-center bg-gradient-to-br ${useCase.gradient} md:w-32 shrink-0`}>
                      <useCase.icon className="h-10 w-10 text-white" />
                    </div>
                    
                    {/* Content Column */}
                    <div className="p-6 flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
                            {useCase.title}
                          </h3>
                          <p className="text-sm text-slate-300 font-medium">
                            {useCase.subtitle}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          Agentic Edge
                        </p>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {useCase.description}
                        </p>
                      </div>
                      
                      {/* Result Badge */}
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">{useCase.result}</span>
                        </div>
                        <span className="text-slate-300 text-sm">{useCase.resultDetail}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-700/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-3xl font-bold text-white">24/7</span>
              </div>
              <p className="text-sm text-slate-300">Autonomous Monitoring</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer className="h-5 w-5 text-emerald-400" />
                <span className="text-3xl font-bold text-white">&lt;1s</span>
              </div>
              <p className="text-sm text-slate-300">Response Time</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gauge className="h-5 w-5 text-blue-400" />
                <span className="text-3xl font-bold text-white">99.9%</span>
              </div>
              <p className="text-sm text-slate-300">System Uptime</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Route className="h-5 w-5 text-pink-400" />
                <span className="text-3xl font-bold text-white">Zero</span>
              </div>
              <p className="text-sm text-slate-300">Human Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Segments Section */}
      <section className="py-20 md:py-32 bg-muted/30" id="segments">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-['Outfit']">
                Investment <span className="text-gradient">Segments</span>
              </h2>
              <p className="text-lg text-black max-w-xl">
                Diversify across multiple sustainable infrastructure categories
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => navigate('/segments')}
              data-testid="view-all-segments-btn"
            >
              View All Segments
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.slice(0, 6).map((segment) => (
              <Link
                key={segment.segment_id}
                to={`/segments/${segment.segment_id}`}
                className="group"
                data-testid={`segment-card-${segment.segment_id}`}
              >
                <Card className="overflow-hidden h-full hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={segment.image_url}
                      alt={segment.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white">
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                          {getIcon(segment.icon)}
                        </div>
                        <h3 className="text-lg font-semibold">{segment.name}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {segment.short_description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Total TVL</p>
                        <p className="text-lg font-bold text-primary">{formatTVL(segment.total_tvl)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Investors</p>
                        <p className="text-lg font-semibold">{segment.investors_count.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-background" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-['Outfit'] text-white">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative"
                data-testid={`how-it-works-${index}`}
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-8" />
                )}
                <Card className="p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors h-full">
                  <span className="text-6xl font-bold text-primary/20 font-['Outfit']">{item.step}</span>
                  <h3 className="text-xl font-semibold mt-4 mb-3 font-['Outfit']">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => user ? navigate('/dashboard') : login()}
              data-testid="how-it-works-cta"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 font-['Outfit']">
            Ready to Invest in a{' '}
            <span className="text-gradient">Sustainable Future</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of investors earning yields while powering the green economy.
            Start with as little as $100.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => user ? navigate('/dashboard') : login()}
              data-testid="cta-primary"
            >
              Start Investing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-lg font-medium border-2"
              onClick={() => window.open('https://polygon.technology', '_blank')}
              data-testid="cta-learn-more"
            >
              Learn About Polygon
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

