import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import type { UserRole, Address, GeoPoint, NotificationPreferences } from '../../common/types';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, enum: ['customer', 'craftsman', 'moderator', 'admin', 'superadmin'] })
  role: UserRole;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  emailVerifiedAt?: Date;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ required: true, enum: ['en', 'ar'], default: 'en' })
  language: string;

  @Prop({ type: [{ type: Object }] })
  addresses?: Address[];

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
  })
  location?: GeoPoint;

  @Prop({
    type: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    default: { email: true, sms: false, push: true },
  })
  notificationPrefs: NotificationPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create 2dsphere index for location-based queries
UserSchema.index({ location: '2dsphere' });
// Create index for email lookups
UserSchema.index({ email: 1 }, { unique: true });
// Create index for role-based queries
UserSchema.index({ role: 1 });