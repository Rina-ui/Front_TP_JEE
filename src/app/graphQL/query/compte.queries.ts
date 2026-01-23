import { gql } from 'apollo-angular';

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

export const GET_COMPTE_BY_ID = gql`
  query GetCompteById($id: ID!) {
    getCompteById(id: $id) {
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

export const GET_COMPTE_BY_NUMERO = gql`
  query GetCompteByNumero($accountNumber: String!) {
    getCompteByNumero(accountNumber: $accountNumber) {
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
      clientId
      clientNom
    }
  }
`;

export const GET_COMPTES_ACTIFS_BY_CLIENT = gql`
  query GetComptesActifsByClient($clientId: ID!) {
    getComptesActifsByClient(clientId: $clientId) {
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
