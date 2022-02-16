import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {
  MdDelete,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdVolumeOff,
  MdVolumeUp,
} from "react-icons/md";
import { useEffect, useState } from "react";
import socket from "./socket.js";
import ActionButton from "./ActionButton.js";
import Select from "./Select.js";

export default function ActiveRooms({
  roomSessions,
  credentials,
  onRoomSessionUpdate = () => {},
  costInDollars = {},
}) {
  let [membersTalking, setMembersTalking] = useState([]);
  let [layouts, setLayouts] = useState([]);

  useEffect(() => {
    if (credentials === undefined || credentials === null) return;

    socket.emit("credentials", credentials);
    socket.on("clientcreated", () => {
      console.log("client created");
    });

    [
      "member.joined",
      "member.left",
      "member.talking.started",
      "member.talking.ended",
      "member.left",
      "member.audioMuted",
      "member.videoMuted",
      "member.deaf",
      "member.visible",
      "member.onHold",
      "member.updated",
      "room.ended",
      "room.started",
      "room.list",
    ].forEach((message) => {
      socket.on(message, (obj) => {
        // console.log(message, obj);
        if (message === "member.talking.started") {
          setMembersTalking((m) => {
            obj = obj.id;
            if (obj === undefined) return m;
            if (m.includes(obj)) return [...m];
            return [...m, obj];
          });
        } else if (message === "member.talking.ended") {
          setMembersTalking((m) => {
            obj = obj.id;
            if (obj === undefined) return m;

            let index = m.indexOf(obj);
            if (index === -1) return [...m];
            else return [...m.slice(0, index), ...m.slice(index + 1)];
          });
        } else if (message === "member.updated") {
          console.log("Member ", obj.id, " updated", obj.updated, ":", obj);
          // onMemberInfoUpdate(obj);
          onRoomSessionUpdate("member.updated", obj);
        } else if (message === "room.ended") {
          console.log("Room ended", obj);
          onRoomSessionUpdate("room.ended", { sessionId: obj.id });
        } else if (message === "room.started") {
          console.log("Room started", obj);
          onRoomSessionUpdate("room.started", { ...obj });
        } else if (message === "member.joined") {
          console.log("Member joined", obj);
          onRoomSessionUpdate("member.joined", obj);
        } else if (message === "member.left") {
          console.log("Member left", obj);
          onRoomSessionUpdate("member.left", obj);
        } else if (message === "room.list") {
          console.log("Room list from server", obj);
          onRoomSessionUpdate("room.list", obj);
        }
      });
    });
  }, [credentials, onRoomSessionUpdate]);

  return (
    <>
      {roomSessions?.map((session) => {
        return (
          <div key={session.id}>
            <h5>
              {session.name} ($
              {costInDollars?.costRooms?.find((x) => x.id === session.id)?.cost}
              )
            </h5>
            <Select
              placeholder="Layout (one way)"
              items={session?.layouts}
              value={layouts[session.id] ?? "1x1"}
              onChange={(x) => {
                console.log("LAYOUT CHANGING TO", x);
                socket.emit("setLayout", {
                  sessionId: session.id,
                  layout: x,
                });
                setLayouts((l) => {
                  return { ...l, [session.id]: x };
                });
              }}
            />
            <Table>
              <thead>
                <tr>
                  <th>
                    <i>{session.name}</i> Members
                  </th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {session?.members?.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {member.name}{" "}
                        <div
                          style={{
                            display: "inline-block",
                            width: 100,
                            fontSize: 8,
                          }}
                        >
                          {member.id}
                        </div>
                        {membersTalking?.includes(member.id) && <MdMic />}
                      </div>
                    </td>
                    <td>
                      $
                      {
                        costInDollars?.costMembers?.find(
                          (x) => x.id === member.id
                        )?.cost
                      }
                    </td>
                    <td>
                      <ActionButton
                        // muted={memberInfo[member.id]?.audioMuted}
                        muted={member.audioMuted}
                        muteIcon={() => <MdMicOff />}
                        unmuteIcon={() => <MdMic />}
                        setMuted={async (value) => {
                          if (value) {
                            socket.emit("audioMute", {
                              id: member.id,
                              roomId: session.room_id,
                            });
                          } else {
                            socket.emit("audioUnmute", {
                              id: member.id,
                              roomId: session.room_id,
                            });
                          }
                        }}
                      />{" "}
                      <ActionButton
                        // muted={memberInfo[member.id]?.videoMuted}
                        muted={member.videoMuted}
                        muteIcon={() => <MdVideocamOff />}
                        unmuteIcon={() => <MdVideocam />}
                        setMuted={async (value) => {
                          if (value) {
                            socket.emit("videoMute", {
                              id: member.id,
                              roomId: session.room_id,
                            });
                          } else {
                            socket.emit("videoUnmute", {
                              id: member.id,
                              roomId: session.room_id,
                            });
                          }
                        }}
                      />{" "}
                      <ActionButton
                        // muted={memberInfo[member.id]?.deaf}
                        muted={member.deaf}
                        muteIcon={() => <MdVolumeOff />}
                        unmuteIcon={() => <MdVolumeUp />}
                        setMuted={async (value) => {
                          console.log("muting");
                          if (value) {
                            socket.emit("deaf", {
                              id: member.id,
                              roomId: session.room_id,
                            });
                          } else {
                            socket.emit("undeaf", {
                              id: member.id,
                              roomId: session.room_id,
                            });
                          }
                        }}
                      />{" "}
                      <Button
                        variant="danger"
                        onClick={() => {
                          //   onDelete(room.id);
                          console.log("Removing user", member.name);
                          socket.emit("removeMember", {
                            id: member.id,
                            roomId: session.room_id,
                          });
                        }}
                      >
                        <MdDelete />
                      </Button>{" "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
      })}
    </>
  );
}
