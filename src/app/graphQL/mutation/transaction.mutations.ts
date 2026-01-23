import { gql } from '@apollo/client/core';

export const VERSEMENT_MUTATION = gql`
  mutation Versement($input: VersementInput!) {
    versement(input: $input) {
      id
      typeTransaction
      amount
      dateTransaction
      soldeApres
    }
  }
`;

export const RETRAIT_MUTATION = gql`
  mutation Retrait($input: RetraitInput!) {
    retrait(input: $input) {
      id
      typeTransaction
      amount
      dateTransaction
      soldeApres
    }
  }
`;

export const VIREMENT_MUTATION = gql`
  mutation Virement($input: VirementInput!) {
    virement(input: $input) {
      id
      type
      montant
      dateTransaction
      soldeApres
    }
  }
`;
