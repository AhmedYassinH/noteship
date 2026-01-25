import Stripe from "stripe";

export const createStripeClient = (apiKey: string): Stripe => new Stripe(apiKey);
