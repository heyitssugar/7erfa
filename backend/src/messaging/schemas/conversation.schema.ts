import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  participants: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true })
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Create index for participants lookup
ConversationSchema.index({ participants: 1 });
// Create index for sorting by last message
ConversationSchema.index({ lastMessageAt: -1 });
