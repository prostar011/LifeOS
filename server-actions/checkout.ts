// server-actions/checkout.ts
"use server";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function createCheckoutSession(plan: "free" | "premium") {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  if (!stripe) throw new Error("Stripe is not configured");

  // Ensure Stripe customer
  let customerId = user.stripeCustomerId ?? undefined;
  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (dbUser && !dbUser.stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await db.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId =
    plan === "premium"
      ? process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY
      : process.env.STRIPE_PRICE_ID_FREE;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    metadata: { userId: user.id, plan },
  });

  return session.url;
}
