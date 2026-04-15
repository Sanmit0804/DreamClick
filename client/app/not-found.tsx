import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-6xl font-extrabold">404</h1>
      <p className="text-muted-foreground text-lg">Page not found.</p>
      <Link href="/dashboard" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
        Go Home
      </Link>
    </div>
  );
}
