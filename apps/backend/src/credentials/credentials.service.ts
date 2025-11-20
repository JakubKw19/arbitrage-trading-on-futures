import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './encryption.service';
import { z } from 'zod';
import { prisma } from '../main';

export interface BinanceCredentialsInput {
  apiKey: string;
  apiSecret: string;
  isActive?: boolean;
}

export interface OkxCredentialsInput {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  isActive?: boolean;
}

export const BinanceCredentialsOutputSchema = z
  .object({
    id: z.string(),
    apiKey: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .nullable();

export const OkxCredentialsOutputSchema = z
  .object({
    id: z.string(),
    apiKey: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .nullable();

export type BinanceCredentialsOutput = z.infer<
  typeof BinanceCredentialsOutputSchema
>;
export type OkxCredentialsOutput = z.infer<typeof OkxCredentialsOutputSchema>;

@Injectable()
export class CredentialsService {
  constructor(private readonly encryptionService: EncryptionService) {}

  async getBinanceCredentials(
    userId: string,
  ): Promise<BinanceCredentialsOutput> {
    const credentials = await prisma.binanceCredentials.findUnique({
      where: { userId },
      select: {
        id: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!credentials) {
      return null;
    }
    return {
      ...credentials,
      apiKey: this.encryptionService.decrypt(credentials.apiKey),
    };
  }

  async upsertBinanceCredentials(
    userId: string,
    data: BinanceCredentialsInput,
  ): Promise<BinanceCredentialsOutput> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const credentials = await prisma.binanceCredentials.upsert({
      where: { userId },
      update: {
        apiKey: this.encryptionService.encrypt(data.apiKey),
        apiSecret: this.encryptionService.encrypt(data.apiSecret),
        isActive: data.isActive ?? true,
      },
      create: {
        userId,
        apiKey: this.encryptionService.encrypt(data.apiKey),
        apiSecret: this.encryptionService.encrypt(data.apiSecret),
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return credentials;
  }

  async deleteBinanceCredentials(userId: string) {
    const credentials = await prisma.binanceCredentials.findUnique({
      where: { userId },
    });

    if (!credentials) {
      throw new NotFoundException('Binance credentials not found');
    }

    await prisma.binanceCredentials.delete({
      where: { userId },
    });

    return { message: 'Binance credentials deleted successfully' };
  }

  async upsertOkxCredentials(
    userId: string,
    data: OkxCredentialsInput,
  ): Promise<OkxCredentialsOutput> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const credentials = await prisma.okxCredentials.upsert({
      where: { userId },
      update: {
        apiKey: this.encryptionService.encrypt(data.apiKey),
        apiSecret: this.encryptionService.encrypt(data.apiSecret),
        passphrase: this.encryptionService.encrypt(data.passphrase),
        isActive: data.isActive ?? true,
      },
      create: {
        userId,
        apiKey: this.encryptionService.encrypt(data.apiKey),
        apiSecret: this.encryptionService.encrypt(data.apiSecret),
        passphrase: this.encryptionService.encrypt(data.passphrase),
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return credentials;
  }

  async getOkxCredentials(userId: string): Promise<OkxCredentialsOutput> {
    const credentials = await prisma.okxCredentials.findUnique({
      where: { userId },
      select: {
        id: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!credentials) {
      return null;
    }
    return {
      ...credentials,
      apiKey: this.encryptionService.decrypt(credentials.apiKey),
    };
  }

  async deleteOkxCredentials(userId: string) {
    const credentials = await prisma.okxCredentials.findUnique({
      where: { userId },
    });

    if (!credentials) {
      throw new NotFoundException('OKX credentials not found');
    }

    await prisma.okxCredentials.delete({
      where: { userId },
    });

    return { message: 'OKX credentials deleted successfully' };
  }
}
