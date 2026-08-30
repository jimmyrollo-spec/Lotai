import type { AustinGarageRuleFact } from "@/lib/rules/evaluate-austin-garage";
import styles from "./LiveAnalysisStatus.module.css";

type Props = {
  facts: AustinGarageRuleFact[];
  hasProjectDetails: boolean;
};

const remainingChecks = [
  "Resolve exact garage placement against the front lot line and existing façade geometry",
  "Calculate existing + proposed building and impervious cover from clipped site geometry",
  "Resolve easements and other mapped overlays where reliable",
  "Complete the project-specific building and trade-permit path",
];

export function LiveAnalysisStatus({ facts, hasProjectDetails }: Props) {
  const resolved = facts.filter((fact) => fact.tone === "positive").length;
  const review = facts.filter((fact) => fact.tone === "warning").length;
  const unresolved = facts.filter((fact) => fact.tone === "neutral").length;

  return (
    <article className={styles.card}>
      <div className={styles.verdict}>
        <span className={styles.kicker}>Source-backed beta</span>
        <div className={styles.statusLine}>
          <span className={styles.orb} aria-hidden="true" />
          <h2>{hasProjectDetails ? "Verdict withheld" : "Project details needed"}</h2>
        </div>
        <p>
          {hasProjectDetails
            ? "We have enough verified Austin data to resolve several material facts, but not enough to responsibly label this project feasible or infeasible yet. The unresolved checks remain explicit below."
            : "The property is matched to official Austin data. Add the proposed garage dimensions and use so the verified project rules can be applied."}
        </p>
      </div>

      <div className={styles.summary}>
        <div className={styles.metrics}>
          <div><strong>{resolved}</strong><span>supported facts</span></div>
          <div><strong>{review}</strong><span>review flags</span></div>
          <div><strong>{unresolved}</strong><span>unresolved facts</span></div>
        </div>
        <div className={styles.remaining}>
          <span>Before an overall verdict</span>
          <ul>
            {remainingChecks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </div>
      </div>
    </article>
  );
}
