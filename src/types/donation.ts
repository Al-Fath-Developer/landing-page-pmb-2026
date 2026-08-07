/**
 * @file    src/types/donation.ts
 * @brief   TypeScript interface mappings for donation states, API payloads, and gateway integrations
 * @author  ray
 * @created 2026-08-07
 * @todo    - Coordinate schema boundaries with generated database model definitions
 */

export type DonationStatus = "pending" | "paid" | "expired" | "failed";

export interface DonorRecord {
  id: string;
  name: string;
  message?: string;
  amountText: string;
  date: string;
}

export interface DonationCreateInput {
  donorName: string;
  donorEmail?: string;
  amount: number;
  message?: string;
  showPublicName: boolean;
  showPublicMessage: boolean;
}

export interface DonationResponse {
  orderId: string;
  amount: number;
  qrisUrl: string;
  qrisString: string;
  expiresAt: string;
}

export interface DonationStatusResponse {
  orderId: string;
  status: DonationStatus;
  expiresAt: string;
  paidAt: string | null;
}

export interface MidtransAction {
  name: string;
  method: string;
  url: string;
  qr_string?: string;
}

export interface MidtransQRISResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  actions: MidtransAction[];
}

export interface MidtransNotificationPayload {
  transaction_time: string;
  transaction_status: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  transaction_id: string;
  fraud_status?: string;
  settlement_time?: string;
  merchant_id?: string;
}
