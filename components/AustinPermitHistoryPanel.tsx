import { PermitHistory } from "@/components/PermitHistory";
import { lookupAustinPermitHistory } from "@/lib/providers/austin-permits";

export async function AustinPermitHistoryPanel({ tcadId }: { tcadId: string }) {
  const history = await lookupAustinPermitHistory(tcadId, 12).catch(() => null);
  if (!history) return null;
  return <PermitHistory history={history} />;
}
