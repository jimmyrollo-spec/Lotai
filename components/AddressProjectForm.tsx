"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { projectDefinitions, ProjectKey } from "@/lib/demo-data";

type Props = {
  compact?: boolean;
};

export function AddressProjectForm({ compact = false }: Props) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [project, setProject] = useState<ProjectKey>("garage");
  const selected = useMemo(
    () => projectDefinitions.find((item) => item.key === project) ?? projectDefinitions[0],
    [project],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanAddress = address.trim() || "Sample property";
    router.push(`/analyze?address=${encodeURIComponent(cleanAddress)}&project=${project}`);
  }

  return (
    <form className={`analysis-form ${compact ? "analysis-form--compact" : ""}`} onSubmit={submit}>
      <div className="analysis-form__row">
        <label className="field field--address">
          <span className="field__eyebrow">Property address</span>
          <span className="field__control-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="field__icon">
              <path d="M12 21s7-5.2 7-12A7 7 0 1 0 5 9c0 6.8 7 12 7 12Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter a U.S. property address"
              aria-label="Property address"
            />
          </span>
        </label>

        <label className="field field--project">
          <span className="field__eyebrow">What do you want to build?</span>
          <select value={project} onChange={(event) => setProject(event.target.value as ProjectKey)}>
            {projectDefinitions.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button className="button button--primary analysis-form__submit" type="submit">
          Check this property
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {!compact && (
        <div className="analysis-form__meta">
          <span className="analysis-form__selected">Example: {selected.example}</span>
          <span className="analysis-form__note">Prototype: live regulatory data is not connected yet.</span>
        </div>
      )}
    </form>
  );
}
