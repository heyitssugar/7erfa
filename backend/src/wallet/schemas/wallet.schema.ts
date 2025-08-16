import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ required: true, enum: ['user', 'craftsman'] })
  ownerType: 'user' | 'craftsman';

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  balanceCents: number;

  @Prop({ required: true, default: 'EGP' })
  currency: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Create compound index for owner lookups
WalletSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true });
