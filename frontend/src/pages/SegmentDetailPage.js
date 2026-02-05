import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Server, Battery, Zap, Sun, Leaf, ArrowLeft, Clock, TrendingUp,
  Shield, AlertTriangle, CheckCircle, DollarSign, Calendar, Lock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SegmentDetailPage = () => {
  const { segmentId } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [segment, setSegment] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [projectedReturns, setProjectedReturns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [segmentRes, plansRes] = await Promise.all([
          fetch(`${API_URL}/api/segments/${segmentId}`),
          fetch(`${API_URL}/api/plans?segment_id=${segmentId}`),
        ]);

        if (segmentRes.ok) {
          const segmentResult = await segmentRes.json();
          const segmentData = segmentResult.data || segmentResult;
          setSegment(segmentData);
        }

        if (plansRes.ok) {
          const plansResult = await plansRes.json();
          const plansData = plansResult.data || plansResult;
          const plans = Array.isArray(plansData) ? plansData : [];
          setPlans(plans);
          if (plans.length > 0) {
            setSelectedPlan(plans[0]);
            setInvestmentAmount(plans[0].min_investment);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [segmentId]);

  useEffect(() => {
    const calculateReturns = async () => {
      if (!selectedPlan) return;

      try {
        const response = await fetch(`${API_URL}/api/calculator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: selectedPlan.plan_id,
            amount: investmentAmount,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setProjectedReturns(data);
        }
      } catch (error) {
        console.error('Failed to calculate returns:', error);
      }
    };

    calculateReturns();
  }, [selectedPlan, investmentAmount]);

  const handleInvest = async () => {
    if (!user) {
      login();
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/payments/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedPlan.plan_id,
          amount: investmentAmount,
          origin_url: window.location.origin,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = { Server, Battery, Zap, Sun, Leaf };
    const Icon = icons[iconName] || Leaf;
    return <Icon className="h-6 w-6" />;
  };

  const getRiskColor = (risk) => {
    const colors = {
      Low: 'text-green-500',
      Medium: 'text-yellow-500',
      High: 'text-red-500',
    };
    return colors[risk] || 'text-muted-foreground';
  };

  const getRiskProgress = (risk) => {
    const values = { Low: 25, Medium: 50, High: 85 };
    return values[risk] || 50;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Segment not found</h2>
          <Button onClick={() => navigate('/segments')}>Back to Segments</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 h-[400px] pointer-events-none">
          <img
            src={segment.image_url}
            alt={segment.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate('/segments')}
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Segments
          </Button>

          <div className="flex items-start gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm text-primary">
              {getIcon(segment.icon)}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] mb-2">
                {segment.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {segment.short_description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="plans" data-testid="tab-plans">Investment Plans</TabsTrigger>
                <TabsTrigger value="sustainability" data-testid="tab-sustainability">Sustainability</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 font-['Outfit']">About This Segment</h3>
                    <p className="text-muted-foreground mb-6">{segment.description}</p>

                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {segment.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Value Locked</p>
                          <p className="text-2xl font-bold">
                            ${(segment.total_tvl / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Investors</p>
                          <p className="text-2xl font-bold">
                            {segment.investors_count.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="plans" className="mt-6">
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <Card
                      key={plan.plan_id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan?.plan_id === plan.plan_id
                          ? 'border-primary shadow-glow'
                          : 'hover:border-primary/30'
                      }`}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setInvestmentAmount(plan.min_investment);
                      }}
                      data-testid={`plan-${plan.plan_id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold font-['Outfit']">{plan.name}</h3>
                              <Badge variant={plan.risk_level === 'Low' ? 'secondary' : plan.risk_level === 'Medium' ? 'outline' : 'destructive'}>
                                {plan.risk_level} Risk
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {plan.features.map((feature, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded bg-muted">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right sm:border-l sm:border-border sm:pl-6 min-w-[140px]">
                            <p className="text-3xl font-bold text-primary">{plan.apy}%</p>
                            <p className="text-xs text-muted-foreground mb-3">APY</p>
                            <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                              <Lock className="h-3 w-3" />
                              {plan.lock_period_days} days
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              ${plan.min_investment.toLocaleString()} - ${plan.max_investment.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sustainability" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 font-['Outfit']">Environmental Impact</h3>
                    <p className="text-muted-foreground mb-6">
                      Your investment in {segment.name} contributes directly to reducing carbon 
                      emissions and supporting the transition to sustainable energy infrastructure.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">Carbon Neutral</p>
                        <p className="text-sm text-muted-foreground">Operations</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-sm text-muted-foreground">Renewable Energy</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">Verified</p>
                        <p className="text-sm text-muted-foreground">ESG Compliance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Investment Calculator */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-['Outfit']">Investment Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedPlan ? (
                  <>
                    {/* Selected Plan */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{selectedPlan.name}</span>
                        <Badge>{selectedPlan.apy}% APY</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {selectedPlan.lock_period_days} days lock period
                      </div>
                    </div>

                    {/* Amount Slider */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Investment Amount</label>
                        <span className="text-sm font-bold text-primary">
                          ${investmentAmount.toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        value={[investmentAmount]}
                        onValueChange={(value) => setInvestmentAmount(value[0])}
                        min={selectedPlan.min_investment}
                        max={selectedPlan.max_investment}
                        step={100}
                        className="mb-2"
                        data-testid="investment-slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${selectedPlan.min_investment.toLocaleString()}</span>
                        <span>${selectedPlan.max_investment.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Risk Meter */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Risk Level</label>
                        <span className={`text-sm font-medium ${getRiskColor(selectedPlan.risk_level)}`}>
                          {selectedPlan.risk_level}
                        </span>
                      </div>
                      <Progress
                        value={getRiskProgress(selectedPlan.risk_level)}
                        className="h-2"
                      />
                    </div>

                    {/* Projected Returns */}
                    {projectedReturns && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="font-semibold text-sm">Projected Returns</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Daily</p>
                            <p className="font-semibold text-primary">
                              ${projectedReturns.projected_returns.daily.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Monthly</p>
                            <p className="font-semibold text-primary">
                              ${projectedReturns.projected_returns.monthly.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Lock Period</p>
                            <p className="font-semibold text-primary">
                              ${projectedReturns.projected_returns.lock_period.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Total Value</p>
                            <p className="font-semibold text-primary">
                              ${projectedReturns.total_at_end.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invest Button */}
                    <Button
                      className="w-full rounded-full py-6 text-lg"
                      onClick={handleInvest}
                      disabled={checkoutLoading}
                      data-testid="invest-btn"
                    >
                      {checkoutLoading ? (
                        'Processing...'
                      ) : user ? (
                        <>
                          <DollarSign className="h-5 w-5 mr-2" />
                          Invest ${investmentAmount.toLocaleString()}
                        </>
                      ) : (
                        'Sign In to Invest'
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By investing, you agree to our Terms of Service
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Select a plan to see projections
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SegmentDetailPage;
