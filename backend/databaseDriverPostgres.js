import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

import {
  init as fallback_init,
  read_db as fallback_read_db,
  append_key as fallback_append_key,
  read_key as fallback_read_key,
  delete_key as fallback_delete_key,
} from "./databaseDriver.js";

let init, read_db, append_key, read_key, delete_key;

if (process.env.DB_PASSWORD === undefined) {
  console.log("No Database found. Falling back to file database");
  init = fallback_init;
  read_db = fallback_read_db;
  append_key = fallback_append_key;
  read_key = fallback_read_key;
  delete_key = fallback_delete_key;
} else {
  const { Pool } = pg;

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  init = async function init() {
    return new Promise((resolve, reject) => {
      pool.query(
        `CREATE TABLE IF NOT EXISTS tokens (space varchar NOT NULL PRIMARY KEY, token varchar NOT NULL, projectid varchar NOT NULL, activated boolean NOT NULL, public boolean NOT NULL);`,
        (err, res) => {
          if (err) {
            console.log("Database error", err);
            reject(err);
            return;
          }
          resolve(res);
        }
      );
    });
  };

  read_db = async function read_db() {
    return new Promise((resolve, reject) => {
      pool.query(`SELECT * FROM tokens`, (err, res) => {
        if (err) {
          console.log("Database error", err);
          reject(err);
          return;
        }
        if (res.rowCount === 0) return {};
        let data = {};
        res.rows.forEach((item) => {
          data[item.space] = item;
        });
        resolve(data);
      });
    });
  };

  delete_key = async function delete_key(key) {
    return new Promise((resolve, reject) => {
      let query = {
        name: "delete_key",
        text: `DELETE FROM tokens WHERE space = $1;`,
        values: [key],
      };
      pool.query(query, (err, res) => {
        if (err) {
          console.log("Database error", err);
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  };

  read_key = async function read_key(key) {
    return new Promise((resolve, reject) => {
      let query = {
        name: "read_key",
        text: `SELECT * FROM tokens WHERE space = $1;`,
        values: [key],
      };
      pool.query(query, (err, res) => {
        if (err) {
          console.log("Database error", err);
          reject(err);
          return;
        }
        if (res.rowCount === 0) resolve(null);
        resolve(res.rows[0]);
      });
    });
  };

  append_key = async function append_key(key, value) {
    if (key === null || key === undefined) return false;
    return new Promise((resolve, reject) => {
      let query = {
        name: "append_key",
        text: `INSERT INTO tokens (space, token, projectid, activated, public) VALUES ($1, COALESCE($2, 'empty'), COALESCE($3, 'empty'), COALESCE($4, FALSE), COALESCE($5, FALSE)) 
      ON CONFLICT (space) DO UPDATE SET token = COALESCE($2,tokens.token), projectid = COALESCE($3,tokens.projectid), activated = COALESCE($4,tokens.activated), public = COALESCE($5,tokens.public);`,
        values: [
          key,
          value.token ?? null,
          value.projectid ?? null,
          value.activated ?? null,
          value.public ?? null,
        ],
      };
      pool.query(query, (err, res) => {
        if (err) {
          console.log("Database error", err);
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  };

  console.log("Trying to read database");
  console.log(await read_db("test"));
}

export { init, read_db, append_key, read_key, delete_key };
