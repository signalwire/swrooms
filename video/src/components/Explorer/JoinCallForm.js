import React from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { useHistory } from "react-router-dom";
import Rooms from "./Rooms";

export default function JoinCallForm({ space }) {
  const history = useHistory();
  return (
    <Container>
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h3>Join a room</h3>
        <p>
          Welcome to{" "}
          <span style={{ fontWeight: "bold", color: "#f72b73" }}>{space}</span>
          's video-calling platform.
        </p>
        <Rooms />

        <div style={{ color: "#aaa", marginTop: 25 }}>— or —</div>
        <Button
          style={{
            width: 200,
            marginTop: 25,
            marginBottom: 40,
            marginRight: 20,
          }}
          variant="primary"
          type="submit"
          onClick={(e) => {
            history.push("/manual_join");
          }}
        >
          Join Manually
        </Button>

        <Button
          style={{ marginTop: 25, marginBottom: 40 }}
          variant="secondary"
          type="submit"
          onClick={(e) => {
            history.push("/invite?m=1&r=guest");
          }}
        >
          Join guest room
        </Button>
      </div>
    </Container>
  );
}
