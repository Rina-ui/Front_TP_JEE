import { gql } from '@apollo/client/core';

export const GET_ALL_TRANSACTIONS = gql`
  query GetAllTransactions($numeroCompte: String!) {
    getAllTransactions(numeroCompte: $numeroCompte) {
      id
      typeTransaction
      amount
      dateTransaction
      description
      numeroCompteSource
      numeroCompteDestination
      soldeApres
    }
  }
`;

export const GENERER_RELEVE = gql`
  query GenererReleve($numeroCompte: String!, $dateDebut: String!, $dateFin: String!) {
    genererReleve(numeroCompte: $numeroCompte, dateDebut: $dateDebut, dateFin: $dateFin) {
      pdfBase64
      numeroCompte
      dateDebut
      dateFin
    }
  }
`;
