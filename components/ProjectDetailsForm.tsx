"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProjectDetailsForm.module.css";

type Props = {
  address: string;
  project: string;
  initial?: {
    width?: string;
    depth?: string;
    height?: string;
    stories?: string;
    location?: string;
    plumbing?: string;
    intendedUse?: string;
  };
};

export function ProjectDetailsForm({ address, project, initial = {} }: Props) {
  const router = useRouter();
  const [width, setWidth] = useState(initial.width || "");
  const [depth, setDepth] = useState(initial.depth || "");
  const [height, setHeight] = useState(initial.height || "");
  const [stories, setStories] = useState(initial.stories || "1");
  const [location, setLocation] = useState(initial.location || "rear");
  const [plumbing, setPlumbing] = useState(initial.plumbing || "no");
  const [intendedUse, setIntendedUse] = useState(initial.intendedUse || "vehicle_storage");

  const area = useMemo(() => {
    const w = Number(width);
    const d = Number(depth);
    if (!Number.isFinite(w) || !Number.isFinite(d) || w <= 0 || d <= 0) return null;
    return Math.round(w * d);
  }, [width, depth]);

  if (project !== "garage") return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new URLSearchParams({
      address,
      project,
      width,
      depth,
      height,
      stories,
      location,
      plumbing,
      intendedUse,
    });
    router.push(`/analyze?${search.toString()}`);
  }

  return (
    <form className={styles.card} onSubmit={submit}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Project assumptions</span>
          <h2>Describe the detached garage you want to build.</h2>
        </div>
        <p>These inputs determine which rules can be applied. Nothing is assumed silently.</p>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Width · ft</span>
          <input inputMode="decimal" min="1" step="1" type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="24" />
        </label>
        <label className={styles.field}>
          <span>Depth · ft</span>
          <input inputMode="decimal" min="1" step="1" type="number" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="30" />
        </label>
        <label className={styles.field}>
          <span>Height · ft</span>
          <input inputMode="decimal" min="1" step="1" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="14" />
        </label>
        <label className={styles.field}>
          <span>Stories</span>
          <select value={stories} onChange={(e) => setStories(e.target.value)}>
            <option value="1">1 story</option>
            <option value="2">2 stories</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Placement</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="rear">Rear yard</option>
            <option value="side">Side yard</option>
            <option value="front">Front area</option>
            <option value="unsure">Not sure</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Intended use</span>
          <select value={intendedUse} onChange={(e) => setIntendedUse(e.target.value)}>
            <option value="vehicle_storage">Vehicle / equipment storage</option>
            <option value="workshop_storage">Workshop / storage</option>
            <option value="habitable">Living / habitable space planned</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Plumbing</span>
          <select value={plumbing} onChange={(e) => setPlumbing(e.target.value)}>
            <option value="no">No plumbing</option>
            <option value="yes">Plumbing planned</option>
            <option value="unsure">Not sure</option>
          </select>
        </label>
      </div>

      <div className={styles.footer}>
        <span className={styles.summary}>{area ? `${area.toLocaleString()} sq ft proposed footprint` : "Add width and depth to calculate footprint."}</span>
        <button className={styles.submit} type="submit">Apply project details →</button>
      </div>
    </form>
  );
}
