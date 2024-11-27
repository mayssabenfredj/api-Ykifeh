import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Review extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  placeId: string;

  @Prop()
  comment: string;

  @Prop({ required: true })
  rating: number; 
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
