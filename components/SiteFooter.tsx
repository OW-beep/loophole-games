import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-graphite dark:border-white/80 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between gap-4 text-sm">
        <p className="text-ink/60 dark:text-white/50">
          © {new Date().getFullYear()} Loophole. A new puzzle, every day.
        </p>
        <div className="flex gap-4">
          <Link href="/faq" className="hover:underline">
            FAQ
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
