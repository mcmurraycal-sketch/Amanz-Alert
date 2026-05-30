import OutageMap from "@/components/Map";
import ReportCTA from "@/components/ReportCTA";

export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col">
      <OutageMap />
      <ReportCTA />
    </div>
  );
}
