import express from "express";
import axios from "axios";
import { moderatorPermissions, normalPermissions } from "../globals.js";
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
  let { user_name, room_name, mod, enable_room_previews } = req.body;
  if (
    enable_room_previews === undefined ||
    enable_room_previews === false ||
    enable_room_previews === null
  )
    enable_room_previews = false;
  else enable_room_previews = true;

  if (user_name === undefined || room_name === undefined) {
    console.log("Missing user_name or room_name");
    return res.sendStatus(422);
  }

  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.sendStatus(422);
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
        enable_room_previews,
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
    return res.sendStatus(422);
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
    `https://${space}.signalwire.com/api/video/rooms?page_size=100`,
    {
      auth: { username: credentials.projectid, password: credentials.token },
    }
  );
  console.log(data.data);
  res.json(data.data);
});

router.get("/room_recordings", async (req, res) => {
  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.sendStatus(422);
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
    `https://${space}.signalwire.com/api/video/room_recordings?page_size=100`,
    {
      auth: { username: credentials.projectid, password: credentials.token },
    }
  );
  console.log(data.data);
  res.json(data.data);
});

router.post("/chat_token", async (req, res) => {
  let { member_id, channels, ttl, state } = req.body;
  console.log(" - chat_token");
  console.log(req.body);
  if (user_id === undefined) {
    return res.sendStatus(422);
  }
  if (ttl === undefined) ttl = 3600;
  if (state === undefined) state === [];
  if (channels === undefined) channels = { guest: { read: true, write: true } };
  let space = get_space_name(req);
  if (space.error) {
    console.log(space.error);
    return res.sendStatus(422);
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
        member_id,
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
