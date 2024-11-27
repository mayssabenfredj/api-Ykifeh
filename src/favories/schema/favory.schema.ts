import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Favory extends Document {
  @Prop()
  userId: string;

  @Prop()
  placeId: string;

}

export const FavorySchema = SchemaFactory.createForClass(Favory);
