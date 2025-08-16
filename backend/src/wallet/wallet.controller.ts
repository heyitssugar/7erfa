import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseDatePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { PaymobService } from '../paymob/paymob.service';
import { User } from '../common/decorators/user.decorator';
import { CreateTopupOrderDto } from './dto/create-topup-order.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymobService: PaymobService,
  ) {}

  @Get('balance')
  async getBalance(@User() user) {
    const wallet = await this.walletService.getWalletByOwner(
      user.role === 'craftsman' ? 'craftsman' : 'user',
      user.sub,
    );
    return { balance: wallet.balanceCents / 100 };
  }

  @Get('transactions')
  async getTransactions(
    @User() user,
    @Query('limit', ParseIntPipe) limit = 20,
    @Query('before', ParseDatePipe) before?: Date,
  ) {
    const wallet = await this.walletService.getWalletByOwner(
      user.role === 'craftsman' ? 'craftsman' : 'user',
      user.sub,
    );
    const transactions = await this.walletService.getTransactions(
      wallet._id,
      limit,
      before,
    );
    return transactions;
  }

  @Post('topup')
  async createTopupOrder(@User() user, @Body() dto: CreateTopupOrderDto) {
    return this.paymobService.createPaymentOrder({
      amountCents: dto.amountCents,
      currency: 'EGP',
      userId: user.sub,
      userEmail: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userPhone: user.phone,
    });
  }
}
