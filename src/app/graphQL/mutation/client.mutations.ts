import { gql } from 'apollo-angular';

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
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

export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;
