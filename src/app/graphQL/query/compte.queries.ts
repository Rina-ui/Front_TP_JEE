import { gql } from '@apollo/client/core';

export const GET_ALL_COMPTES = gql`
  query GetAllComptes {
    getAllComptes {
      id
      accountNumber
      sold
      typeCompte
      actif
      clientId
      clientNom
    }
  }
`;

export const GET_COMPTES_BY_CLIENT = gql`
  query GetComptesByClient($clientId: ID!) {
    getComptesByClient(clientId: $clientId) {
      id
      accountNumber
      sold
      typeCompte
      actif
    }
  }
`;
