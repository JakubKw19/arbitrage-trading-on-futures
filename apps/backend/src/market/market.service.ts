import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../main';
import {
  AddMarketPairToTrackingInput,
  UserTrackedMarketPairs,
} from './types/marketExchanges';

@Injectable()
export class MarketService {
  async addMarketPairToTracking(
    userId: string,
    data: AddMarketPairToTrackingInput,
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await prisma.trade.create({
        data: {
          userId,
          pairKey: data.pairKey,
          symbol: data.symbol,
          initialArbitrage: data.initialArbitrage,
          entryPriceA: data.entryPriceA,
          entryPriceB: data.entryPriceB,
        },
      });
    } catch (err) {
      throw new Error(
        'Failed to save trade: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  async getUserTrackedMarketPairs(
    userId: string,
  ): Promise<UserTrackedMarketPairs> {
    try {
      const res = await prisma.trade.findMany({
        where: { userId },
        select: {
          id: true,
          pairKey: true,
          symbol: true,
          isCompleted: true,
          initialArbitrage: true,
          finalArbitrage: true,
          entryPriceA: true,
          entryPriceB: true,
          finalPriceA: true,
          finalPriceB: true,
          createdAt: true,
          updatedAt: true,
          finalizedAt: true,
        },
      });
      console.log(res);
      return res;
    } catch (err) {
      throw new Error(
        'Failed to save trade: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  async removeMarketPairFromTracking(
    userId: string,
    tradeId: string,
  ): Promise<void> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });
    if (!trade || trade.userId !== userId) {
      throw new NotFoundException('Trade not found or access denied');
    }
    await prisma.trade.delete({
      where: { id: tradeId },
    });
  }
}
