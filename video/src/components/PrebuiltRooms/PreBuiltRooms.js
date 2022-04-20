import { useEffect, useState } from "react";
import ReadyRoom from "./ReadyRoom";
import ReadyRoomVideo from "./ReadyRoomVideo";
import ReadyRoomEmbed from "./ReadyRoomEmbed";
import InCall from "./PreBuiltInCall";

function PrebuiltRooms() {
  const [roomSession, setRoomSession] = useState(null);
  useEffect(() => {
    if (roomSession === null) return;
    console.log(roomSession);
    roomSession.on("room.joined", (roomInfo) => {
      console.log("Room has been joined", roomInfo);
    });
    roomSession.on("memberList.updated", (m) => {
      console.log("updated memberlist", m);
    });
  });
  return (
    <>
      {/* <ReadyRoom token="vpt_22bd83e329d34a2ccd083fe90b0dadfd" user="Nirav" /> */}
      <ReadyRoomEmbed
        onRoomReady={(rs) => {
          setRoomSession(rs);
        }}
      />
    </>
  );
}

export default function PrebuiltRooms2() {
  return <InCall />;
}
