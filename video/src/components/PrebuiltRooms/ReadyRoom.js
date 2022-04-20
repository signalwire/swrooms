import { useEffect, useRef } from "react";
import useScript from "./useScript";
import useStyle from "./useStyle";

export default function ReadyRoom({ token, theme = "light" }) {
  let scriptLoaded = useScript(
    "https://cdn.signalwire.com/video/rooms/index.js"
  );
  let styleLoaded = useStyle(
    "https://cdn.signalwire.com/video/rooms/signalwire.css"
  );
  let room = useRef();

  useEffect(() => {
    if (scriptLoaded === "ready" && token !== undefined) {
      room.current.params = {
        theme,
        token,
        setupRoomSession: (rs) => {
          console.log(rs);
          rs.on("room.joined", () => {
            rs.disableUI();
            rs.audioMute();
          });
        },
      };
      console.log(window._room);
    }
  }, [scriptLoaded, token]);
  return (
    <>
      {scriptLoaded} {styleLoaded}
      <ready-room ref={room} />
    </>
  );
}
