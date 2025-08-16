export type UserRole = 'customer' | 'craftsman' | 'moderator' | 'admin' | 'superadmin';

export interface Address {
  label: string;
  line1: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface UserDocument {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  walletId: string;
}

export type KycStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';

export type AppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'canceled'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'refunded';

export type TransactionType = 'topup' | 'hold' | 'capture' | 'release' | 'payout' | 'refund' | 'fee';
export type TransactionStatus = 'pending' | 'succeeded' | 'failed';
export type TransactionDirection = 'in' | 'out';