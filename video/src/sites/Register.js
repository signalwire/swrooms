import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../components/Header.js";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Register() {
  const [spaceName, setSpaceName] = useState("");
  const [admin, setAdmin] = useState(false);
  return (
    <>
      <Header />
      <Container>
        <Row className="justify-content-md-center">
          <Col lg={4} className="mt-5 mb-2">
            <h3>Welcome to SWrooms.com</h3>
            <p>Host video conferences and calls in your own space.</p>
            <p>
              If you have a SignalWire space account, please use that below to
              get to your Admin page and start creating rooms.
            </p>
            <p>
              If you haven't yet created a SignalWire account yet, our{" "}
              <a href="https://developer.signalwire.com/apis/docs/signing-up-for-a-space">
                guides
              </a>{" "}
              have all that you'll need to know.
            </p>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group className="mb-3" controlId="VideoCallName">
                <Form.Label>Space Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your SignalWire username"
                  onChange={(e) => setSpaceName(e.target.value)}
                  value={spaceName}
                  pattern="[^' ']+"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="VideoRoom">
                <Form.Check
                  label="Take me to my Admin Page"
                  type="checkbox"
                  placeholder="API Key"
                  onChange={(e) => setAdmin(e.target.checked)}
                  checked={admin}
                  required
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                onClick={() => {
                  if (spaceName !== "") {
                    if (admin)
                      window.location.href = `${window.location.protocol}//${spaceName}.${window.location.host}/admin`;
                    else
                      window.location.href = `${window.location.protocol}//${spaceName}.${window.location.host}/`;
                  } else {
                    alert("Please fill all fields.");
                  }
                }}
              >
                Join
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Register;
