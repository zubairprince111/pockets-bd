import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/shared/Logo';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-headline font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Take Control of Your{' '}
                <span className="text-primary">Pockets</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                A simple, modern, and intuitive way for Bangladeshi Bachelors to track their monthly budget, daily expenses, and savings.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">View Demo</Link>
                </Button>
              </div>
            </div>
          </div>
          {heroImage && (
            <div className="mt-16 md:mt-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={1200}
                  height={600}
                  data-ai-hint={heroImage.imageHint}
                  className="rounded-lg shadow-2xl ring-1 ring-border"
                  priority
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="py-8 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pockets. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
