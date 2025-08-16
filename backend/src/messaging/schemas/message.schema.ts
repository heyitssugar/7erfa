import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  senderId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  body: string;

  @Prop([String])
  attachments?: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  readBy: MongooseSchema.Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Create index for conversation lookup
MessageSchema.index({ conversationId: 1 });
// Create index for chronological sorting
MessageSchema.index({ createdAt: -1 });
