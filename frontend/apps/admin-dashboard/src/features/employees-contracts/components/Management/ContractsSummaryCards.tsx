import React from 'react';
import type { ContractSummary } from '../../types';

interface ContractsSummaryCardsProps {
  summary: ContractSummary;
}

const CARD_CONFIG = [
  {
    key: 'effectiveCount',
    label: 'Hợp đồng đang hiệu lực',
    icon: 'verified',
    colorClassName: 'bg-emerald-500/10 text-emerald-700',
  },
  {
    key: 'pendingCount',
    label: 'Chờ ký',
    icon: 'edit_document',
    colorClassName: 'bg-cyan-500/10 text-cyan-700',
  },
  {
    key: 'expiredCount',
    label: 'Hết hạn',
    icon: 'timer_off',
    colorClassName: 'bg-rose-500/10 text-rose-700',
  },
] as const;

const ContractsSummaryCards: React.FC<ContractsSummaryCardsProps> = ({ summary }) => {
  return (
    <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
      {CARD_CONFIG.map((card) => (
        <article
          key={card.key}
          className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                {summary[card.key]}
              </p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.colorClassName}`}>
              <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default ContractsSummaryCards;
