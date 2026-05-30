import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-4">About Amanz&apos; Alert</h1>
      <p className="mb-4 text-ink/80">
        Across South Africa, water outages happen every day &mdash; sometimes for hours,
        sometimes for weeks. Communities are left guessing whether a tap will run, when service
        will return, and whether their neighbours are affected too.
      </p>
      <p className="mb-4 text-ink/80">
        Amanz&apos; Alert is a free, crowd-sourced map. Anyone can report an outage in seconds.
        Anyone can see, in real time, which areas have water and which don&apos;t. We&apos;re
        starting in the Eastern Cape and building toward national coverage.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-2">Why it matters</h2>
      <ul className="list-disc pl-6 space-y-2 text-ink/80">
        <li>Plan your day around real conditions, not rumours.</li>
        <li>Pressure municipalities with public, time-stamped data.</li>
        <li>Help neighbours know where to get water when their taps are dry.</li>
        <li>Build the first open dataset of South African water reliability.</li>
      </ul>
      <p className="mt-8">
        <Link href="/" className="text-amanzi-600 underline">
          &larr; Back to the map
        </Link>
      </p>
    </div>
  );
}
