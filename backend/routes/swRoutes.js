import express from "express";
import axios from "axios";
import {
  create_room,
  is_activated,
  get_space_credentials,
  get_rooms,
  get_room_sessions,
  check_credentials,
  delete_room,
  activate_swrooms,
  get_public_rooms,
} from "./swApiCalls.js";
import { moderatorPermissions, normalPermissions } from "../globals.js";
import { check_jwt } from "./swApiCalls.js";

const router = express.Router();

/*

  API calls implemented here [all POST]

  /authenticate
  /check_jwt
  /create_room
  /delete_room
  /get_public_rooms
  /get_rooms
  /get_room_sessions
  /get_rooms_activated
  /is_swrooms_activated
  /activate_swrooms

  /get_token

*/

// In: { signalwire_token, space, project_id }
// Out: { jwt } or 401
router.post("/authenticate", async (req, res) => {
  const { token, projectid, space } = req.body;
  let jwt = await check_credentials({ token, projectid, space });
  console.log("--Generated JWT", jwt);
  if (jwt !== false) {
    res.json({ jwt });
  } else res.status(401).send("Unauthorized");
});

// In: { jwt }
// Out: { valid: boolean }
router.post("/check_jwt", async (req, res) => {
  let jwt_from_client = req.body.jwt;
  console.log("--Checking JWT", jwt_from_client);
  let { valid, reason } = await check_jwt(jwt_from_client);
  console.log(" - JWT is", valid ? "valid" : "invalid");
  res.json({ valid, reason });
});

// In: { jwt, roomParams: {from signalwire api} }
// Out: { object from signalwire api } or 401
router.post("/create_room", async (req, res) => {
  const { jwt, roomParams } = req.body;
  let data = await create_room(jwt, roomParams);
  if (data === false) res.status(401).send("Unauthorized");
  else res.json(data);
});

// In: { jwt, room_id }
// out: "OK" or 401
router.post("/delete_room", async (req, res) => {
  const { jwt, roomid } = req.body;
  if ((await delete_room(jwt, roomid)) === false)
    res.status(401).send("Unauthorized");
  else res.send("OK");
});

// In: { space }
// Out: [{ id, name, etc}]
router.post("/get_public_rooms", async (req, res) => {
  const { space } = req.body;
  let rooms = await get_public_rooms({ space });
  if (rooms === undefined || rooms === false)
    return res.status(404).send("Not Found");
  res.json(rooms);
});

// In: { jwt }
// Out: [{ id, name, etc}]
router.post("/get_rooms", async (req, res) => {
  const { jwt } = req.body;
  console.log("Jwt", jwt);
  let rooms = await get_rooms({ jwt });
  if (rooms === undefined) return res.status(401).send("Unauthorized");
  res.json(rooms);
});

// In: { jwt }
// Out: {data:[{cost_in_dollars, members, room_id, etc}], links: []}
router.post("/get_room_sessions", async (req, res) => {
  const { jwt } = req.body;
  let rooms = await get_room_sessions({ jwt });
  if (rooms === undefined) return res.status(401).send("Unauthorized");
  res.json(rooms);
});

// In: { space }
// Out: { activated: Boolean }
router.post("/is_swrooms_activated", async (req, res) => {
  let space = req.body.space;
  console.log(" - Checking activation state of", space);
  if (await is_activated(space)) res.json({ activated: true });
  else res.json({ activated: false });
});

// In: { jwt, activate: Boolean }
router.post("/activate_swrooms", async (req, res) => {
  const { jwt, activate } = req.body;

  if (await activate_swrooms(jwt, activate)) {
    res.json({ activated: activate });
  } else res.status(401).send("Unauthorized");
});

// Endpoint to request token for video call
router.post("/get_token", async (req, res) => {
  console.log("GENERATING TOKENS");
  let { user_name, room_name, mod, space, enable_room_previews } = req.body;
  if (
    enable_room_previews === undefined ||
    enable_room_previews === true ||
    enable_room_previews === null
  )
    enable_room_previews = true;
  else enable_room_previews = false;

  console.log("Name: ", user_name, "Room: ", room_name, space);

  let activated = await is_activated(space);
  console.log(space, "is", activated ? "activated" : "not activated");
  if (activated) {
    let credentials = await get_space_credentials(space);
    let projectid = credentials.projectid;
    let token = credentials.token;
    let auth = { username: projectid, password: token };
    try {
      let token = await axios.post(
        `https://${space}.signalwire.com/api/video/room_tokens`,
        {
          enable_room_previews: true,
          user_name,
          room_name: room_name,
          permissions: mod
            ? [...normalPermissions, ...moderatorPermissions]
            : normalPermissions,
        },
        { auth }
      );

      token = token.data?.token;

      return res.json({ token, activated });
    } catch (e) {
      console.log(e);
      return res.sendStatus(500);
    }
  } else {
    res.json({ activated: false });
  }
});

export default router;
