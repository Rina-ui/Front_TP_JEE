import { gql } from '@apollo/client/core';

export const GET_ALL_CLIENTS = gql`
  query GetAllClients {
    getAllClients {
      id
      email
      role
      firstName
      lastName
      dateNaissance
      city
      nationality
      numberNationality
    }
  }
`;

export const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: ID!) {
    getClientById(id: $id) {
      id
      email
      firstName
      lastName
      dateNaissance
      city
      nationality
      numberNationality
    }
  }
`;
