// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
  });
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan === "premium" ? "premium" : "free";

    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: session.status,
          plan,
        },
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    // Sync status, plan, cancel_at_period_end, etc.
  }

  return new Response("OK", { status: 200 });
}
