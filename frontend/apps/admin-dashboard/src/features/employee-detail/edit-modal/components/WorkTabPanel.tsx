import React from 'react';
import type {
  AccessGroupMetadata,
  BranchMetadata,
  DepartmentMetadata,
  JobTitleMetadata,
  RegionMetadata,
} from '../../../../services/employee/types';
import type { EmployeeFullProfile } from '../../../../services/employee/types';
import SectionPlaceholder from './SectionPlaceholder';
import type { WorkFormMap, WorkTabKey } from '../types';
import JobStatusForm from '../forms/JobStatusForm';
import JobInfoForm from '../forms/JobInfoForm';
import PromotionHistoryForm from '../forms/PromotionHistoryForm';
import WorkHistoryForm from '../forms/WorkHistoryForm';
import SalaryAllowanceForm from '../forms/SalaryAllowanceForm';
import ContractForm from '../forms/ContractForm';
import InsuranceForm from '../forms/InsuranceForm';

interface WorkTabPanelProps {
  employeeId?: number;
  activeTab: WorkTabKey;
  data: WorkFormMap[WorkTabKey];
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
  metadata: {
    regions: RegionMetadata[];
    branches: BranchMetadata[];
    departments: DepartmentMetadata[];
    jobTitles: JobTitleMetadata[];
    accessGroups: AccessGroupMetadata[];
  };
  profile?: EmployeeFullProfile | null;
  onRefreshTab: (tab: WorkTabKey) => Promise<void>;
}

const WorkTabPanel: React.FC<WorkTabPanelProps> = ({
  employeeId,
  activeTab,
  data,
  errors,
  onFieldChange,
  metadata,
  profile,
  onRefreshTab,
}) => {
  switch (activeTab) {
    case 'jobStatus':
      return (
        <JobStatusForm
          data={data as WorkFormMap['jobStatus']}
          errors={errors}
          onFieldChange={onFieldChange as any}
        />
      );
    case 'jobInfo':
      return (
        <JobInfoForm
          employeeId={employeeId}
          data={data as WorkFormMap['jobInfo']}
          errors={errors}
          onFieldChange={onFieldChange as any}
          metadata={metadata}
        />
      );
    case 'promotionHistory':
      return (
        <PromotionHistoryForm
          data={data as WorkFormMap['promotionHistory']}
          errors={errors}
          onChange={(val) => onFieldChange('promotionHistory', val)}
        />
      );
    case 'workHistory':
      return (
        <WorkHistoryForm
          data={data as WorkFormMap['workHistory']}
          errors={errors}
          onChange={(val) => onFieldChange('workHistory', val)}
        />
      );
    case 'salaryAllowance':
      return (
        <SalaryAllowanceForm
          data={data as WorkFormMap['salaryAllowance']}
          onFieldChange={(field, val) => onFieldChange(field as any, val)}
        />
      );
    case 'contract':
      return (
        <ContractForm
          data={data as WorkFormMap['contract']}
          errors={errors}
          onRefresh={() => onRefreshTab('contract')}
          onChange={(val) => onFieldChange('contract', val)}
        />
      );
    case 'insurance':
      return (
        <InsuranceForm
          data={data as WorkFormMap['insurance']}
          errors={errors}
          profile={profile}
          onChange={(val) => onFieldChange('insurance', val)}
        />
      );
    default:
      return <SectionPlaceholder section="work" label="Công việc" icon="work" />;
  }
};

export default WorkTabPanel;
