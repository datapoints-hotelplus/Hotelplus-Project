export type ExportSectionRow = {
  label: string;
  value: string;
};

export type ExportPackageBlock = {
  packageName: string;
  description?: string;
  rows: ExportPackageRow[];
  totalLabel: string;
  totalValue: string;
  conditions?: string[];
};

export type ExportPayload = {
  hotelName: string;
  packages: ExportPackageBlock[];
};

export interface ExportPackageRow {
  label: string;
  value: string;
}