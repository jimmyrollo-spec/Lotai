import type { AustinPermitHistory } from "@/lib/providers/austin-permits";
import styles from "./PermitHistory.module.css";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatMoney(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function compactDescription(value: string | null) {
  if (!value) return "No public description returned.";
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 260 ? `${compact.slice(0, 257)}…` : compact;
}

export function PermitHistory({ history }: { history: AustinPermitHistory }) {
  return (
    <article className={styles.card} aria-label="Austin permit history">
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Official permit history · TCAD matched</span>
          <h3>Issued construction permits linked to this parcel ID</h3>
          <p>Records are queried from Austin Development Services&apos; public issued-permits dataset using TCAD ID {history.tcadId}.</p>
        </div>
        <div className={styles.headerMeta}>
          <strong>{history.records.length}</strong>
          <span>recent record{history.records.length === 1 ? "" : "s"}</span>
          <a href={history.source.dataset} target="_blank" rel="noreferrer">Open dataset ↗</a>
        </div>
      </div>

      {history.records.length ? (
        <div className={styles.list}>
          {history.records.map((permit) => {
            const valuation = formatMoney(permit.jobValuation);
            return (
              <div className={styles.row} key={permit.permitNumber}>
                <div className={styles.identity}>
                  <span>{permit.permitType || permit.permitTypeCode || "Permit"}</span>
                  <strong>{permit.permitNumber}</strong>
                  <em>{formatDate(permit.issueDate)}</em>
                </div>
                <div className={styles.copy}>
                  <div className={styles.tags}>
                    {permit.status && <span>{permit.status}</span>}
                    {permit.workClass && <span>{permit.workClass}</span>}
                    {permit.permitClassMapped && <span>{permit.permitClassMapped}</span>}
                  </div>
                  <p>{compactDescription(permit.description)}</p>
                  <div className={styles.metrics}>
                    {permit.address && <span>Address: <strong>{permit.address}</strong></span>}
                    {permit.newAddSqFt !== null && <span>New/add area: <strong>{permit.newAddSqFt.toLocaleString()} sq ft</strong></span>}
                    {valuation && <span>Reported valuation: <strong>{valuation}</strong></span>}
                    {permit.completedDate && <span>Completed: <strong>{formatDate(permit.completedDate)}</strong></span>}
                  </div>
                </div>
                <div className={styles.action}>
                  {permit.officialLink ? (
                    <a href={permit.officialLink} target="_blank" rel="noreferrer">Official detail ↗</a>
                  ) : (
                    <span>No detail link</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <strong>No matching records returned by the current public dataset.</strong>
          <p>This is not proof that the property has no permit history. Older, differently indexed or otherwise unavailable records may require separate City verification.</p>
        </div>
      )}

      <div className={styles.footer}>
        <span>Source: City of Austin Development Services · Issued Construction Permits</span>
        <span>{history.source.updateFrequency} update frequency</span>
        <p>{history.disclaimer}</p>
      </div>
    </article>
  );
}
