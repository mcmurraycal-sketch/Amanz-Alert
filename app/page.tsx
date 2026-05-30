import Link from "next/link";
import OutageMap from "@/components/Map";

export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col">
      <OutageMap />
      <Link
        href="/report"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 bg-alert-500 hover:bg-alert-600 active:scale-95 transition text-white font-semibold rounded-full shadow-lg px-6 py-4 text-base flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        Report an outage near you
      </Link>
    </div>
  );
}
