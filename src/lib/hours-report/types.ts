export type Category = 'video' | 'admin';

export interface Entry {
  date: string;
  category: Category;
  project: string;
  time: string;
}

export interface ReportMeta {
  client: string;
  name: string;
  email: string;
  date: string;
}

export interface ReportSection {
  title: string;
  rows: Entry[];
  total: string;
}

export interface Report {
  sections: ReportSection[];
  grandTotal: string;
}
