export enum LawCategory {
  LABOR = "Labor & Employment",
  BUSINESS = "Business & Commercial",
  TRAFFIC = "Traffic & Road Safety",
  RESIDENCY = "Residency & Visa",
  CRIMINAL = "Criminal Law",
  CIVIL = "Civil Law",
  REAL_ESTATE = "Real Estate & Property",
  PROFESSIONAL = "Professional Regulations",
  TAXATION = "Taxation (VAT & Corporate Tax)"
}

export interface LawSummary {
  id: string;
  title: string;
  category: LawCategory;
  summary: string;
  lastUpdated: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
