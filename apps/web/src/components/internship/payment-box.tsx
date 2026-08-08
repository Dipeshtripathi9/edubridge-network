'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, IndianRupee, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { loadRazorpayScript, type RazorpayFailureResponse } from '@/lib/razorpay';
import { useCreateCheckoutOrder, useVerifyPayment, type TrackAEnrollment } from '@/hooks/use-internships';

export function PaymentBox({ enrollment }: { enrollment: TrackAEnrollment }) {
  const user = useAuthStore((s) => s.user);
  const [isOpening, setIsOpening] = useState(false);
  const createOrder = useCreateCheckoutOrder();
  const verifyPayment = useVerifyPayment();

  if (enrollment.status !== 'PENDING_PAYMENT') {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-green-soft text-green">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Payment confirmed</p>
            <p className="text-sm text-muted-foreground">
              ₹{enrollment.feeAmount.toLocaleString()} received
              {enrollment.paidAt && ` on ${new Date(enrollment.paidAt).toLocaleDateString()}`}.
            </p>
            {enrollment.mentorNote && <p className="mt-1 text-sm text-muted-foreground">{enrollment.mentorNote}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const onPay = async () => {
    setIsOpening(true);
    try {
      const [order, scriptReady] = await Promise.all([
        createOrder.mutateAsync(enrollment.id),
        loadRazorpayScript(),
      ]);
      if (!scriptReady || !window.Razorpay) {
        toast.error('Could not load Razorpay checkout — check your connection and try again');
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'EduBridge Network',
        description: 'Track A internship enrollment fee',
        prefill: { name: user?.profile?.fullName, email: user?.email ?? undefined },
        theme: { color: '#F2A31B' },
        handler: (response) => {
          verifyPayment.mutate(
            { id: enrollment.id, ...response },
            {
              onSuccess: () => toast.success('Payment verified — your internship is active!'),
              onError: (e) => toast.error((e as Error).message),
            },
          );
        },
        modal: {
          ondismiss: () => toast('Payment cancelled — you can try again anytime'),
        },
      });
      rzp.on('payment.failed', (response: RazorpayFailureResponse) => {
        toast.error(response.error.description || 'Payment failed — please try again');
      });
      rzp.open();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Card className="border-marigold/40 bg-marigold-soft/40">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-marigold text-white">
            <IndianRupee className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold">Complete your payment</p>
            <p className="text-sm text-muted-foreground">₹{enrollment.feeAmount.toLocaleString()} due</p>
          </div>
        </div>
        <Button disabled={isOpening} onClick={onPay} className="w-full sm:w-auto">
          {isOpening ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout…
            </>
          ) : (
            `Pay ₹${enrollment.feeAmount.toLocaleString()} with Razorpay`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
