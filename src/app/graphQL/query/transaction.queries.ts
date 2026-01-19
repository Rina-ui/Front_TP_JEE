import { gql } from '@apollo/client/core';

export const GET_ALL_TRANSACTIONS = gql`
  query GetAllTransactions($numeroCompte: String!) {
    getAllTransactions(numeroCompte: $numeroCompte) {
      id
      type
      montant
      dateTransaction
      description
      numeroCompteSource
      numeroCompteDestination
      soldeApres
    }
  }
`;
