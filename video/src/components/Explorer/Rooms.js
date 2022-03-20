import React, { useEffect, useState, useRef } from "react";
import { Card, Container } from "react-bootstrap";
import VideoPlayer from "./VideoPlayer";
import socket from "../socket.js";
import { useHistory } from "react-router-dom";
import "./rooms.css";
import NotActivated from "../NotActivated";

export default function Rooms({ space }) {
  let [roomList, setRoomList] = useState([]);
  let history = useHistory();
  useEffect(() => {
    async function getInfo() {
      socket.emit("public_messages");
      socket.on("rooms_updated", (rooms) => {
        if (rooms.roomSessions) {
          console.log(rooms);
          setRoomList(rooms);
        }
      });
    }
    getInfo();
  }, []);
  if (roomList.roomSessions === undefined) {
    //We haven't received a socket reply yet
    return <NotActivated loading />;
  } else if (roomList.roomSessions.length === 0) {
    // No rooms in session
    return (
      <Container>
        <div
          style={{
            height: 244,
            width: "80vw",
            margin: "10px auto",
            background: "#eee",
            color: "#aaa",
            fontWeight: "bolder",
            fontSize: "2.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          No ongoing rooms
        </div>
      </Container>
    );
  }
  return (
    <Container>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        {roomList.roomSessions.map((room) => (
          <div
            key={room.id}
            style={{
              width: 300,
            }}
          >
            <Card
              style={{
                flexBasis: 240,
              }}
              onClick={(e) => {
                history.push("/invite?m=1&r=" + encodeURIComponent(room.name));
              }}
              className="room-preview-card"
            >
              <div
                style={{
                  width: 300,
                  // height: 200,
                  // background: `url("https://source.unsplash.com/random/300x200?t=${
                  //   Math.random() * 100
                  // }")`,
                }}
              >
                <VideoPlayer src={room.preview_url} />
              </div>
              <Card.Title style={{ padding: 12 }}>Nirav's room</Card.Title>
              {/* <Card.Title style={{ padding: 12 }}>{room.name}</Card.Title> */}
            </Card>
          </div>
        ))}
      </div>
    </Container>
  );
}
