import { join, dirname } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function read_db() {
  await db.read();
  return db.data;
}

async function write_db(data) {
  db.data = data;
  return db.write();
}

async function append_key(key, value) {
  await db.read();
  if (db.data === null) db.data = {};
  if (typeof db.data[key] === "object" && typeof value === "object")
    db.data[key] = { ...db.data[key], ...value };
  else db.data[key] = value;
  await db.write();
  console.log(" -  - DatabaseDriver: Appended key", key, "with value", value);
}

async function delete_key(key) {
  db.data[key] = null;
}

async function read_key(key) {
  await db.read();
  if (db.data === null) return null;
  return db.data[key];
}

async function init() {}

export { init, write_db, read_db, append_key, read_key, delete_key };
