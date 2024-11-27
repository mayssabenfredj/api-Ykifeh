import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class WorkDays {
  @Prop({ required: true })
  for: string; 

  @Prop({ required: true })
  to: string; 
}

class WorkHours {
  @Prop({ required: true })
  start: string; 

  @Prop({ required: true })
  end: string; 
}

@Schema({
  timestamps: true,
})
export class Places extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  type: string[];

  @Prop()
  tags: string[];

  @Prop()
  description: string;

  @Prop()
  address: string;
    
  @Prop()
  photos: Array<string>;

  @Prop({ type: WorkDays, required: true })
  daysOfWork: WorkDays;

  @Prop()
  restDays: string[];

  @Prop({ type: WorkHours, required: true })
  hoursOfWork: WorkHours;

  @Prop()
  phone: string;

  @Prop()
  lienMap: string;

  @Prop({ default: false })
  isConfirmed: boolean;

  //  champ userId pour référencer l'utilisateur
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const PlacesSchema = SchemaFactory.createForClass(Places);
