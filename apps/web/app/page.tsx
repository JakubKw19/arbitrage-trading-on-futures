import Image, { type ImageProps } from "next/image";
import { Button } from "./components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <section className="w-full h-screen mx-auto flex items-center justify-center flex-col">
      <div className="-mt-25 max-w-5xl">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Deals Finder
          </h2>
          <p className="mt-4">Arbitrage Trading on Futures</p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                <span>Sign In</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/login">
                <span>Sign Up</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
