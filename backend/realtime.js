import { Server } from "socket.io";
import axios from "axios";
import { createClient } from "@signalwire/realtime-api";
import {
  get_space_credentials,
  get_token_from_jwt,
} from "./routes/swApiCalls.js";
import { parseDomain, ParseResultType, fromUrl } from "parse-domain";

let loggedClients = {};

async function start_new_session({ projectid, token }) {
  if (loggedClients[projectid] !== undefined) {
    console.log(" - Stopping previous session");
    stop_session({ projectid });
  }

  const client = await createClient({
    project: projectid,
    token: token,
  });
  loggedClients[projectid] = { client, roomSessions: [], notifyList: {} };

  client.video.on("room.started", async (roomSession) => {
    console.log("\nNew room started", roomSession.displayName);
    loggedClients[projectid].roomSessions.push(roomSession);

    let members = await roomSession.getMembers();
    let layouts = await roomSession.getLayouts();
    let membersList = members.members.map((member) => ({
      id: member.id,
      room_id: member.roomId,
      name: member.name,
      audioMuted: member.audioMuted,
      videoMuted: member.videoMuted,
      deaf: member.deaf,
      visible: member.visible,
      onHold: member.onHold,
      session_id: roomSession.id,
    }));
    notify("room.started", {
      id: roomSession.id,
      name: roomSession.name,
      displayName: roomSession.displayName,
      room_id: roomSession.roomId,
      members: membersList,
      layouts: layouts.layouts,
    });
    [
      "member.joined",
      "member.left",
      "member.talking.started",
      "member.talking.ended",
      "member.updated",
      "layout.changed",
    ].forEach((message) => {
      roomSession.on(message, (member) => {
        if (message === "member.updated") {
          let obj = {
            id: member.id,
            updated: member.updated,
            sessionId: roomSession.id,
          };
          member.updated.forEach((key) => {
            obj[key] = member[key];
          });

          console.log(obj);
          notify(message, obj);
        } else if (message === "member.joined") {
          notify(message, {
            id: member.id,
            room_id: member.roomId,
            name: member.name,
            audioMuted: member.audioMuted,
            videoMuted: member.videoMuted,
            deaf: member.deaf,
            visible: member.visible,
            onHold: member.onHold,
            session_id: roomSession.id,
          });
        } else if (message === "layout.changed") {
          notify(message, {});
        } else {
          notify(message, { id: member.id, session_id: roomSession.id });
        }
      });
    });

    await roomSession.subscribe();
  });

  client.video.on("room.ended", async (roomSession) => {
    console.log("\nRoom ended", roomSession.displayName);
    notify("room.ended", { id: roomSession.id }, function cleanup() {
      let index = loggedClients[projectid].roomSessions.findIndex(
        (room) => room.id === roomSession.id
      );
      if (index === -1) return;
      loggedClients[projectid].roomSessions.splice(index, 1);
    });
  });

  await client.connect();
  return client;

  function notify(message, objects, cleanup = () => {}) {
    for (const id in loggedClients[projectid].notifyList) {
      loggedClients[projectid].notifyList[id](message, objects);
    }
    cleanup();
  }
}

function stop_session({ projectid }) {
  console.log("Stopping session");
  delete loggedClients[projectid];
}

function io_realtime(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  io.on("connection", async (socket) => {
    console.log(" - Socketio: Connected", socket.id);

    initPublicNamespace(socket, io);

    socket.once("credentials", async (data) => {
      if (data === null) return;

      let token = await get_token_from_jwt(data.jwt);
      if (token === false) {
        console.log("Unauthorized Socket connection. Disconnecting...");
        return;
      }

      let client = loggedClients[token.projectid]?.client;
      if (client === null || client === undefined) {
        console.log("\nStarting new session, no previous session found.");
        client = await start_new_session({
          projectid: token.projectid,
          token: token.token,
        });
      } //send error?

      loggedClients[token.projectid].notifyList[socket.id] = (message, obj) => {
        // console.log(message, obj, "sending to client");
        io.to(socket.id).emit(message, obj);
      };

      if (loggedClients[token.projectid].roomSessions.length > 0) {
        console.log("\nSending room session list to client");

        let dataToSend = [];
        for (let i in loggedClients[token.projectid].roomSessions) {
          let roomSession = loggedClients[token.projectid].roomSessions[i];

          let roomToSend = {
            id: roomSession.id,
            name: roomSession.name,
            displayName: roomSession.displayName,
            room_id: roomSession.roomId,
          };
          let members = await roomSession.getMembers();
          roomToSend.members = members.members.map((member) => {
            return {
              id: member.id,
              name: member.name,
              audioMuted: member.audio_muted,
              videoMuted: member.video_muted,
              deaf: member.deaf,
              visible: member.visible,
              onHold: member.on_hold,
            };
          });
          dataToSend.push(roomToSend);
        }
        console.log("RoomSession information", dataToSend);
        io.to(socket.id).emit("room.list", dataToSend);
      }

      [
        "audioMute",
        "audioUnmute",
        "videoMute",
        "videoUnmute",
        "deaf",
        "undeaf",
        "removeMember",
        "setLayout",
      ].forEach((command) => {
        if (command === "setLayout") {
          socket.on(command, ({ sessionId, layout }) => {
            console.log("Got signal to set layout");
            let room = loggedClients[token.projectid].roomSessions.find(
              (roomSession) => roomSession.id === sessionId
            );
            if (room === undefined)
              console.log(" - Couldn't find room", roomId, "to", command);
            else {
              console.log(` - ${command}-ing user from room`, room.displayName);
              room[command]({ name: layout });
            }
          });
        } else {
          socket.on(command, ({ id, roomId }) => {
            console.log(`Got signal to ${command} user`);
            let room = loggedClients[token.projectid].roomSessions.find(
              (roomSession) => roomSession.roomId === roomId
            );
            if (room === undefined)
              console.log(" - Couldn't find room", roomId, "to", command);
            else {
              console.log(` - ${command}-ing user from room`, room.displayName);
              room[command]({ memberId: id });
            }
          });
        }
      });

      io.to(socket.id).emit("clientcreated");

      socket.on("disconnect", () => {
        console.log(" - Socketio: Disonnected", socket.id);
        delete loggedClients[token.projectid]?.notifyList[socket.id];
      });
    });
  });
}

export { io_realtime, start_new_session, stop_session };
let cache = {};
async function get_room_sessions(space, credentials) {
  if ((+new Date() - cache.time ?? Infinity) < 5000) {
    console.log(
      "Cache triggered",
      +new Date(),
      cache.time,
      (+new Date() - cache.time) / 1000
    );
    return cache.data.data.data;
  } else {
    console.log("Getting new data", +new Date() - cache.time);
    let data = await axios.get(
      `https://${space}.signalwire.com/api/video/room_sessions?page_size=100&status=in-progress`,
      {
        auth: { username: credentials.projectid, password: credentials.token },
      }
    );
    cache = { time: +new Date(), data };
    // console.log(data.data);
    return data.data.data;
  }
}
function initPublicNamespace(socket, io) {
  socket.on("public_messages", async (data) => {
    let hostname = socket.handshake.headers.host;
    let space;
    console.log(hostname);
    let parseResult = parseDomain(fromUrl(hostname));
    console.log(" - A public user has connected to Realtime");
    if (parseResult.type === ParseResultType.Listed) {
      const { subDomains } = parseResult;
      if (subDomains.length === 1) {
        console.log(" - The space is ", subDomains[0]);
        space = subDomains[0];
      } else {
        return console.log(" - Space not found in host");
      }
    } else if (parseResult.type === ParseResultType.Reserved) {
      if (parseResult.labels.length === 2) {
        console.log(" - The localhost space is", parseResult.labels[0]);
        space = parseResult.labels[0];
      } else return console.log(" - Space not found in host");
    } else return console.log(" - Domain not recognised");

    let credentials;
    try {
      credentials = await get_space_credentials(space);
    } catch (e) {
      return console.log(e);
    }
    let { projectid } = credentials;

    let client = loggedClients[projectid]?.client;
    if (client === undefined) {
      console.log(" - No client found, notifying");
      io.to(socket.id).emit("error", { message: "No client found" });
      return;
    } else {
      console.log(" - client found");
      let obj = {};
      obj.roomSessions = await get_room_sessions(space, credentials);
      io.to(socket.id).emit("rooms_updated", obj);

      loggedClients[projectid].notifyList[socket.id] = async (message, obj) => {
        if (
          [
            "member.talking.started",
            "member.talking.ended",
            "member.talking",
          ].includes(message)
        )
          return;
        console.log("message got:", message);
        obj.roomSessions = await get_room_sessions(space, credentials);
        // console.log("rooms_updated", obj, "sending to client");
        io.to(socket.id).emit("rooms_updated", obj);
      };
    }
  });
}
