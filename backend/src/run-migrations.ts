import dataSource from './infrastructure/database/typeorm.config';

dataSource
  .initialize()
  .then((ds) => ds.runMigrations())
  .then(() => {
    console.log('Migrations completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
