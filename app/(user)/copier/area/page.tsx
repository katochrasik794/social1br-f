"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/user/PageContainer";
import CopierProgressSection from "@/components/copier/area/CopierProgressSection";
import CopierAccountMetricsRow from "@/components/copier/area/CopierAccountMetricsRow";
import CopierSummaryHistoryPanel from "@/components/copier/area/CopierSummaryHistoryPanel";
import { copierSettings } from "@/lib/mock/copier";
import {
  mockCopierAccount,
  mockCopierMasters,
  type CopierMasterHistoryEntry,
} from "@/lib/mock/copierArea";

export default function CopierAreaPage() {
  const [selected, setSelected] = useState<CopierMasterHistoryEntry>(mockCopierMasters[0]);

  if (!copierSettings.enableCopier) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center shadow-md">
          <p className="text-lg font-bold text-[var(--app-text-primary)]">Copier is currently disabled</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex min-h-[calc(100dvh-10rem)] flex-col gap-5 sm:gap-6">
        <CopierAccountMetricsRow account={mockCopierAccount} />
        <CopierProgressSection masters={mockCopierMasters} selected={selected} onSelect={setSelected} />
        <CopierSummaryHistoryPanel masterId={selected.masterId} />
      </div>
    </PageContainer>
  );
}
