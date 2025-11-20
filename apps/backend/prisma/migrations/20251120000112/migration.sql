-- CreateTable
CREATE TABLE "trade" (
    "id" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "pairKey" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "initialArbitrage" DOUBLE PRECISION NOT NULL,
    "finalArbitrage" DOUBLE PRECISION,
    "entryPriceA" DOUBLE PRECISION NOT NULL,
    "entryPriceB" DOUBLE PRECISION NOT NULL,
    "finalPriceA" DOUBLE PRECISION,
    "finalPriceB" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kucoin_credentials" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "passphrase" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kucoin_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kucoin_credentials_userId_key" ON "kucoin_credentials"("userId");

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kucoin_credentials" ADD CONSTRAINT "kucoin_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
