"use client";

import { useState } from "react";
import { mamSettings } from "@/lib/mock/mam";

export default function MamSettingsPage() {
  const [settings, setSettings] = useState(mamSettings);

  return (
    <div className="mx-auto max-w-[2400px] space-y-6">
      <div><h1 className="text-2xl font-bold">MAM Settings</h1><p className="text-sm text-[var(--app-text-secondary)]">Configure MAM module settings</p></div>
      <section className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 space-y-4">
        {[
          { key: "enableMam" as const, label: "Enable MAM", type: "toggle" },
          { key: "defaultLotMultiplier" as const, label: "Default Lot Multiplier", type: "number" },
          { key: "maxLotMultiplier" as const, label: "Max Lot Multiplier", type: "number" },
          { key: "platformFeePct" as const, label: "Platform Fee (%)", type: "number" },
          { key: "minAccountBalance" as const, label: "Min Account Balance ($)", type: "number" },
          { key: "forceKyc" as const, label: "Force KYC", type: "toggle" },
        ].map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <label className="text-sm font-medium">{field.label}</label>
            {field.type === "toggle" ? (
              <button type="button" onClick={() => setSettings({ ...settings, [field.key]: !settings[field.key] })} className={`relative h-6 w-11 rounded-full ${settings[field.key] ? "bg-[color:var(--app-primary-solid)]" : "bg-[var(--app-border)]"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${settings[field.key] ? "left-5" : "left-0.5"}`} />
              </button>
            ) : (
              <input type="number" value={settings[field.key] as number} onChange={(e) => setSettings({ ...settings, [field.key]: Number(e.target.value) })} className="w-32 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-right" />
            )}
          </div>
        ))}
      </section>
      <button type="button" className="rounded-md bg-[color:var(--app-primary-solid)] px-6 py-2.5 text-sm font-semibold text-white">Save Settings</button>
    </div>
  );
}
