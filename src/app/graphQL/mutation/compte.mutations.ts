import { gql } from '@apollo/client/core';

export const CREATE_COMPTE = gql`
  mutation CreateCompte($clientId: ID!, $input: CompteDTOInput!) {
    createCompte(clientId: $clientId, input: $input) {
      id
      accountNumber
      solde
      typeCompte
      actif
    }
  }
`;

export const DELETE_COMPTE = gql`
  mutation DeleteCompte($id: ID!) {
    deleteCompte(id: $id)
  }
`;
