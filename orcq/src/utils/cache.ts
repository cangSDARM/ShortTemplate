import db from '../db';

interface Cache<G, S, U> {
  get: (params: G) => U | undefined;
  set: (params: G & S) => void;
  use: (params: G & S) => U | null;
}

export const timeCache: Cache<
  { stamp: number; key: string },
  { cache: string },
  string
> = {
  get: params => {
    const stmp = db.prepare(
      'select cached from time_cache where til=? and key=?'
    );

    return stmp.get(params.stamp, params.key)?.cached;
  },
  set: params => {
    const utmp = db.prepare('insert into time_cache values (null,?,?,?)');

    utmp.run(params.stamp, params.key, params.cache);

    const dtmp = db.prepare('delete from time_cache where key=? and til<?');
    dtmp.run(params.key, params.stamp);
  },
  use: params => {
    const result = timeCache.get(params);
    if (result) {
      return result;
    } else if (params.cache != '' && params.key != '') {
      timeCache.set(params);
    }

    return null;
  },
};
