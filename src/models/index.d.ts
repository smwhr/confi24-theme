import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";





type EagerVote = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Vote, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly value?: number | null;
  readonly themeID: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyVote = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Vote, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly value?: number | null;
  readonly themeID: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Vote = LazyLoading extends LazyLoadingDisabled ? EagerVote : LazyVote

export declare const Vote: (new (init: ModelInit<Vote>) => Vote) & {
  copyOf(source: Vote, mutator: (draft: MutableModel<Vote>) => MutableModel<Vote> | void): Vote;
}

type EagerTheme = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Theme, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly Votes?: (Vote | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTheme = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Theme, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly Votes: AsyncCollection<Vote>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Theme = LazyLoading extends LazyLoadingDisabled ? EagerTheme : LazyTheme

export declare const Theme: (new (init: ModelInit<Theme>) => Theme) & {
  copyOf(source: Theme, mutator: (draft: MutableModel<Theme>) => MutableModel<Theme> | void): Theme;
}