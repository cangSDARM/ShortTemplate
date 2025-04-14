import { filterInt, hasThisDice, rollDice } from './utils';

const rRegex = /^\s*(\d*)[dD](\d{0,3})/iu;

/**
 * Match like `1d100`
 *
 * *Maximum 99 times*
 * @returns return the random array
 */
const rd = (message: string) => {
  const params = message.match(rRegex) ?? [];

  if (params.length != 3) {
    return;
  }

  const times = filterInt(params[1]);
  const dice = params[2];

  return {
    isFallbacked: !hasThisDice(dice),
    result: Array(Number.isNaN(times) ? 1 : times % 99)
      .fill(-1)
      .map(() => rollDice(dice)),
    rest: message.substring(params[0].length),
  };
};

export default rd;
