import axios from "axios";
import jwt from "jsonwebtoken";
// import { read_key, append_key } from "../databaseDriver.js";
import { read_key, append_key } from "../databaseDriverPostgres.js";
import { start_new_session, stop_session } from "../realtime.js";

async function check_credentials({ token, projectid, space }) {
  console.log(" - Checking tokens", space);
  try {
    const response = await axios.get(
      `https://${space}.signalwire.com/api/video/rooms`,
      {
        auth: { username: projectid, password: token },
      }
    );
    console.log(token, projectid);
    console.log("testing response", response.data, response.status);

    let userData = await read_key(space);
    if (userData === null || userData === undefined) {
      console.log(" - - New user credential spotted. Saving to Database");
      await append_key(space, { token, projectid });
    }

    console.log(" - Token is valid, creating JWT");
    let JWT = jwt.sign({ space, projectid }, process.env.JWT_SECRET);
    return JWT;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function check_jwt(jwt_from_client) {
  console.log(jwt_from_client);
  try {
    let decoded = await jwt.verify(jwt_from_client, process.env.JWT_SECRET);
    console.log(" - decoded key", decoded);
    let space = decoded.space;
    let userData = await read_key(space);
    if (userData === null || userData === undefined) {
      console.log(
        ` - check_jwt: The JWT was valid, but we didn't 
          find the credentials in the database. 
          User needs to log in again for space`,
        space
      );
      return { valid: false, reason: "relogin" };
    }
    console.log(" - JWT is valid");
    return { valid: true, reason: null };
  } catch (e) {
    console.log(" -", e);
    return { valid: false, reason: "JWT_not_verified" };
  }
}

async function get_token_from_jwt(jwt_from_client) {
  try {
    let decoded = await jwt.verify(jwt_from_client, process.env.JWT_SECRET);
    let space = decoded.space;
    let projectid = decoded.projectid;
    if (space === undefined) return false;
    let credentials = await read_key(space);
    if (projectid !== credentials.projectid) {
      console.log(projectid, credentials.projectid);
      console.log("Credentials don't match");
      return false;
    }
    console.log(" - JWT is valid. Credentials found in database.", credentials);
    return { token: credentials.token, projectid, space };
  } catch (e) {
    console.log(" -", e);
    return false;
  }
}

async function create_room(jwt_from_client, roomParams) {
  console.log(" - Creating room", roomParams.name);
  let { token, projectid, space } = await get_token_from_jwt(jwt_from_client);
  if (token === false) {
    return false;
  }

  try {
    const response = await axios.post(
      `https://${space}.signalwire.com/api/video/rooms`,
      { ...roomParams },
      {
        auth: { username: projectid, password: token },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function delete_room(jwt_from_client, roomid) {
  console.log(" - Deleting room");
  let { token, projectid, space } = await get_token_from_jwt(jwt_from_client);
  if (token === false) {
    return false;
  }

  try {
    let data = await axios.delete(
      `https://${space}.signalwire.com/api/video/rooms/${roomid}`,
      {
        auth: { username: projectid, password: token },
      }
    );
    console.log(" - Deleted room", roomid);

    return true;
  } catch (error) {
    console.log("Error deleting room", error);
    return false;
  }
}

async function get_public_rooms({ space }) {
  let credentials = await read_key(space);
  if (credentials.token === undefined || credentials.token === false)
    return false;

  console.log(" - Getting public rooms for space", space);

  try {
    const response = await axios.get(
      `https://${space}.signalwire.com/api/video/rooms`,
      {
        auth: { username: credentials.projectid, password: credentials.token },
      }
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function get_rooms({ jwt: jwt_from_client }) {
  let { token, projectid, space } = await get_token_from_jwt(jwt_from_client);
  if (token === false || space === undefined) {
    return false;
  }
  console.log(" - Getting rooms for space", space);

  try {
    const response = await axios.get(
      `https://${space}.signalwire.com/api/video/rooms`,
      {
        auth: { username: projectid, password: token },
      }
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function get_session_members({
  space,
  room_session_id,
  token,
  projectid,
}) {
  try {
    const response = await axios.get(
      `https://${space}.signalwire.com/api/video/room_sessions/${room_session_id}/members`,
      {
        auth: { username: projectid, password: token },
      }
    );

    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
async function get_room_sessions({ jwt: jwt_from_client }) {
  let { token, projectid, space } = await get_token_from_jwt(jwt_from_client);
  if (token === false) {
    return false;
  }
  console.log(" - Getting room sessions for space", space);

  try {
    const response = await axios.get(
      `https://${space}.signalwire.com/api/video/room_sessions?page_size=1000`,
      {
        auth: { username: projectid, password: token },
      }
    );

    let data = response.data?.data?.filter((item) => {
      // console.log(item);
      return item.status === "in-progress";
    });
    for (let i = 0; i < data.length; i++) {
      let members = await get_session_members({
        space,
        room_session_id: data[i].id,
        token,
        projectid,
      });
      data[i].members = members.data;
    }

    return { data };
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function get_space_credentials(space) {
  return new Promise(async (resolve, reject) => {
    let credentials = await read_key(space);
    if (credentials === undefined || credentials === null)
      return reject("No credentials found for space " + space);
    resolve(credentials);
  });
}
async function is_activated(space) {
  try {
    let cred = await get_space_credentials(space);
    console.log(cred);
    if (cred.activated === true && cred.projectid && cred.token) return true;
    return false;
  } catch (e) {
    console.log(" -", e);
    return false;
  }
}

async function activate_swrooms(jwt_from_client, activate) {
  let { token, projectid, space } = await get_token_from_jwt(jwt_from_client);
  if (token === false) {
    return false;
  }

  await append_key(space, { projectid, token, activated: activate });
  if (activate) {
    console.log(" - Activating space", space);
    start_new_session({ projectid, token });
    return true;
  } else {
    console.log(" - Deactivating space", space);
    stop_session({ projectid });
    return true;
  }
}

export {
  is_activated,
  get_space_credentials,
  get_public_rooms,
  get_rooms,
  get_room_sessions,
  check_credentials,
  check_jwt,
  get_token_from_jwt,
  create_room,
  delete_room,
  activate_swrooms,
};
