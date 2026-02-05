import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Server, Battery, Zap, Sun, Leaf, Search, TrendingUp, Users, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SegmentsPage = () => {
  const [segments, setSegments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/segments`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setSegments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch segments:', error);
      } finally {
        setLoading(false);
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
    return <Icon className="h-8 w-8" />;
  };

  const formatTVL = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTVL = segments.reduce((sum, seg) => sum + seg.total_tvl, 0);
  const totalInvestors = segments.reduce((sum, seg) => sum + seg.investors_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="hero-gradient grain py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-['Outfit']">
              Investment <span className="text-gradient">Segments</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-8">
              Explore our diverse portfolio of sustainable infrastructure assets. 
              Each segment offers unique opportunities to earn yields while supporting the green economy.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-2xl font-bold">{formatTVL(totalTVL)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Value Locked</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">{totalInvestors.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Active Investors</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-full bg-background/80 backdrop-blur-sm"
                data-testid="segments-search"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Segments Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredSegments.map((segment) => (
              <Link
                key={segment.segment_id}
                to={`/segments/${segment.segment_id}`}
                className="group"
                data-testid={`segment-${segment.segment_id}`}
              >
                <Card className="overflow-hidden h-full hover:border-primary/30 transition-all hover:-translate-y-2 duration-300">
                  <div className="grid md:grid-cols-2">
                    {/* Image */}
                    <div className="aspect-square md:aspect-auto relative overflow-hidden">
                      <img
                        src={segment.image_url}
                        alt={segment.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-t" />
                      <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                        {getIcon(segment.icon)}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 flex flex-col">
                      <h2 className="text-2xl font-bold mb-3 font-['Outfit'] group-hover:text-primary transition-colors">
                        {segment.name}
                      </h2>
                      <p className="text-muted-foreground mb-6 flex-grow">
                        {segment.short_description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {segment.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">TVL</p>
                          <p className="text-xl font-bold text-primary">{formatTVL(segment.total_tvl)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Investors</p>
                          <p className="text-xl font-bold">{segment.investors_count.toLocaleString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredSegments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No segments found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SegmentsPage;
