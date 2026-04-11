import React from 'react';
import type {
  AccessGroupMetadata,
  BranchMetadata,
  DepartmentMetadata,
  JobTitleMetadata,
  RegionMetadata,
} from '../../../../services/employee/types';
import SectionPlaceholder from './SectionPlaceholder';
import type { WorkFormMap, WorkTabKey } from '../types';
import JobStatusForm from '../forms/JobStatusForm';
import JobInfoForm from '../forms/JobInfoForm';

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
}

const WorkTabPanel: React.FC<WorkTabPanelProps> = ({
  employeeId,
  activeTab,
  data,
  errors,
  onFieldChange,
  metadata,
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
    default:
      return <SectionPlaceholder section="work" label="Công việc" icon="work" />;
  }
};

export default WorkTabPanel;
