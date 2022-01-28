import dotenv from "dotenv";
import path from "path";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import http from "http";
import { start_new_session, io_realtime } from "./backend/realtime.js";
import routes from "./backend/routes/swRoutes.js";
import publicRoutes from "./backend/routes/swPublicRoutes.js";

import { read_db } from "./backend/databaseDriver.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);
const io = io_realtime(server);

app.use("/", routes);
app.use("/public/", publicRoutes);

if (process.env.ENVIRONMENT === "dev") {
  console.log("Running in development mode.");
  console.log(
    " - making subdomains one leve shallower to understand localhost based domains"
  );
  // You're running this on localhost, so subdomains are on level shallower
  app.set("subdomain offset", 1);
} else console.log("Running in production mode");

const root = path.join(path.resolve(), "video", "build");
app.use(express.static(root));
app.get("*", (req, res) => {
  res.sendFile("index.html", { root });
});

const port = process.env.PORT || 5000;
start(port);

async function start(port) {
  console.log("Starting Server");
  let data = await read_db();
  for (let key in data) {
    if (data[key].activated) {
      console.log(" - Starting session for", key);
      start_new_session({
        projectid: data[key].projectid,
        token: data[key].token,
      });
    }
  }
  server.listen(port, () => {
    console.log(" - Server listening at port", port);
  });
}
