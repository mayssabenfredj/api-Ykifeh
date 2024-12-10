import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/************Extract Token ***** */
export const extractToken = (authorization: string) => {
  if (!authorization) {
    throw new Error('Authorization header is missing.');
  }
  const parts = authorization.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid authorization format. Expected "Bearer <token>".');
  }

  return parts[1];
};

export const validateToken = async (jwtService: JwtService, cookie: string) => {
  const tokenData = jwtService.decode(cookie) as {
    id: string;
    exp: number;
  };
  if (!tokenData || Date.now() >= tokenData.exp * 1000) {
    throw new BadRequestException('Token has expired. You must connect again.');
  }
  return jwtService.verifyAsync(cookie);
};

/********* encrypt and decrypt password ******* */
export const hashPassword = async (password: string) => {
  const saltOrRounds = 10;
  return await bcrypt.hash(password, saltOrRounds);
};

export const comparePassword = async (arg: {
  password: string;
  hash: string;
}) => {
  return await bcrypt.compare(arg.password, arg.hash);
};

/**********Generate Token ******** */
export const generateToken = async (jwtService: JwtService, user: any) => {
  const payload = { userId: user.id, email: user.email };
  return jwtService.sign(payload);
};

/******Verfiy Admin */ /////
export const verifyAdmin = async (jwtService: JwtService, token: string) => {
  if (!token) {
    throw new UnauthorizedException('You are not logged in');
  }

  const data = await jwtService.verifyAsync(token);
  if (!data) {
    throw new UnauthorizedException();
  }
  return data;
};
