
export interface Cotisation {
  id: string;
  prenom: string;
  nom: string;
  montant: number;
}

export interface AutreSomme {
  id: string;
  source: string;
  montant: number;
}

export interface Depense {
  id: string;
  designation: string;
  total: number;
}

export interface CaisseState {
  ancienSolde: number;
  nouveauSolde: number;
}

export interface RepartitionFonds {
  caisseRenovation: CaisseState;
  caisseSociale: CaisseState;
  comiteDirecteur: CaisseState;
}

export interface MonthlyRecord {
  month: string; // "Janvier", "Février", etc.
  year: number;
  cotisations: Cotisation[];
  autresSommes: AutreSomme[];
  depenses: Depense[];
  repartition: RepartitionFonds;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppConfig {
  location: string;
  phone: string;
  email: string;
  logo?: string; // Base64 image string
  defaultRenovationPercent: number;
  defaultSocialePercent: number;
  defaultComitePercent: number;
  members: { prenom: string; nom: string }[];
}

export interface AppData {
  records: Record<string, MonthlyRecord>; // Key: "Year-MonthName"
  config: AppConfig;
}

export const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
