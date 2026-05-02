import React from 'react';
import { Settings, Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
          <Settings className="w-12 h-12 text-primary absolute animate-[spin_4s_linear_infinite]" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          We'll be right back
        </h1>

        <p className="text-xl text-muted-foreground">
          Our site is currently undergoing scheduled maintenance to improve your experience. Please check back soon.
        </p>

        <div className="pt-8">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            Refresh Page <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
