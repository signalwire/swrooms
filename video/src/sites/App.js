import React, { useCallback, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../components/Header.js";

import {
  Switch,
  Route,
  useHistory,
  useLocation,
  Redirect,
} from "react-router-dom";

import JoinCallForm from "../components/JoinCallForm.js";
import InviteForm from "../components/InviteForm";
import InCall from "../pages/InCall.js";
import AdminLogin from "./AdminLogin.js";
import Admin from "./Admin.js";
import { get_public_rooms, is_activated } from "../Utils/apicalls.js";
import NotActivated from "../components/NotActivated.js";
import { Helmet } from "react-helmet";
import Rooms from "../components/Explorer/Rooms.js";
import Chat from "../components/Chat/Chat.js";
import ChatController from "../components/Chat/ChatController.js";
import ChatInput from "../components/Chat/ChatInput.js";
import TypingDots from "../components/Chat/TypingDots.js";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VideoApp({ space }) {
  let query = useQuery();
  let history = useHistory();

  let [typing, setTyping] = useState(false);
  let [roomDetails, setRoomDetails] = useState({});

  let [activated, setActivated] = useState(false);
  let [activatedRooms, setActivatedRooms] = useState([]);

  let [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/join") {
      let room = query.get("r");
      let name = query.get("u");
      console.log(room, name, "on join");
      setRoomDetails({ room, name, mod: true });
      history.push(`/in-call`);
    }
  }, [location, query, history]);
  useEffect(() => {
    setLoading(true);
    is_space_activated();

    async function is_space_activated() {
      if (location.pathname !== "/") {
        // no need to perform this check if not homepage
        return;
      }
      if (await is_activated({ space })) {
        let rooms = await get_public_rooms(space);
        console.log(rooms);
        if (rooms === false) {
          rooms = [];
        } else {
          rooms = rooms.data.map((r) => r.name);
          if (!rooms.includes("guest")) {
            rooms.push("guest");
          }
          setActivatedRooms(rooms);
        }

        console.log("activated");
        setActivated(true);
        setLoading(false);
      } else {
        setActivated(false);
        setLoading(false);
      }
    }
  }, [location, space]);

  const setRoomDetailsCallback = useCallback((x) => {
    setRoomDetails(x);
  }, []);

  return (
    <>
      <Helmet>
        <title>SignalWire Rooms</title>
      </Helmet>
      <Header />
      <Switch>
        <Route path="/admin">
          <Admin />
        </Route>

        <Route path="/chat_test">
          {/* <ChatController /> */}
          <>
            {typing && <TypingDots />}

            <ChatInput
              onTyping={(typing) => {
                setTyping(typing);
              }}
            />
          </>
        </Route>

        <Route path="/admin_login">
          <AdminLogin space={space} />
        </Route>

        <Route path="/rooms">
          {space === undefined ? <Redirect to="/" /> : <Rooms space={space} />}
        </Route>

        <Route path="/in-call">
          {roomDetails.name == undefined || roomDetails.room === undefined ? (
            <Redirect to="/" />
          ) : (
            <InCall
              roomDetails={roomDetails}
              space={space}
              setRoomDetails={setRoomDetailsCallback}
            />
          )}
        </Route>

        <Route path="/invite">
          <InviteForm
            mod={query.get("m") === "mod"}
            roomName={query.get("r")}
            onJoin={({ room, name, mod }) => {
              console.log(name, room, mod);
              setRoomDetails({ name, room, mod });
              console.log(history);
              history.push("/in-call");
            }}
          />
        </Route>
        <Route path="/">
          {loading ? (
            <NotActivated loading />
          ) : activated ? (
            <>
              <JoinCallForm
                rooms={activatedRooms}
                space={space}
                onJoin={({ room, name }) => {
                  console.log(name, room);
                  setRoomDetails({ name, room, mod: true });
                  console.log(history);
                  history.push("/in-call");
                }}
              />
            </>
          ) : (
            <NotActivated />
          )}
        </Route>
      </Switch>
    </>
  );
}

export default VideoApp;
