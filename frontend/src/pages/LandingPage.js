import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
          const data = await response.json();
          setSegments(data);
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
      description: 'Receive your rewards daily, directly to your connected Solana wallet.',
      stat: '13K+',
      statLabel: 'Active Investors',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Your Wallet',
      description: 'Link your Phantom or Solflare wallet to access the platform securely.',
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
          className="absolute inset-0 opacity-10 dark:opacity-5"
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
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Live on Polygon Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 font-['Outfit']">
              Invest in the{' '}
              <span className="text-gradient">Infrastructure</span>{' '}
              of Tomorrow
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-10 max-w-2xl">
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
                <span className="text-sm text-muted-foreground">Audited Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Non-Custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Multi-Wallet Support</span>
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
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-['Outfit']">
              Why Choose <span className="text-gradient">EcoDePIN</span>?
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

      {/* Segments Section */}
      <section className="py-20 md:py-32 bg-muted/30" id="segments">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-['Outfit']">
                Investment <span className="text-gradient">Segments</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
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
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 font-['Outfit']">
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
              onClick={() => window.open('https://ethereum.org', '_blank')}
              data-testid="cta-learn-more"
            >
              Learn About Ethereum
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
