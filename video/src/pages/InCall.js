import React, { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Video from "../components/Video";
import Select from "../components/Select";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Events from "../components/Events";
import InviteButton from "../components/Invite.js";
import Participants from "../components/Partcipants";
import NavBar from "react-bootstrap/Navbar";
import { Helmet } from "react-helmet";
import Chat from "../components/Chat";
import {
  MdMic,
  MdMicOff,
  MdVideocam as VideocamIcon,
  MdVideocamOff,
  MdVolumeOff,
  MdVolumeUp,
} from "react-icons/md";

import { useHistory, useLocation } from "react-router";
import SplitButtonMenu from "../components/SplitButton.js";
import ScreenShareButton from "../components/ShareScreenButton";
import useScreenSize from "use-screen-size";
import isObjEmpty from "../Utils/isObjEmpty";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function InCall({
  roomDetails,
  space,
  setRoomDetails = () => {},
}) {
  let size = useScreenSize();
  let history = useHistory();
  let [layouts, setLayouts] = useState([]);
  let [curLayout, setCurLayout] = useState();

  let [cameras, setCameras] = useState([]);
  let [microphones, setMicrophones] = useState([]);
  let [speakers, setSpeakers] = useState([]);

  let [room, setRoom] = useState({});
  let [event, setEvent] = useState(null);
  let [thisMemberId, setThisMemberId] = useState(null);

  let [audioMuted, setAudioMuted] = useState(false);
  let [videoMuted, setVideoMuted] = useState(false);
  let [speakerMuted, setSpeakerMuted] = useState(false);

  let [memberList, setMemberList] = useState([]);

  let [, setUpdateSignal] = useState(true);
  const updateView = () => setUpdateSignal((x) => !x);

  let logEvent = useCallback((msg, title, variant) => {
    console.log("Displaying toast for", msg, title, variant);
    setEvent({ text: msg, title, variant });
  }, []);
  let onRoomInit = useCallback(
    (room, layouts, cameras, microphones, speakers) => {
      setLayouts(layouts);
      setCameras(cameras);
      setMicrophones(microphones);
      setSpeakers(speakers);
      setRoom(room);
    },
    []
  );
  let onRoomUpdate = useCallback(
    (updatedValues) => {
      if (updatedValues.cameras !== undefined)
        setCameras(updatedValues.cameras);
      if (updatedValues.speakers !== undefined)
        setSpeakers(updatedValues.speakers);
      if (updatedValues.microphones !== undefined)
        setMicrophones(updatedValues.microphones);
      if (updatedValues.left === true) history.push("/");
      if (updatedValues.thisMemberId !== undefined) {
        console.log("SETTING THIS MEMBER ID", updatedValues.thisMemberId);
        setThisMemberId(updatedValues.thisMemberId);
      }
      if (updatedValues.layout !== undefined)
        setCurLayout(updatedValues.layout);
      if (updatedValues.member !== undefined) {
        let mem = updatedValues.member;
        console.log("Current User", mem, thisMemberId);
        if (mem.self) {
          setAudioMuted(mem.audio_muted);
          setVideoMuted(mem.video_muted);
          setSpeakerMuted(mem.deaf);
        }
      }
    },
    [history, thisMemberId]
  );

  let query = useQuery();
  let location = useLocation();
  useEffect(() => {
    if (roomDetails === undefined) {
      let r = query.get("r");
      let n = query.get("u");
      let mod = query.get("mod");
      console.log(r, n, mod, "on join");
      setRoomDetails({ room: r, name: n, mod: mod === "true" });
    }
  }, [location, query, history, roomDetails, setRoomDetails]);

  useEffect(() => {
    console.log("This is memberlist which has been updated", memberList);
    memberList.forEach((member) => {});
  }, [memberList]);

  return (
    <>
      <Helmet>
        <title>{roomDetails.room} - SignalWire Rooms</title>
      </Helmet>
      <Chat
        user_id={thisMemberId}
        room_id={room?.roomId}
        memberName={memberList?.find((x) => x.id === thisMemberId)?.name}
      />
      <Container fluid>
        <Row className="mt-3">
          <Col
            style={{ backgroundColor: "black" }}
            className="justify-content-md-center"
            sm="auto"
            xs="auto"
          >
            {roomDetails.mod ? "Moderator" : "normal uwer"}
            <Video
              space={space}
              onRoomInit={onRoomInit}
              onRoomUpdate={onRoomUpdate}
              joinDetails={roomDetails}
              eventLogger={logEvent}
              width={0.65 * size.width}
              onMemberListUpdate={useCallback((list) => {
                setMemberList(list);
              }, [])}
            />
            <Events log={event} />
          </Col>
          <Col className="col">
            <Participants
              memberList={memberList}
              mod={roomDetails.mod}
              onMemberUpdate={async (event) => {
                if (isObjEmpty(room)) return;
                if (event.action === "remove") {
                  if (room === undefined || room === null) return;
                  console.log("Removing Member", event.id);
                  await room.removeMember({ memberId: event.id });
                  console.log("Removed member", event.id);
                  if (event.id === thisMemberId) history.push("/");
                } else if (event.action === "mute_video") {
                  await room.videoMute({ memberId: event.id });
                  if (event.id === thisMemberId) setVideoMuted(true);
                } else if (event.action === "mute_audio") {
                  await room.audioMute({ memberId: event.id });
                  if (event.id === thisMemberId) setAudioMuted(true);
                } else if (event.action === "unmute_audio") {
                  await room.audioUnmute({ memberId: event.id });
                  if (event.id === thisMemberId) setAudioMuted(false);
                } else if (event.action === "unmute_video") {
                  await room.videoUnmute({ memberId: event.id });
                  if (event.id === thisMemberId) setVideoMuted(false);
                }
              }}
            />
          </Col>
        </Row>
      </Container>

      <NavBar fixed="bottom">
        <Container fluid className="justify-content-md-center">
          <Row>
            <Col xs="auto" style={{ marginTop: 5 }}>
              <SplitButtonMenu
                muted={videoMuted}
                setMuted={async (value) => {
                  if (isObjEmpty(room)) return;
                  if (value) {
                    await room.videoMute();
                    setVideoMuted(true);
                  } else {
                    await room.videoUnmute();
                    setVideoMuted(false);
                  }
                }}
                deviceName="Camera"
                devices={cameras}
                pickDevice={async (id) => {
                  if (isObjEmpty(room)) return;
                  await room.updateCamera({ deviceId: id });
                  updateView();
                }}
                unmuteIcon={() => <MdVideocamOff />}
                muteIcon={() => <VideocamIcon />}
              />
            </Col>

            <Col xs="auto" style={{ marginTop: 5 }}>
              <SplitButtonMenu
                muted={audioMuted}
                setMuted={async (value) => {
                  if (isObjEmpty(room)) return;
                  if (value) {
                    await room.audioMute();
                    setAudioMuted(true);
                  } else {
                    await room.audioUnmute();
                    setAudioMuted(false);
                  }
                }}
                deviceName="Microphone"
                devices={microphones}
                pickDevice={async (id) => {
                  if (isObjEmpty(room)) return;
                  await room.updateMicrophone({ deviceId: id });
                  updateView();
                }}
                unmuteIcon={() => <MdMicOff />}
                muteIcon={() => <MdMic />}
              />
            </Col>

            <Col xs="auto" style={{ marginTop: 5 }}>
              <SplitButtonMenu
                muted={speakerMuted}
                setMuted={async (value) => {
                  if (isObjEmpty(room)) return;
                  if (value) {
                    await room.deaf();
                    setSpeakerMuted(true);
                  } else {
                    await room.undeaf();
                    setSpeakerMuted(false);
                  }
                }}
                deviceName="Speaker"
                devices={speakers}
                pickDevice={async (id) => {
                  if (isObjEmpty(room)) return;
                  await room.updateSpeaker({ deviceId: id });
                  updateView();
                }}
                unmuteIcon={() => <MdVolumeOff />}
                muteIcon={() => <MdVolumeUp />}
              />
            </Col>

            {roomDetails.mod && (
              <Col xs="auto" style={{ marginTop: 5 }}>
                <Select
                  items={layouts}
                  placeholder="Select Layout"
                  value={curLayout}
                  onChange={async (value) => {
                    console.log("Layout: ", value);
                    if (isObjEmpty(room)) return;
                    await room.setLayout({ name: value });
                    setCurLayout(value);
                  }}
                />
              </Col>
            )}

            <Col xs="auto" style={{ marginTop: 5 }}>
              <InviteButton
                mod={roomDetails.mod}
                room={roomDetails.room}
                eventLogger={logEvent}
              />
            </Col>
            <Col xs="auto" style={{ marginTop: 5 }}>
              <ScreenShareButton room={room} />
            </Col>
            <Col xs="auto" style={{ marginTop: 5 }}>
              <Button
                onClick={async () => {
                  console.log(room);
                  if (isObjEmpty(room)) return;
                  await room.leave();
                  history.push("/");
                }}
                variant="danger"
              >
                Leave
              </Button>
            </Col>
          </Row>
        </Container>
      </NavBar>
    </>
  );
}
