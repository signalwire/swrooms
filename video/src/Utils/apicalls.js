import Axios from "axios";
import { apiurl } from "./apiurl";
async function check_jwt(jwt) {
  let m = await Axios.post(apiurl + "/check_jwt", {
    jwt,
  });
  console.info(" - check_jwt returned ", m.data.valid);
  return m.data;
}

async function check_credentials({ space, token, projectid }) {
  try {
    let m = await Axios.post(apiurl + "/authenticate", {
      space,
      token,
      projectid,
    });
    console.log(m.data.jwt);
    return m.data.jwt;
  } catch (e) {
    if (e.status === 401) return false;
    console.log(e.status);
    return false;
  }
}

async function delete_room({ roomid, jwt }) {
  try {
    let m = await Axios.post(apiurl + "/delete_room", {
      jwt,
      roomid,
    });
    console.log(m.data);
    return true;
  } catch (e) {
    console.log(e.status);
    return false;
  }
}

async function get_rooms({ jwt }) {
  let m = await Axios.post(apiurl + "/get_rooms", {
    jwt,
  });
  return m.data;
}

async function get_public_rooms(space) {
  try {
    let m = await Axios.post(apiurl + "/get_public_rooms", {
      space,
    });
    return m.data;
  } catch (e) {
    console.log(e, "in get_public_rooms");
    return false;
  }
}

async function get_room_sessions({ jwt }) {
  let m = await Axios.post(apiurl + "/get_room_sessions", {
    jwt,
  });
  return m.data;
}
async function activate({ jwt, activate = false }) {
  let m = await Axios.post(apiurl + "/activate_swrooms", {
    activate,
    jwt,
  });
  console.log(m.data.activated);
  return m.data.activated;
}

async function create_room({ jwt, roomParams }) {
  let m = await Axios.post(apiurl + "/create_room", {
    roomParams,
    jwt,
  });
  console.log(m.data);
  return m.data;
}
async function is_activated({ space }) {
  let m = await Axios.post(apiurl + "/is_swrooms_activated", {
    space,
  });
  console.log(m.data.activated);
  return m.data.activated;
}

async function get_token_for_video(roomDetails, space) {
  try {
    let token = await Axios.post(apiurl + "/get_token", {
      user_name: roomDetails.name,
      room_name: roomDetails.room,
      mod: roomDetails.mod,
      space,
    });
    console.log(token.data);
    if (token.data.activated === false || token.data.activated === undefined)
      return false;

    console.log("Token for video received");
    return token.data.token;
  } catch (e) {
    console.log(e);
    return false;
  }
}
export {
  check_credentials,
  check_jwt,
  get_rooms,
  activate,
  is_activated,
  get_room_sessions,
  create_room,
  delete_room,
  get_token_for_video,
  get_public_rooms,
};
