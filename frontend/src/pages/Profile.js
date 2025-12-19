import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import WalletModal from '../components/WalletModal';
import { toast } from 'sonner';
import { User, Mail, Wallet, LogOut, Shield, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { connected, publicKey, disconnect } = useWallet();
  const navigate = useNavigate();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    if (connected) {
      await disconnect();
    }
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your profile</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 dark bg-background" data-testid="profile-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/dashboard')}
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8 font-['Outfit']">Profile Settings</h1>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-['Outfit']">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <Input
                  value={user.name || ''}
                  disabled
                  className="mt-1 bg-muted/50"
                  data-testid="profile-name"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={user.email || ''}
                    disabled
                    className="bg-muted/50"
                    data-testid="profile-email"
                  />
                  <div className="flex items-center gap-1 px-3 py-2 rounded-md bg-green-500/10 text-green-500 text-sm">
                    <Shield className="h-4 w-4" />
                    Verified
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <Input
                  value={user.user_id || ''}
                  disabled
                  className="mt-1 bg-muted/50 font-mono text-sm"
                  data-testid="profile-user-id"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-['Outfit']">
              <Wallet className="h-5 w-5" />
              Connected Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connected || user.wallet_address ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                  <p className="font-mono text-sm break-all">
                    {publicKey || user.wallet_address}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setWalletModalOpen(true)}
                    data-testid="change-wallet-btn"
                  >
                    Change Wallet
                  </Button>
                  {connected && (
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={disconnect}
                      data-testid="disconnect-wallet-profile"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No wallet connected</p>
                <Button onClick={() => setWalletModalOpen(true)} data-testid="connect-wallet-profile">
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-['Outfit']">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Google Authentication</p>
                  <p className="text-sm text-muted-foreground">Signed in with Google OAuth</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                Active
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-destructive">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out from your account on this device
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
                data-testid="logout-btn"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
};

export default Profile;
