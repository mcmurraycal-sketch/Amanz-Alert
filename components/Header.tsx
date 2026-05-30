import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-ink text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="w-7 h-7 rounded-full bg-amanzi-500 grid place-items-center text-sm">
            💧
          </span>
          Amanz&apos; Alert
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-amanzi-300">Map</Link>
          <Link href="/report" className="hover:text-amanzi-300">Report</Link>
          <Link href="/about" className="hover:text-amanzi-300 hidden sm:inline">About</Link>
        </nav>
      </div>
    </header>
  );
}
