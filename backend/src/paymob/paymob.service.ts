import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymobService {
  private readonly logger = new Logger(PaymobService.name);
  private readonly apiKey: string;
  private readonly hmacSecret: string;
  private readonly baseUrl = 'https://accept.paymob.com/api';
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PAYMOB_API_KEY');
    this.hmacSecret = this.configService.get<string>('PAYMOB_HMAC_SECRET');
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.apiKey,
      });

      this.authToken = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour
      return this.authToken;
    } catch (error) {
      this.logger.error(`Failed to get auth token: ${error.message}`);
      throw error;
    }
  }

  async createPaymentOrder(data: {
    amountCents: number;
    currency: string;
    userId: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userPhone?: string;
  }) {
    try {
      const token = await this.getAuthToken();

      // Create order
      const orderResponse = await axios.post(
        `${this.baseUrl}/ecommerce/orders`,
        {
          auth_token: token,
          delivery_needed: false,
          amount_cents: data.amountCents,
          currency: data.currency,
          items: [],
        },
      );

      // Create payment key
      const paymentKeyResponse = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: token,
          amount_cents: data.amountCents,
          expiration: 3600,
          order_id: orderResponse.data.id,
          billing_data: {
            email: data.userEmail,
            first_name: data.userFirstName,
            last_name: data.userLastName,
            phone_number: data.userPhone || '',
            apartment: 'NA',
            floor: 'NA',
            street: 'NA',
            building: 'NA',
            shipping_method: 'NA',
            postal_code: 'NA',
            city: 'NA',
            country: 'NA',
            state: 'NA',
          },
          currency: data.currency,
          integration_id: this.configService.get('PAYMOB_INTEGRATION_ID'),
          lock_order_when_paid: true,
        },
      );

      return {
        orderId: orderResponse.data.id,
        paymentKey: paymentKeyResponse.data.token,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment order: ${error.message}`);
      throw error;
    }
  }

  verifyWebhookSignature(
    payload: any,
    hmacHeader: string,
  ): boolean {
    const calculatedHmac = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return calculatedHmac === hmacHeader;
  }

  async processWebhook(payload: any): Promise<{
    success: boolean;
    transactionId: string;
    orderId: string;
    amountCents: number;
  }> {
    try {
      const { obj } = payload;
      const success = obj.success === true;
      const transactionId = obj.id.toString();
      const orderId = obj.order.id.toString();
      const amountCents = obj.amount_cents;

      return {
        success,
        transactionId,
        orderId,
        amountCents,
      };
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`);
      throw error;
    }
  }

  async createPayout(data: {
    amountCents: number;
    userId: string;
    bankAccount: {
      accountNumber: string;
      bankName: string;
      swiftCode: string;
    };
  }) {
    // Note: This is a placeholder for the payout API
    // Implement according to Paymob's payout API when available
    throw new Error('Payout API not implemented');
  }
}
