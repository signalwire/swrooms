import React from "react";
import { MdDelete } from "react-icons/md";
import Table from "react-bootstrap/Table";
import { Button } from "react-bootstrap";
import copyLink from "../Utils/copyLink.js";
import generateLink from "../Utils/generateLink.js";

export function RoomTable(
  rooms,
  onDelete = () => {},
  space,
  onEvent = () => {}
) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Room</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rooms.data?.map((room) => (
          <tr key={room.id}>
            <td>
              <a
                href={`/join?r=${room.name}&u=${space}`}
                target="_blank"
                rel="noreferrer"
              >
                {room.display_name}
              </a>
            </td>
            <td>
              <Button
                size="sm"
                onClick={() => {
                  console.log(room);
                  copyLink(generateLink(room.name, true));
                  onEvent({
                    title: "Link copied for " + room.display_name,
                    text: generateLink(room.name, "mod"),
                  });
                }}
              >
                Invite (Mod)
              </Button>{" "}
              <Button
                size="sm"
                onClick={() => {
                  copyLink(generateLink(room.name));
                  onEvent({
                    title: "Link copied for " + room.display_name,
                    text: generateLink(room.name),
                  });
                }}
              >
                Invite
              </Button>{" "}
              <Button
                size="sm"
                onClick={() => {
                  onDelete(room.id);
                }}
              >
                <MdDelete />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
