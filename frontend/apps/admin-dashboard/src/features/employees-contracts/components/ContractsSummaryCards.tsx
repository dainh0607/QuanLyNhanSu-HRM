import React from 'react';
import type { ContractSummary } from '../types';

interface ContractsSummaryCardsProps {
  summary: ContractSummary;
}

const CARD_CONFIG = [
  {
    key: 'effectiveCount',
    label: 'Hợp đồng đang hiệu lực',
    icon: 'verified',
    colorClassName: 'from-emerald-50 to-emerald-100/50 text-emerald-700 ring-emerald-200/50',
    iconBg: 'bg-emerald-500 text-white shadow-emerald-200',
  },
  {
    key: 'pendingCount',
    label: 'Chờ ký',
    icon: 'edit_document',
    colorClassName: 'from-blue-50 to-blue-100/50 text-blue-700 ring-blue-200/50',
    iconBg: 'bg-blue-600 text-white shadow-blue-200',
  },
  {
    key: 'expiredCount',
    label: 'Hết hạn',
    icon: 'timer_off',
    colorClassName: 'from-rose-50 to-rose-100/50 text-rose-700 ring-rose-200/50',
    iconBg: 'bg-rose-500 text-white shadow-rose-200',
  },
] as const;

const ContractsSummaryCards: React.FC<ContractsSummaryCardsProps> = ({ summary }) => {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {CARD_CONFIG.map((card) => (
        <article
          key={card.key}
          className={`group relative overflow-hidden rounded-[24px] border border-white bg-gradient-to-br ${card.colorClassName} p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]`}
        >
          <div className="flex items-center justify-between">
            <div className="relative z-10">
              <p className="text-[13px] font-bold uppercase tracking-wider opacity-80">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight">
                {summary[card.key]}
              </p>
            </div>
            <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${card.iconBg}`}>
              <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-all group-hover:scale-150" />
        </article>
      ))}
    </section>
  );
};

export default ContractsSummaryCards;

