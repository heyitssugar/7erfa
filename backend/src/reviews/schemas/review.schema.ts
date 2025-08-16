import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment', required: true })
  appointmentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  craftsmanId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({
    type: {
      text: String,
      at: Date,
    },
  })
  reply?: {
    text: string;
    at: Date;
  };
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Create index for craftsman lookups
ReviewSchema.index({ craftsmanId: 1 });
// Create index for rating-based sorting
ReviewSchema.index({ rating: -1 });
// Create index for chronological sorting
ReviewSchema.index({ createdAt: -1 });
