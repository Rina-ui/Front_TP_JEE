export enum TypeTransaction {
  DEPOT = 'DEPOT',
  RETRAIT = 'RETRAIT',
  VIREMENT = 'VIREMENT'
}

export interface Transaction {
  id: string;
  type: TypeTransaction;
  montant: number;
  dateTransaction: string;
  description?: string;
  numeroCompteSource?: string;
  numeroCompteDestination?: string;
  soldeApres: number;
}

export interface VersementInput {
  numeroCompte: string;
  montant: number;
  description?: string;
}

export interface RetraitInput {
  numeroCompte: string;
  montant: number;
  description?: string;
}

export interface VirementInput {
  numeroCompteSource: string;
  numeroCompteDestination: string;
  montant: number;
  description?: string;
}
