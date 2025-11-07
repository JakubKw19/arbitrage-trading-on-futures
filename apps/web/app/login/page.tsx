"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  return (
    <div className="flex min-h-screen items-start justify-center md:items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              authClient.signIn.social({
                provider: "google",
                callbackURL: "http://localhost:3000/home",
              });
            }}
          >
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
