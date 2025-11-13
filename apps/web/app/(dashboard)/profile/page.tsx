"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { AppRouter } from "@repo/trpc/server/server";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type BinanceCredentialsOutput =
  RouterOutput["CredentialsRouter"]["getBinanceCredentials"];

export type OkxCredentialsOutput =
  RouterOutput["CredentialsRouter"]["getOkxCredentials"];

export default function Page() {
  const {
    data: binanceCredentials,
    isLoading,
    error,
  } = trpc.CredentialsRouter.getBinanceCredentials.useQuery<BinanceCredentialsOutput>(
    {}
  );
  const {
    data: okxCredentials,
    isLoading: isLoadingOkx,
    error: okxError,
  } = trpc.CredentialsRouter.getOkxCredentials.useQuery<OkxCredentialsOutput>(
    {}
  );
  const [binanceKey, setBinanceKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [okxKey, setOkxKey] = useState("");
  const [okxPassphrase, setOkxPassphrase] = useState("");
  const [okxSecret, setOkxSecret] = useState("");

  useEffect(() => {
    if (binanceCredentials) setBinanceKey(binanceCredentials.apiKey);
  }, [binanceCredentials]);
  useEffect(() => {
    if (okxCredentials) setOkxKey(okxCredentials.apiKey);
  }, [okxCredentials]);
  const handleBinanceSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/credentials/binance`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            exchange: "binance",
            apiKey: binanceKey,
            apiSecret: binanceSecret,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save Binance keys");
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleOkxSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/credentials/okx`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            exchange: "okx",
            apiKey: okxKey,
            passphrase: okxPassphrase,
            apiSecret: okxSecret,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save OKX keys");
    } catch (err: any) {
      console.log(err.message);
    }
  };

  if (error || okxError) return <div>Error</div>;

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="mt-4">API Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading ? (
          <>
            <div className="border p-4 rounded-xl">
              <Label htmlFor="binance-key" className="mb-2 ">
                Binance API Key
              </Label>
              <Input
                id="binance-key"
                value={binanceKey}
                onChange={(e) => setBinanceKey(e.target.value)}
                placeholder="Enter Binance API Key"
              />
              <Label htmlFor="binance-secret" className="my-2 mt-4">
                Binance API Secret
              </Label>
              <Input
                id="binance-secret"
                value={binanceSecret}
                onChange={(e) => setBinanceSecret(e.target.value)}
                placeholder="Enter Binance API Secret"
                type="password"
              />
            </div>
            <div className="w-full flex justify-end">
              <Button onClick={handleBinanceSave}>Save Binance API Keys</Button>
            </div>
          </>
        ) : null}
        {!isLoadingOkx ? (
          <>
            <div className="border p-4 rounded-xl">
              <Label htmlFor="okx-key" className="mb-2">
                OKX API Key
              </Label>
              <Input
                id="okx-key"
                value={okxKey}
                onChange={(e) => setOkxKey(e.target.value)}
                placeholder="Enter OKX API Key"
              />
              <Label htmlFor="okx-secret" className="my-2 mt-4">
                OKX API Passphrase
              </Label>
              <Input
                id="okx-passphrase"
                value={okxPassphrase}
                onChange={(e) => setOkxPassphrase(e.target.value)}
                placeholder="Enter OKX API Passphrase"
                type="password"
              />
              <Label htmlFor="okx-secret" className="my-2 mt-4">
                OKX API Secret
              </Label>
              <Input
                id="okx-secret"
                value={okxSecret}
                onChange={(e) => setOkxSecret(e.target.value)}
                placeholder="Enter OKX API Secret"
                type="password"
              />
            </div>
            <div className="w-full flex justify-end">
              <Button onClick={handleOkxSave}>Save Okx API Keys</Button>
            </div>
          </>
        ) : null}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
