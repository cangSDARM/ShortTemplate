import sql from 'better-sqlite3';

const db = new sql('bot.sqlite3', {
  timeout: 3000,
  // verbose: console.log,
  fileMustExist: false,
});
db.pragma('cache_size = 32000');

export default db;

export function prepare() {
  db.exec(
    'CREATE TABLE IF NOT EXISTS err_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, err TEXT, command TEXT);'
  );
  db.exec(
    `CREATE TABLE IF NOT EXISTS time_cache (id INTEGER PRIMARY KEY AUTOINCREMENT, til INTEGER, key TEXT, cached TEXT);`
  );
}

type QsWithParams = { qs: string; params: any[] };
export function updateOrInsert(
  stmt: QsWithParams,
  update: QsWithParams,
  insert: QsWithParams
) {
  const stmtp = db.prepare(stmt.qs);
  const row = stmtp.get(...stmt.params);

  try {
    if (row) {
      const utmt = db.prepare(update.qs);
      utmt.run(...update.params);
    } else {
      const itmt = db.prepare(insert.qs);
      itmt.run(...insert.params);
    }
  } catch (e) {
    console.error('db update or insert error', e);
  }
}
