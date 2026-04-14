export type CleaningStatus = 'safe' | 'due' | 'overdue' | 'qa' | 'changeover' | 'inprogress';

export type ChecklistStatus = 'approved' | 'pending' | null;

export type MachineType = 'RVS' | 'TOYO' | 'WB' | 'K1R' | 'MF';

export type Floor = 'Lantai 1' | 'Lantai 2' | 'Lantai 3' | 'Lantai 4';

export interface CleaningRecord {
  id: string;
  machineId: string;
  machineName: string;
  machineType: MachineType;
  machineCode: string;
  subLabel: string;
  location: Floor;
  floor: number;
  lastCleaned: string | null;
  nextCleaning: string | null;
  lastRecordId: string | null;
  checklistStatus: ChecklistStatus;
  status: CleaningStatus;
  hasRecord: boolean;
  reportApproved: boolean;
}

export interface CleaningSummary {
  total: number;
  safe: number;
  due: number;
  overdue: number;
  waitingQA: number;
}

export interface CleaningFilters {
  search: string;
  machineType: MachineType | '';
  location: Floor | '';
  status: CleaningStatus | '';
  dateFrom: string;
  dateTo: string;
}