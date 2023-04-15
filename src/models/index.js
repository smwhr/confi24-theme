// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Vote, Theme } = initSchema(schema);

export {
  Vote,
  Theme
};