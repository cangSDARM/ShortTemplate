import rd from './rd';
import { filterInt } from './utils';

const canCalc = /(?<flow>[\+-])(?:(?<rd>\d*[dD]\d+)|(?<award>\d+))/giu;
const naN = /[^0-9dD\+\-\s]/giu;
const reward = (message: string) => {
  let occur = false;
  let result: number[] = [];
  let rest = message;

  naN.lastIndex = 0;
  const nan = message.search(naN);

  const cleanStr = nan > -1 ? message.substring(0, nan) : message;
  const noSpace = cleanStr.replace(/\s/giu, '');

  // console.log('noSpace', cleanStr, noSpace);
  if (noSpace == '') occur = true;
  else {
    let flow: string | number,
      rds,
      award: string | number,
      calc: RegExpMatchArray;
    for (calc of noSpace.matchAll(canCalc)) {
      occur = true;
      if (calc?.groups == undefined) {
        break;
      }

      ({ flow, rd: rds, award } = calc.groups);
      flow = flow == '-' ? -1 : 1;

      if (award) {
        award = filterInt(award);
        if (Number.isNaN(award)) {
          break;
        }

        result.push(flow * award);
      } else {
        rds = rd(rds);
        if (!rds || rds?.isFallbacked) {
          break;
        }

        result.push(flow * rds.result.reduce((a, b) => a + b, 0));
      }
      occur = false;
    }
  }

  if (result.length > 0) rest = rest.substring(cleanStr.length);

  return {
    result,
    rest,
    occur,
  };
};

export default reward;
