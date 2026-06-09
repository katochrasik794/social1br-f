import Image from "next/image";
import { resolveAssetUrl } from "@/lib/api/gateways";
import type { ManualGateway } from "@/lib/api/gateways";

type Props = {
  gateway: ManualGateway;
  onSelect: () => void;
};

export default function PaymentMethodCard({ gateway, onSelect }: Props) {
  const icon = resolveAssetUrl(gateway.iconUrl) || "/deposit-icons/usdt.svg";
  const limits = `${gateway.minAmount.toLocaleString()} - ${gateway.maxAmount.toLocaleString()} ${gateway.limitsCurrency}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[180px] flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-left shadow-sm transition hover:border-[color:var(--app-primary-solid)] hover:shadow-md"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--app-surface-muted)]">
        <Image src={icon} alt="" width={32} height={32} className="h-8 w-8 object-contain" unoptimized />
      </div>
      <h3 className="text-base font-bold text-[var(--app-text-primary)]">{gateway.name}</h3>
      <div className="mt-3 space-y-1 text-xs font-semibold text-[var(--app-text-secondary)]">
        <p>Processing: {gateway.processingTimeText}</p>
        <p>Fee: {gateway.feeDisplay}</p>
        <p>Limits: {limits}</p>
      </div>
    </button>
  );
}
