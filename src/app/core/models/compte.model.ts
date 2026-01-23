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
  clientId: string;
  createdAt?: string;
}

// ✅ Correspond au schéma GraphQL CompteDTOInput
export interface CreateCompteInput {
  accountNumber?: string;
  sold: number;
  typeCompte: TypeCompte;
}
