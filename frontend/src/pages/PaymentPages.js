import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const hasPolled = useRef(false);

  useEffect(() => {
    if (hasPolled.current) return;
    hasPolled.current = true;

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('failed');
      return;
    }

    const pollPaymentStatus = async (attempts = 0) => {
      const maxAttempts = 5;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        setStatus('failed');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/payments/status/${sessionId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();

        if (data.payment_status === 'paid') {
          setStatus('success');
          setPaymentData(data);
          return;
        } else if (data.status === 'expired') {
          setStatus('failed');
          return;
        }

        // Continue polling
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      }
    };

    pollPaymentStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center hero-gradient">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          {status === 'checking' && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold mb-2 font-['Outfit']">Processing Payment</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 font-['Outfit']">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Your investment has been processed successfully. You can track it in your dashboard.
              </p>
              {paymentData && (
                <div className="p-4 rounded-xl bg-muted/50 mb-6">
                  <p className="text-sm text-muted-foreground">Amount Invested</p>
                  <p className="text-2xl font-bold">
                    ${(paymentData.amount_total / 100).toLocaleString()}
                  </p>
                </div>
              )}
              <Button
                className="w-full rounded-full"
                onClick={() => navigate('/dashboard')}
                data-testid="go-to-dashboard-btn"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto mb-6">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 font-['Outfit']">Payment Failed</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't process your payment. Please try again or contact support.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full rounded-full"
                  onClick={() => navigate('/segments')}
                  data-testid="try-again-btn"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center hero-gradient">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          <div className="p-4 rounded-full bg-yellow-500/10 w-fit mx-auto mb-6">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 font-['Outfit']">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            Your payment was cancelled. No charges were made.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full rounded-full"
              onClick={() => navigate('/segments')}
              data-testid="browse-segments-btn"
            >
              Browse Segments
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
