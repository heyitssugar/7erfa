import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({
    type: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
  })
  name: { en: string; ar: string };

  @Prop()
  icon: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  parentId?: MongooseSchema.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Create index for slug lookups
CategorySchema.index({ slug: 1 }, { unique: true });
