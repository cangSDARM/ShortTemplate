function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export const filterInt = function(value: any) {
  if (/^[0-9]+$/.test(value)) return Number(value);
  return NaN;
};

export function hasThisDice(num: number | string) {
  if (typeof num == 'string') num = filterInt(num);
  switch (num) {
    case 100:
    case 10:
    case 4:
    case 6:
    case 8:
    case 12:
    case 20:
      return true;
    default:
      return false;
  }
}

/**
 * Roll Dice
 *
 * if not true of `hasThisDice` or `!NaN`, roll 100-dice
 */
export const rollDice = (dice: string) => {
  let trueDice = filterInt(dice);

  if (Number.isNaN(trueDice)) return getRandomInt(1, 100 + 1);

  if (!hasThisDice(trueDice)) trueDice = 100;

  return getRandomInt(1, trueDice + 1);
};

function printSum(result: number[], withSum = true): string {
  return `${result
    .reduce(
      (pre, cur) => pre + (+cur > 0 ? ` + ${cur}` : ` - ${-1 * +cur}`),
      ''
    )
    .substring(3)}${
    withSum ? ' = ' + result.reduce((pre, cur) => pre + cur, 0).toString() : ''
  }`;
}

export const print = {
  sum: printSum,
};
