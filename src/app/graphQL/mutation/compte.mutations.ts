import { gql } from 'apollo-angular';

export const CREATE_COMPTE = gql`
  mutation CreateCompte($clientId: ID!, $input: CompteDTOInput!) {
    createCompte(clientId: $clientId, input: $input) {
      id
      accountNumber
      sold
      typeCompte
      actif
      clientId
    }
  }
`;

export const UPDATE_COMPTE = gql`
  mutation UpdateCompte($id: ID!, $input: UpdateCompteRequestInput!) {
    updateCompte(id: $id, input: $input) {
      id
      accountNumber
      sold
      typeCompte
      actif
      clientId
    }
  }
`;

export const DELETE_COMPTE = gql`
  mutation DeleteCompte($id: ID!) {
    deleteCompte(id: $id)
  }
`;

export const ACTIVER_COMPTE = gql`
  mutation ActiverCompte($id: ID!) {
    activerCompte(id: $id) {
      id
      accountNumber
      sold
      typeCompte
      actif
      clientId
    }
  }
`;

export const DESACTIVER_COMPTE = gql`
  mutation DesactiverCompte($id: ID!) {
    desactiverCompte(id: $id) {
      id
      accountNumber
      sold
      typeCompte
      actif
      clientId
    }
  }
`;
