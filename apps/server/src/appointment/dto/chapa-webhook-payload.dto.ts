export class chapaWebhookPayload {
  event: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  mobile: string;
  currency: string;
  amount: number | string;
  charge: number | string;
  status: string;
  mode: string;
  reference: string;
  created_at: string;
  updated_at: string;
  type: string;
  tx_ref: string;
  payment_method: string;
  customization: {
    title: string | null;
    description: string | null;
    logo: string | null;
  };
  meta: {} | null;
}
