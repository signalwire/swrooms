import { Container, Row, Col } from "react-bootstrap";
import ReactLoading from "react-loading";
export default function NotActivated({ loading }) {
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col lg={4} className="mt-5 mb-2">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 40,
              }}
            >
              <div>
                <ReactLoading
                  type="spin"
                  color="#f72b73"
                  height={60}
                  width={60}
                />
              </div>
            </div>
          ) : (
            <div>
              We're sorry. This SignalWire space doesn't exist, or hasn't been
              activated by user. <br />
              If you're the owner of this space, please activate your space by
              heading to the <a href="/admin_login">Admin page</a>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
