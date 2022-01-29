import { Server } from "socket.io";
import { createClient } from "@signalwire/realtime-api";
import { get_token_from_jwt } from "./routes/swApiCalls.js";

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
      "member.left",
      "member.updated",
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
        } else {
          notify(message, { id: member.id, session_id: roomSession.id });
        }
      });
    });

    await roomSession.subscribe();
  });

  client.video.on("room.ended", async (roomSession) => {
    console.log("\nRoom ended", roomSession.displayName);
    notify("room.ended", roomSession.id, function cleanup() {
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
        delete loggedClients[token.projectid].notifyList[socket.id];
      });
    });
  });
}

export { io_realtime, start_new_session, stop_session };
