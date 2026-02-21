import { getSanctionsList, getChangelog, getMeta } from "@/lib/data";
import SanctionsApp from "@/components/SanctionsApp";

export default function Home() {
  const entries = getSanctionsList();
  const changelog = getChangelog();
  const meta = getMeta();

  return (
    <SanctionsApp
      entries={entries}
      changelog={changelog}
      meta={meta}
    />
  );
}
