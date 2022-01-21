import { React, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import Select from "./Select";
export default function AddNewRoomForm({ onCreateRoom = () => {} }) {
  let [roomName, setRoomName] = useState("");
  let [record, setRecord] = useState(false);
  let [maxParticipants, setMaxParticipants] = useState(20);
  let [quality, setQuality] = useState("720p");
  return (
    <Container className="mb-3 p-4">
      <h3>Create a new room</h3>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group className="mb-3" controlId="VideoCallName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name for the new room"
            onChange={(e) => setRoomName(e.target.value)}
            value={roomName}
            pattern="[^' ']+"
          />
        </Form.Group>
        <Form.Label>Maximum Participants</Form.Label>
        <Form.Control
          className="mb-3"
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
        />
        <Form.Label>Quality</Form.Label>
        <Select
          items={["720p", "1024p"]}
          value={quality}
          onChange={(v) => setQuality(v)}
        />

        {/* <Form.Group className="mb-3 mt-3" controlId="videocallpassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Leave blank for no password"
            onChange={(e) => setRoomName(e.target.value)}
            value={roomName}
            pattern="[^' ']+"
          />
          <Form.Text>
            Password protect the room so only authorized users can join calls.
          </Form.Text>
        </Form.Group> */}
        <Form.Check
          className="mb-3 mt-3"
          type="checkbox"
          label="Record on start"
          checked={record}
          onChange={(e) => {
            setRecord(e.target.checked);
          }}
        />

        <Button
          variant="primary"
          type="submit"
          onClick={() => {
            if (roomName !== "") {
              let roomParams = {
                name: roomName,
                record_on_start: record,
                max_members: maxParticipants,
                quality,
              };
              console.log("Creating rooms with parameter", roomParams);
              onCreateRoom(roomParams);
            } else {
              alert(
                "Please Fill all fields (todo use bootstrap alert or form error messages)"
              );
            }
          }}
        >
          Create
        </Button>
      </Form>
    </Container>
  );
}
