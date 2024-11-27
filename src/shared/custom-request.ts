import { Request } from 'express';
import { User } from 'src/auth/schema/user.schema';

export interface CustomRequest extends Request {
  user?: User; // Propriété user optionnelle
}
