import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';
import { Transaction } from './schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<Wallet>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly notificationsService: NotificationsService,
    private readonly jobsService: JobsService,
  ) {}

  async createWallet(ownerType: 'user' | 'craftsman', ownerId: string) {
    const wallet = new this.walletModel({
      ownerType,
      ownerId,
      balanceCents: 0,
      currency: 'EGP',
    });
    return wallet.save();
  }

  async getWallet(walletId: string) {
    const wallet = await this.walletModel.findById(walletId).exec();
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async getWalletByOwner(ownerType: 'user' | 'craftsman', ownerId: string) {
    return this.walletModel
      .findOne({ ownerType, ownerId })
      .exec();
  }

  async handlePaymobTopup(data: {
    userId: string;
    amountCents: number;
    paymobRef: string;
    orderId: string;
  }) {
    const wallet = await this.getWalletByOwner('user', data.userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Create topup transaction
    const transaction = await this.transactionModel.create({
      walletId: wallet._id,
      type: 'topup',
      amountCents: data.amountCents,
      currency: 'EGP',
      related: {
        paymobRef: data.paymobRef,
        orderId: data.orderId,
      },
      status: 'succeeded',
      direction: 'in',
    });

    // Update wallet balance
    await this.walletModel.findByIdAndUpdate(wallet._id, {
      $inc: { balanceCents: data.amountCents },
    });

    // Send notification
    await this.notificationsService.create({
      userId: data.userId,
      type: 'wallet_topup',
      title: 'Wallet Top-up Successful',
      body: `Your wallet has been topped up with ${data.amountCents / 100} EGP`,
      data: { transactionId: transaction._id },
    });

    return transaction;
  }

  async placeHold(data: {
    walletId: string;
    amountCents: number;
    appointmentId: string;
  }) {
    const wallet = await this.getWallet(data.walletId);

    // Check sufficient balance
    if (wallet.balanceCents < data.amountCents) {
      throw new Error('Insufficient balance');
    }

    // Create hold transaction
    const transaction = await this.transactionModel.create({
      walletId: wallet._id,
      type: 'hold',
      amountCents: data.amountCents,
      currency: 'EGP',
      related: {
        appointmentId: data.appointmentId,
      },
      status: 'succeeded',
      direction: 'out',
    });

    // Update wallet balance
    await this.walletModel.findByIdAndUpdate(wallet._id, {
      $inc: { balanceCents: -data.amountCents },
    });

    return transaction;
  }

  async releaseHold(holdTransactionId: string) {
    const holdTransaction = await this.transactionModel.findById(holdTransactionId);
    if (!holdTransaction || holdTransaction.type !== 'hold') {
      throw new Error('Invalid hold transaction');
    }

    // Create release transaction
    const transaction = await this.transactionModel.create({
      walletId: holdTransaction.walletId,
      type: 'release',
      amountCents: holdTransaction.amountCents,
      currency: holdTransaction.currency,
      related: {
        holdTransactionId: holdTransaction._id,
        appointmentId: holdTransaction.related?.appointmentId,
      },
      status: 'succeeded',
      direction: 'in',
    });

    // Update wallet balance
    await this.walletModel.findByIdAndUpdate(holdTransaction.walletId, {
      $inc: { balanceCents: holdTransaction.amountCents },
    });

    return transaction;
  }

  async getTransactions(walletId: string, limit = 20, before?: Date) {
    const query = { walletId };
    if (before) {
      query['createdAt'] = { $lt: before };
    }

    return this.transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getBalance(walletId: string): Promise<number> {
    const wallet = await this.getWallet(walletId);
    return wallet.balanceCents;
  }
}
