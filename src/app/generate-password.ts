import { Context } from '@koex/core';
import {
  generatePassword,
  IGeneratePasswordOptions,
} from '@zodash/generate-password';

const keys = [
  'lowercase',
  'uppercase',
  'numbers',
  'symbols',
  'easyToRead',
  'easyToSay',
];

export default async function passwordGenerator(ctx: Context) {
  const options = keys.reduce((all, key) => {
    if (['easyToRead', 'easyToSay'].includes(key)) {
      // default false
      all[key] = key in ctx.query;
    } else {
      // default true
      all[key] = ctx.query[key] === 'false' ? false : true;
    }
    return all;
  }, {} as any as IGeneratePasswordOptions);

  if (ctx.query.length) {
    options.length = parseInt(ctx.query.length as any as string) ?? 6;
  }

  if (ctx.query.prefix) {
    options.prefix = ctx.query.prefix as any as string;
  }

  await ctx.json({
    options,
    password: generatePassword(options),
  });
}
