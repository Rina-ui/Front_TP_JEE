export enum TypeCompte {
  COURANT = 'COURANT',
  EPARGNE = 'EPARGNE',
}

export interface Compte {
  id: string;
  accountNumber: string;
  solde: number;
  typeCompte: TypeCompte;
  actif: boolean;
  clientId: string;
  clientNom?: string;
  createdAt: string;
}

export interface CreateCompteInput {
  solde: number;
  typeCompte: TypeCompte;
}
