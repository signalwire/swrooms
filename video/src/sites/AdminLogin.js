import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { check_credentials, check_jwt } from "../Utils/apicalls.js";
import NotActivated from "../components/NotActivated.js";

function AdminLogin({ space }) {
  const [projectID, setProjectID] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    async function fetchData() {
      setLoading(true);
      let jwt = localStorage.getItem("jwt");
      if (jwt === null || jwt === undefined) {
        setLoading(false);
        return;
      }
      let jwt_validity = await check_jwt(jwt);
      if (jwt_validity.valid) window.location = "/admin";
      setLoading(false);
    }
  }, []);

  return (
    <>
      {loading ? (
        <NotActivated loading />
      ) : (
        <Container>
          <Row className="justify-content-md-center">
            <Col lg={4} className="mt-5 mb-2">
              <h3>Login as Admin</h3>
              <p>
                Get your API keys from your SignalWire space to unlock your own
                private, containerized rooms [Learn how]
              </p>
              <Form onSubmit={(e) => e.preventDefault()}>
                <Form.Group className="mb-3" controlId="VideoCallName">
                  <Form.Label>Project ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your SignalWire Project ID"
                    onChange={(e) => setProjectID(e.target.value)}
                    value={projectID}
                    pattern="[^' ']+"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="VideoCallName">
                  <Form.Label>API Token</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Your API token"
                    onChange={(e) => setApiToken(e.target.value)}
                    value={apiToken}
                    pattern="[^' ']+"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  onClick={async () => {
                    if (projectID !== "" && apiToken !== "") {
                      let jwt = await check_credentials({
                        projectid: projectID,
                        token: apiToken,
                        space,
                      });
                      if (jwt === false || jwt === undefined) {
                        alert("The credentials you provided are invalid");
                      } else {
                        localStorage.setItem("jwt", jwt);
                        window.location.href = "/admin";
                      }
                    } else {
                      alert("Please fill all fields");
                    }
                  }}
                >
                  Log in
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
}

export default AdminLogin;
