import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import WalletModal from '../components/WalletModal';
import {
  TrendingUp, DollarSign, Leaf, Zap, PiggyBank, ArrowUpRight,
  Clock, Wallet, ChevronRight, Sun, Battery, Server
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const { user } = useAuth();
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, investmentsRes] = await Promise.all([
          fetch(`${API_URL}/api/portfolio/stats`, { credentials: 'include' }),
          fetch(`${API_URL}/api/investments`, { credentials: 'include' }),
        ]);

        if (statsRes.ok) {
          const statsResult = await statsRes.json();
          const statsData = statsResult.data || statsResult;
          setStats(statsData);
        }

        if (investmentsRes.ok) {
          const investmentsResult = await investmentsRes.json();
          const investmentsData = investmentsResult.data || investmentsResult;
          setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSegmentIcon = (segmentId) => {
    const icons = {
      'data-centers': Server,
      'battery-storage': Battery,
      'ev-charging': Zap,
      'renewable-energy': Sun,
      'green-credits': Leaf,
    };
    const Icon = icons[segmentId] || Leaf;
    return <Icon className="h-4 w-4" />;
  };

  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 dark bg-background" data-testid="dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Outfit']">
              Welcome back, {user?.name?.split(' ')[0] || 'Investor'}
            </h1>
            <p className="text-muted-foreground">
              Track your sustainable investments and impact
            </p>
          </div>
          <div className="flex gap-3">
            {!connected ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setWalletModalOpen(true)}
                data-testid="connect-wallet-dashboard"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <Button variant="outline" className="gap-2" disabled>
                <Wallet className="h-4 w-4" />
                {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
              </Button>
            )}
            <Button onClick={() => navigate('/segments')} data-testid="new-investment-btn">
              New Investment
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50" data-testid="stat-portfolio-value">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.5%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold">${stats?.portfolio_value?.toLocaleString() || '0'}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50" data-testid="stat-total-invested">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <PiggyBank className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
              <p className="text-3xl font-bold">${stats?.total_invested?.toLocaleString() || '0'}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50" data-testid="stat-rewards">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
              <p className="text-3xl font-bold text-green-500">
                +${stats?.total_rewards?.toFixed(2) || '0'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50" data-testid="stat-investments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Investments</p>
              <p className="text-3xl font-bold">{stats?.active_investments_count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Metrics */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20" data-testid="impact-metrics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-['Outfit']">
              <Leaf className="h-5 w-5 text-primary" />
              Your Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {stats?.impact_metrics?.co2_offset_kg?.toFixed(1) || '0'}
                </p>
                <p className="text-sm text-muted-foreground">kg CO₂ Offset</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {stats?.impact_metrics?.kwh_generated?.toFixed(1) || '0'}
                </p>
                <p className="text-sm text-muted-foreground">kWh Generated</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {stats?.impact_metrics?.trees_equivalent?.toFixed(1) || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Trees Equivalent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Investments */}
        <Card data-testid="active-investments-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-['Outfit']">Active Investments</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/segments')}>
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div
                    key={investment.investment_id}
                    className="p-4 rounded-xl bg-muted/50 border border-border/50"
                    data-testid={`investment-${investment.investment_id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getSegmentIcon(investment.segment_id)}
                        </div>
                        <div>
                          <p className="font-semibold">{investment.plan_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p className="text-sm text-muted-foreground">
                            {investment.segment_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${investment.amount.toLocaleString()}</p>
                        <p className="text-sm text-green-500">{investment.apy}% APY</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{calculateDaysRemaining(investment.end_date)} days remaining</span>
                      </div>
                      <Progress
                        value={calculateProgress(investment.start_date, investment.end_date)}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                  <PiggyBank className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No investments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start investing in sustainable infrastructure today
                </p>
                <Button onClick={() => navigate('/segments')} data-testid="start-investing-btn">
                  Explore Segments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
};

export default Dashboard;
