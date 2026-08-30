import type { AustinGarageRuleFact } from "@/lib/rules/evaluate-austin-garage";
import styles from "./LiveRuleFacts.module.css";

export function LiveRuleFacts({ facts }: { facts: AustinGarageRuleFact[] }) {
  if (!facts.length) return null;

  return (
    <article className={styles.card} aria-label="Live source-backed Austin rule facts">
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Live regulatory facts</span>
          <h3>Rules we can apply to the project inputs so far</h3>
        </div>
        <span className={styles.badge}>Source-backed beta</span>
      </div>

      <div className={styles.list}>
        {facts.map((fact) => (
          <div className={styles.row} key={fact.id}>
            <span className={`${styles.dot} ${styles[fact.tone]}`} aria-hidden="true" />
            <div className={styles.copy}>
              <strong>{fact.label}</strong>
              <p>{fact.explanation}</p>
            </div>
            <div className={styles.evidence}>
              <strong>{fact.value}</strong>
              <a href={fact.sourceUrl} target="_blank" rel="noreferrer">{fact.sourceLabel} ↗</a>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        These are individual regulatory facts, not a permit approval or complete feasibility verdict. Missing site constraints and unresolved rules remain open until explicitly checked.
      </div>
    </article>
  );
}
