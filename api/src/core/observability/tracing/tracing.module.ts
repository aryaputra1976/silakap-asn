import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createTracingSDK } from './tracing.sdk';
import type { NodeSDK } from '@opentelemetry/sdk-node';

@Module({})
export class TracingModule implements OnModuleInit, OnModuleDestroy {
  private sdk: NodeSDK | null = null;

  async onModuleInit() {
    this.sdk = await createTracingSDK(); // ⭐ FIX: tunggu Promise
    await this.sdk.start();
    console.log('📡 OpenTelemetry tracing started');
  }

  async onModuleDestroy() {
    if (this.sdk) {
      await this.sdk.shutdown();
      console.log('📡 OpenTelemetry tracing stopped');
    }
  }
}
