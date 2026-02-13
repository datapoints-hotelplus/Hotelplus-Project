export type ExportSectionRow = {
  label: string;
  value: string;
};

export type ExportPackageBlock = {
  packageName: string;
  rows: ExportPackageRow[];
  totalLabel: string;
  totalValue: string;
};

export type ExportPayload = {
  hotelName: string;
  packages: ExportPackageBlock[];
};

export interface ExportPackageRow {
  label: string;
  value: string;
}