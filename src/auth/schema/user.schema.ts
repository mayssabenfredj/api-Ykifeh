import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop()
  fullName: string;

  @Prop({ unique: [true, 'Duplicate email entered'] })
  email: string;

  @Prop()
  password: string;

  @Prop()
  photoProfile: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  adress: string;
  
  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isActive: Boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
