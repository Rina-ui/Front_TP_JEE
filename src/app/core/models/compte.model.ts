export enum TypeCompte {
  COURANT = 'COURANT',
  EPARGNE = 'EPARGNE',
}

export interface Compte {
  id: string;
  accountNumber: string;
  sold: number;
  typeCompte: TypeCompte;
  actif: boolean;
  createdAt: string;
}


export interface CreateCompteInput {
  solde: number;
  typeCompte: TypeCompte;
}
