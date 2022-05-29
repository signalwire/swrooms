import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import RoomSelector from "./RoomSelector";

export default function ManualJoin({
  onJoin = () => {},
  rooms = ["guest"],
  space,
}) {
  let [name, setName] = useState("");
  let [selectedRoom, setSelectedRoom] = useState("");

  return (
    <Container>
      <Row className="justify-content-md-center" style={{}}>
        <Col lg={4} className="mt-5 mb-2">
          <h3>Manually join a room</h3>
          <p>
            Welcome to{" "}
            <span style={{ fontWeight: "bold", color: "#f72b73" }}>
              {space}
            </span>
            's video-calling platform. Join an existing room or make a new one
            here.
          </p>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3" controlId="VideoCallName">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                pattern="[^' ']+"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="VideoRoom">
              <Form.Label>Room Name</Form.Label>
              <RoomSelector
                items={rooms}
                value={selectedRoom}
                onChange={(v) => setSelectedRoom(v)}
              />
              {/* <Form.Control
                type="text"
                placeholder="Room Name"
                onChange={(e) => setRoom(e.target.value)}
                value={room}
                pattern="[^' ']+"
                required
              /> */}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                console.log(selectedRoom);
                if (name !== "" && selectedRoom !== "") {
                  onJoin({ name, room: selectedRoom });
                } else {
                  alert("Please fill all fields");
                }
              }}
            >
              Join
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
