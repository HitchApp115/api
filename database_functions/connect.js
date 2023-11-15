const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '35.185.226.18',
  user: 'member',
  password: 'slugs',
  database: 'Hitch_Database', // Replace with your actual database name
  port: 3306
});

const connect = () => {
    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err);
          return;
        }
        console.log('Connected to the MySQL server.');
      });
}

const close = () => {
    connection.close((err) => {
        if (err) {
            console.error('Error closing connection to the database:', err);
            return;
          }
          console.log('Closed connection to the MySQL server.');
    })
}

module.exports = { connection, connect, close };