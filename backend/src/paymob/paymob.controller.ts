import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { WalletService } from '../wallet/wallet.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';

@Controller('paymob')
export class PaymobController {
  private readonly logger = new Logger(PaymobController.name);

  constructor(
    private readonly paymobService: PaymobService,
    private readonly walletService: WalletService,
  ) {}

  @Post('create-payment-order')
  async createPaymentOrder(@Body() dto: CreatePaymentOrderDto) {
    return this.paymobService.createPaymentOrder(dto);
  }

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('hmac') hmacHeader: string,
  ) {
    // Verify webhook signature
    if (!this.paymobService.verifyWebhookSignature(payload, hmacHeader)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    try {
      const {
        success,
        transactionId,
        orderId,
        amountCents,
      } = await this.paymobService.processWebhook(payload);

      if (success) {
        // Create wallet transaction
        await this.walletService.handlePaymobTopup({
          userId: payload.obj.user_id,
          amountCents,
          paymobRef: transactionId,
          orderId,
        });

        return { status: 'success' };
      }

      this.logger.warn(`Failed payment: ${transactionId}`);
      return { status: 'failed' };
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`);
      throw error;
    }
  }
}
