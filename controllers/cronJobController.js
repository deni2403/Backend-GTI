const { Client } = require('pg');

const updateIddleDays = async (req, res) => {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    await client.query('UPDATE containers SET iddle_days = iddle_days + 1');
    await client.end();
    res.status(200).send('iddle_days updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating iddle_days');
  }
};

module.exports = {
  updateIddleDays,
};
