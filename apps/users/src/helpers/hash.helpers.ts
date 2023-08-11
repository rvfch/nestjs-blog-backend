import { InternalServerErrorException } from '@nestjs/common';
import argon2 from 'argon2';

export async function hash(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (e) {
    throw new InternalServerErrorException('Error hasing passowrd ' + e);
  }
}
