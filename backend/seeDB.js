const { getDb, queryAll } = require('./db/database');
(async () => {
  await getDb();
  console.log('USERS:', queryAll('SELECT id, username, role, password FROM users'));
  console.log('LABS:', queryAll('SELECT id, title FROM labs'));
  console.log('SUBMISSIONS:', queryAll('SELECT id, user_id, lab_id, grade FROM submissions'));
  process.exit(0);
})();