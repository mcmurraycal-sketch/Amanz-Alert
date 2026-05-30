import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1">Report a water outage</h1>
      <p className="text-sm text-ink/70 mb-6">
        Takes 20 seconds. No account needed. Your report shows up on the map within a few seconds.
      </p>
      <ReportForm />
    </div>
  );
}
