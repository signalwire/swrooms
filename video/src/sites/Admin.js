import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdRefresh } from "react-icons/md";

import {
  activate,
  check_jwt,
  create_room,
  delete_room,
  get_rooms,
  get_room_sessions,
  is_activated,
} from "../Utils/apicalls.js";
import { Button, Col, Container, Row } from "react-bootstrap";
import AddNewRoomForm from "../components/AddNewRoomForm.js";
import ActiveRooms from "../components/ActiveRooms.js";
import NotActivated from "../components/NotActivated.js";
import Events from "../components/Events.js";
import { RoomTable } from "../components/RoomTable";

function Admin() {
  const [rooms, setRooms] = useState([]);
  const [roomSessions, setRoomSessions] = useState([]);
  const [credentials, setCredentials] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [memberInfo, setMemberInfo] = useState({});

  const [costInDollars, setCostInDollars] = useState({});

  // const [u, setU] = useState(null);
  // const update = () => setU((u) => !u);
  const update = () => refreshData(credentials.space, credentials.jwt);

  let onRoomSessionUpdateCallback = useCallback(onRoomSessionUpdate, [
    credentials,
  ]);

  async function onRoomSessionUpdate(event, obj) {
    refreshCost(credentials.jwt);
    if (event === "room.started") {
      let sessionId = obj.id;
      console.log("room started", sessionId, obj.displayName);
      setRoomSessions((rs) => {
        let roomIndex = rs.findIndex((x) => x.id === sessionId);
        if (roomIndex === -1)
          // New room was found
          return [...rs, obj];
        // Old room updated? This shouldn't happen
        else
          return [...rs.slice(0, roomIndex), obj, ...rs.slice(roomIndex + 1)];
      });
    } else if (event === "room.list") {
      console.log("Got Room List", obj);
      setRoomSessions(obj);
    } else if (event === "room.ended") {
      let { sessionId } = obj;
      setRoomSessions((rs) => {
        console.log("Room ended", sessionId);
        let changedRoom = rs.findIndex((room) => room.id === sessionId);
        if (changedRoom > -1) {
          console.log(" - Deleted from State");
          rs.splice(changedRoom, 1);
          console.log("new Roomsessions array", rs);
          return [...rs];
        } else {
          console.log("Got room.ended signal for room that is not in state");
          return [...rs];
        }
      });
    } else if (event === "updated") {
      let { displayName, members, roomId, sessionId } = obj;
      setRoomSessions((rs) => {
        let changedRoom = rs.findIndex((room) => room.id === sessionId);
        if (changedRoom > -1) {
          console.log("Updated room exists in array. Updating");
          rs[changedRoom].name = displayName;
          rs[changedRoom].members = [...members];
          rs[changedRoom].roomId = roomId;
          rs[changedRoom].id = sessionId;
          return [...rs];
        } else {
          console.log("updated room doesn't exist. adding");
          return [
            ...rs,
            { id: sessionId, name: displayName, members: members },
          ];
        }
      });
    } else if (event === "member.joined") {
      console.log("member joined", obj);
      setRoomSessions((rs) => {
        let room = rs.find((x) => x.room_id === obj.room_id);
        if (room) {
          let member = room.members.find((x) => x.id === obj.id);
          if (member) {
            console.log("member already exists in room", room, "doing nothing");
            return rs;
          } else {
            console.log("DEBUGINFO MEMBER JOIN", member, obj);
            room.members.push(obj);
            return [...rs];
          }
        } else {
          console.log("Room", obj.room_id, "doesn't exist. Doing nothing");
          return rs;
        }
      });
    } else if (event === "member.updated") {
      console.log("Member udpated", obj);

      setRoomSessions((rs) => {
        let room = rs.find((x) => x.id === obj.sessionId);
        if (room) {
          let member = room.members.find((x) => x.id === obj.id);
          if (member) {
            member.audioMuted = obj.audioMuted;
            member.deaf = obj.deaf;
            member.videoMuted = obj.videoMuted;
            return [...rs];
          } else {
            console.log("Member doesn't exist. Doing nothing");
            return rs;
          }
        } else {
          console.log("Room", obj.room_id, "doesn't exist. Doing nothing");
          return rs;
        }
      });
    } else if (event === "member.left") {
      console.log("member left", obj);
      setRoomSessions((rs) => {
        let session = rs.find((x) => x.id === obj.session_id);
        if (session !== undefined) {
          let member = session.members.find((x) => x.id === obj.id);
          if (member) {
            session.members = session.members.filter((x) => x.id !== obj.id);
            return [...rs];
          } else {
            return [...rs];
          }
        }
      });
    }
  }

  let onMemberInfoUpdateCallback = useCallback((obj) => {
    setMemberInfo((memberInfo) => {
      if (memberInfo === undefined) {
        console.log(
          "memberInfo empty but ",
          obj.id,
          " received. State mismatch"
        );
        return {};
      }
      let member = memberInfo[obj.id];
      if (member === undefined) {
        return { ...memberInfo };
      } else {
        obj.updated.forEach((key) => {
          member[key] = obj[key];
        });
        return { ...memberInfo };
      }
    });
  }, []);

  useEffect(() => {
    fetchData();
    async function fetchData() {
      setIsLoading(true);
      if (
        localStorage.getItem("jwt") === null ||
        localStorage.getItem("jwt") === undefined
      ) {
        window.location.pathname = "/admin_login";
      }

      let space = window.location.hostname.split(".")[0];
      let jwt = localStorage.getItem("jwt");
      setCredentials({
        space,
        jwt,
      });

      let jwt_validity = await check_jwt(jwt);
      if (jwt_validity.valid) {
        await refreshData(space, jwt);
        setIsLoading(false);
      } else {
        if (jwt_validity.reason === "relogin")
          //The JWT was valid, but the database in backend was wiped for some reason.
          localStorage.setItem("jwt", null);
        window.location.pathname = "/admin_login";
      }
    }
  }, []);
  return (
    <Container>
      <Events log={event} />
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <h1>Admin</h1>
      </div>

      {isLoading ? (
        <NotActivated loading />
      ) : (
        <>
          <Row>
            <Col xs={8}>
              <Container className="p-3" fluid>
                <h3>Manage Rooms</h3>
                {RoomTable(
                  rooms,
                  async (id) => {
                    console.log(id);
                    await delete_room({
                      jwt: credentials.jwt,
                      roomid: id,
                    });
                    update();
                  },
                  credentials?.space,
                  (log) => {
                    setEvent(log);
                  }
                )}
                <h3>Currently active rooms</h3>
                <ActiveRooms
                  costInDollars={costInDollars}
                  roomSessions={roomSessions}
                  credentials={credentials}
                  update={update}
                  onRoomSessionUpdate={onRoomSessionUpdateCallback}
                  memberInfo={memberInfo}
                  onMemberInfoUpdate={onMemberInfoUpdateCallback}
                />
                {/* <h3>All Sessions (ever)</h3> */}
              </Container>
            </Col>
            <Col>
              <AddNewRoomForm
                onCreateRoom={async (roomParams) => {
                  let done = await create_room({
                    jwt: credentials.jwt,
                    roomParams,
                  });
                  console.log(done);
                  update();
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                className="m-2"
                onClick={async () => {
                  console.log(credentials);
                  if (credentials === null) return;
                  let x = await activate({
                    ...credentials,
                    activate: !isActivated,
                  });
                  console.log(x, "value", {
                    ...credentials,
                    activate: !isActivated,
                  });
                  // have loading ehre
                  setIsActivated(x);
                }}
                variant={isActivated ? "danger" : "success"}
              >
                {isActivated ? "Deactivate " : "Activate "}
                your SignalWire Rooms container
              </Button>
              <Button
                onClick={() => {
                  localStorage.clear("apiToken");
                  localStorage.clear("projectID");
                  localStorage.clear("jwt");
                  window.location.pathname = "/admin_login";
                }}
              >
                Log out
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );

  async function refreshCost(jwt) {
    let rs = await get_room_sessions({
      jwt,
    });

    let costRooms = rs.data.map((x) => ({
      id: x.id,
      cost: x.cost_in_dollars,
      type: "room",
    }));
    let costMembers = [];

    rs.data.forEach((r) => {
      r.members.forEach((m) => {
        costMembers.push({ id: m.id, cost: m.cost_in_dollars, type: "member" });
      });
    });

    console.log("COST", costRooms, costMembers);
    setCostInDollars({ costRooms: costRooms, costMembers: costMembers });
  }

  async function refreshData(space, jwt) {
    let i = await is_activated({ space });
    setIsActivated(i);
    let r = await get_rooms({
      jwt,
    });
    setRooms(r);
  }
}

export default Admin;
