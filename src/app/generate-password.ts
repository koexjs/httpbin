import { Context } from '@koex/core';
import { generatePassword, IGeneratePasswordOptions } from '@zodash/generate-password';

const keys = ['lowercase', 'uppercase', 'numbers', 'symbols', 'easyToRead', 'easyToSay'];

export default async function passwordGenerator(ctx: Context) {
  const options = keys.reduce((all, key) => {
    all[key] = key in ctx.query;
    return all;
  }, {} as any as IGeneratePasswordOptions);

  if (ctx.query.length) {
    options.length = parseInt(ctx.query.length) ?? 6;
  }

  if (ctx.query.prefix) {
    options.prefix = ctx.query.prefix;
  }

  await ctx.json({
    options,
    password: generatePassword(options),
  });
}