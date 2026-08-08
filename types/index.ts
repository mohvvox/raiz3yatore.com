export interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  referral_code: string | null;
  referred_by: string | null;
  is_banned: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}
