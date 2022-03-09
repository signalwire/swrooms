import React, { useEffect, useState, useRef } from "react";
import { Card, Container } from "react-bootstrap";
import VideoPlayer from "./VideoPlayer";
import socket from "../socket.js";
import { useHistory } from "react-router-dom";

export default function Rooms({ space }) {
  let [roomList, setRoomList] = useState([]);
  let history = useHistory();
  useEffect(() => {
    async function getInfo() {
      socket.emit("public_messages");
      socket.on("rooms_updated", (rooms) => {
        if (rooms.roomSessions) {
          console.log(rooms.roomSessions);
          setRoomList(rooms.roomSessions);
        }
      });
    }
    getInfo();
  }, []);
  return (
    <Container>
      <h1>Rooms</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {roomList.map((room) => (
          <>
            <Card
              style={{ flexBasis: 240 }}
              onClick={(e) => {
                history.push("/invite?m=1&r=" + encodeURIComponent(room.name));
              }}
            >
              <VideoPlayer
                key={room.id}
                src={room.preview_url}
                refreshInterval={5}
              />
              <Card.Title style={{ padding: 10 }}>{room.name}</Card.Title>
            </Card>
          </>
        ))}
      </div>
    </Container>
  );
}
