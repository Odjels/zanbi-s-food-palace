// src/transaction/guards/webhook.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaystackWebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-paystack-signature'];
    const payload = request.body;

    if (!signature) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new UnauthorizedException('Paystack secret key not configured');
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}

@Injectable()
export class FlutterwaveWebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['verif-hash'];

    if (!signature) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const secretHash = this.configService.get<string>('FLUTTERWAVE_SECRET_HASH');
    if (!secretHash) {
      throw new UnauthorizedException('Flutterwave secret hash not configured');
    }

    if (signature !== secretHash) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
