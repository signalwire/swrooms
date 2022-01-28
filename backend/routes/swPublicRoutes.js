import express from "express";
import axios from "axios";
import { moderatorPermissions, normalPermissions } from "../globals.js";
import { read_key } from "../databaseDriver.js";
import { get_space_credentials } from "./swApiCalls.js";

const router = express.Router();

function get_space_name(req) {
  if (req.subdomains.length !== 1) {
    return { error: " - space subdomain not found in host" };
  }
  let space = req.subdomains[0];
  if (space === undefined) {
    return { error: " - subdomain incorrect" };
  }
  return { error: false, space };
}

router.post("/video_token", async (req, res) => {
  let { user_name, room_name, mod } = req.body;
  if (user_name === undefined || room_name === undefined) {
    console.log("Missing user_name or room_name");
    return res.sendStatus(422);
  }

  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.send(422);
  }
  space = space.space;

  let credentials;
  try {
    credentials = await get_space_credentials(space);
    console.log(credentials);
  } catch (e) {
    console.log(" - credentials not found for space", space);
    return res.sendStatus(401);
  }

  // todo: set a new toggle to enable and disable public endpoints
  console.log(" - creating new token for room ", room_name);
  if (mod) console.log("As Moderator");
  try {
    let token = await axios.post(
      `https://${space}.signalwire.com/api/video/room_tokens`,
      {
        user_name,
        room_name,
        permissions: mod
          ? [...normalPermissions, ...moderatorPermissions]
          : normalPermissions,
      },
      {
        auth: { username: credentials.projectid, password: credentials.token },
      }
    );

    token = token.data?.token;
    return res.json({ token });
  } catch (e) {
    console.log(e.response);
    return res.sendStatus(e?.response?.status ?? 500);
  }
});

router.get("/rooms", async (req, res) => {
  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.send(422);
  }
  space = space.space;
  let credentials;
  try {
    credentials = await get_space_credentials(space);
  } catch (e) {
    console.log(" - credentials not found for space", space);
    return res.sendStatus(401);
  }

  let data = await axios.get(
    `https://${space}.signalwire.com/api/video/rooms`,
    {
      auth: { username: credentials.projectid, password: credentials.token },
    }
  );
  console.log(data.data);
  res.send(data.data);
});

router.get("/room_recordings", async (req, res) => {
  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.send(422);
  }
  space = space.space;
  let credentials;
  try {
    credentials = await get_space_credentials(space);
  } catch (e) {
    console.log(" - credentials not found for space", space);
    return res.sendStatus(401);
  }
  let data = await axios.get(
    `https://${space}.signalwire.com/api/video/room_recordings`,
    {
      auth: { username: credentials.projectid, password: credentials.token },
    }
  );
  console.log(data.data);
  res.send(data.data);
});

router.post("/chat_token", async (req, res) => {
  let { user_id, channels, ttl, state } = req.body;
  if (
    user_id === undefined ||
    channels === undefined ||
    ttl === undefined ||
    state === undefined
  ) {
    return res.sendStatus(422);
  }
  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.send(422);
  }
  space = space.space;
  let credentials;
  try {
    credentials = await get_space_credentials(space);
    console.log(credentials);
  } catch (e) {
    console.log(" - credentials not found for space", space);
    return res.sendStatus(401);
  }

  try {
    let token = await axios.post(
      `https://${space}.signalwire.com/api/chat/tokens`,
      {
        user_id,
        channels,
        state,
        ttl,
      },
      {
        auth: { username: credentials.projectid, password: credentials.token },
      }
    );

    token = token.data?.token;
    return res.json({ token });
  } catch (e) {
    console.log(e);
    return res.sendStatus(401);
  }
});

export default router;
