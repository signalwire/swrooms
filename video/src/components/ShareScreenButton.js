import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import isObjEmpty from "../Utils/isObjEmpty";

export default function ScreenShareButton({ room }) {
  let [screenShareObj, setScreenShareObj] = useState();
  return (
    <Button
      onClick={async () => {
        if (room === undefined || room === null) {
          setScreenShareObj(undefined);
          return;
        }
        if (screenShareObj === undefined) {
          let sc;
          if (isObjEmpty(room)) return;
          try {
            sc = await room.startScreenShare();
          } catch (e) {
            setScreenShareObj(undefined);
            console.log(e);
            return;
          }
          setScreenShareObj(sc);
        } else {
          try {
            screenShareObj.leave();
          } catch (e) {
            console.log(e);
          }
          setScreenShareObj(undefined);
        }
      }}
    >
      {screenShareObj === undefined
        ? "Share Screen"
        : "Turn off Screen Sharing"}
    </Button>
  );
}
