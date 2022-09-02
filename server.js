const { app } = require('./app');
const { initRelations } = require('./models/relations');

const { db } = require('./utils/database');

db.authenticate()
  .then(() => console.log('Database authenticated'))
  .catch(err => console.log(err));

initRelations();

db.sync(/* {force:true} */)
  .then(() => console.log('Database synced'))
  .catch(err => console.log(err));

  const PORT = process.env.PORT || 4000 || 15700;

app.listen(PORT, () => {
  console.log(`Elektron is running on port: ${PORT}`);
});
