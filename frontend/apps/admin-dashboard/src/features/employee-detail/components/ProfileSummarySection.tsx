import React from 'react';
import type { Employee } from '../../employees/types';
import { EMPTY_VALUE } from '../constants';
import EmptyValueDash from './EmptyValueDash';
import SummaryInfoItem from './SummaryInfoItem';

interface ProfileSummarySectionProps {
  employee: Employee;
  fullName: string;
  roleValue: string;
  jobTitleValue: string;
  contactPhone: string;
  contactEmail: string;
  addressValue: string;
  departmentValue: string;
  workTypeValue: string;
  directManagerValue: string;
}

const ProfileSummarySection: React.FC<ProfileSummarySectionProps> = ({
  employee,
  fullName,
  roleValue,
  jobTitleValue,
  contactPhone,
  contactEmail,
  addressValue,
  departmentValue,
  workTypeValue,
  directManagerValue,
}) => {
  const avatarInitials = (employee.fullName || fullName || 'NV')
    .split(' ')
    .slice(-2)
    .map((part) => part.charAt(0))
    .join('');

  return (
    <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_252px]">
      <div className="rounded-[28px] border border-slate-200 bg-white px-7 py-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative mx-auto md:mx-0">
            <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#a8b7dd_0%,#aebde0_100%)]">
              {employee.avatar ? (
                <img src={employee.avatar} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[48px] font-light uppercase tracking-tight text-white">
                  {avatarInitials}
                </span>
              )}
            </div>

            <span className="absolute bottom-0 right-0 flex h-9 w-9 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[32px] font-bold leading-tight text-slate-950">{fullName}</h2>

            {roleValue === EMPTY_VALUE ? (
              <p className="mt-1 text-sm font-[14px] text-slate-300">Vai trò: <EmptyValueDash className="mt-1 text-lg" /></p>
              
            ) : (
              <p className="mt-1 text-lg text-slate-500">{roleValue}</p>
            )}
            {jobTitleValue === EMPTY_VALUE ? (
              <p className="mt-1 text-sm font-[14px] text-slate-300">Chức vụ: <EmptyValueDash className="mt-1 text-lg" /></p>
            ) : (
              <p className="mt-1 text-sm font-[14px] text-slate-400">Chức vụ: {jobTitleValue}</p>
            )}

            <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
              <SummaryInfoItem
                icon="call"
                value={contactPhone}
                emptyLabel="Số điện thoại"
                emptyState="dash"
              />
              <SummaryInfoItem
                icon="location_on"
                value={addressValue}
                emptyLabel="Địa chỉ"
                emptyState="dash"
              />
              <SummaryInfoItem
                icon="mail"
                value={contactEmail}
                emptyLabel="Email"
                emptyState="dash"
              />
              <SummaryInfoItem
                icon="groups"
                value={departmentValue}
                emptyLabel="Phòng ban"
                emptyState="dash"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="space-y-6">
          <div>
            <p className="text-[14px] font-medium text-slate-500">Hình thức làm việc</p>
            {workTypeValue === EMPTY_VALUE ? (
              <EmptyValueDash className="mt-2 text-[13px]" />
            ) : (
              <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-950">{workTypeValue}</p>
            )}
          </div>

          <div>
            <p className="text-[14px] font-medium text-slate-500">Người quản lý trực tiếp</p>
            {directManagerValue === EMPTY_VALUE ? (
              <EmptyValueDash className="mt-2 text-[13px]" />
            ) : (
              <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-950">
                {directManagerValue}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSummarySection;
