import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import generateLink from "../Utils/generateLink";
import copyLink from "../Utils/copyLink.js";

export default function InviteButton({
  room = "room",
  mod,
  eventLogger = (msg) => {
    console.log("InviteEvent", msg);
  },
}) {
  return (
    <>
      <Dropdown drop="up">
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          Invite
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Header>As guest</Dropdown.Header>
          <Dropdown.Item
            onClick={() => {
              copyLink(generateLink(room));
              eventLogger(
                "The link " + generateLink(room) + " copied to clipboard.",
                "Link copied",
                "info"
              );
            }}
          >
            {generateLink(room)}
          </Dropdown.Item>
          {mod && (
            <>
              <Dropdown.Header>As moderator</Dropdown.Header>
              <Dropdown.Item
                onClick={() => {
                  copyLink(generateLink(room, mod));
                  eventLogger(
                    "The link " +
                      generateLink(room, mod) +
                      " copied to clipboard.",
                    "Link copied",
                    "info"
                  );
                }}
              >
                {generateLink(room, "mod")}
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
