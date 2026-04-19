import * as crypto from 'crypto';

export class CryptoHelper {
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  static randomString(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
