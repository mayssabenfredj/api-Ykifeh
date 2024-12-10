import { Request } from 'express';
import { User } from '../auth/schema/user.schema';

export interface CustomRequest extends Request {
  user?: User;
}
