"use client";

import { useState } from "react";
import { copierSettings } from "@/lib/mock/copier";

export default function CopierSettingsPage() {
  const [settings, setSettings] = useState(copierSettings);

  const toggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  return (
    <div className="mx-auto max-w-[2400px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Copier Settings</h1>
        <p className="text-sm text-[var(--app-text-secondary)]">Configure platform-wide copy trading rules</p>
      </div>

      {[
        { title: "Feature Flags", fields: [
          { key: "enableCopier" as const, label: "Enable Copier" },
          { key: "enableMasterApplications" as const, label: "Enable Master Applications" },
          { key: "forceKyc" as const, label: "Force KYC" },
          { key: "showOnDashboard" as const, label: "Show on Dashboard" },
        ]},
        { title: "Allocation Limits", fields: [
          { key: "minAllocation" as const, label: "Min Allocation ($)", type: "number" },
          { key: "maxAllocation" as const, label: "Max Allocation ($)", type: "number" },
        ]},
        { title: "Fees & Commission", fields: [
          { key: "platformFeePct" as const, label: "Platform Fee (%)", type: "number" },
        ]},
        { title: "Risk Controls", fields: [
          { key: "autoStopEquityDropPct" as const, label: "Auto-stop Equity Drop (%)", type: "number" },
          { key: "maxDrawdownAllowedPct" as const, label: "Max Drawdown Allowed (%)", type: "number" },
        ]},
      ].map((section) => (
        <section key={section.title} className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
          <h2 className="text-lg font-bold">{section.title}</h2>
          <div className="mt-4 space-y-4">
            {section.fields.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium">{field.label}</label>
                {"type" in field && field.type === "number" ? (
                  <input
                    type="number"
                    value={settings[field.key] as number}
                    onChange={(e) => setSettings({ ...settings, [field.key]: Number(e.target.value) })}
                    className="w-32 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-right"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(field.key)}
                    className={`relative h-6 w-11 rounded-full transition ${settings[field.key] ? "bg-[color:var(--app-primary-solid)]" : "bg-[var(--app-border)]"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${settings[field.key] ? "left-5" : "left-0.5"}`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <button type="button" className="rounded-md bg-[color:var(--app-primary-solid)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110">
        Save Settings
      </button>
    </div>
  );
}
