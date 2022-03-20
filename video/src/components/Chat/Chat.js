import { Button, Form } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { MdChat, MdClose, MdRefresh } from "react-icons/md";
import Linkify from "react-linkify";
import TypingDots from "./TypingDots";
import debounce from "debounce";
import { ChatMessage } from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function Chat({
  onNewMessage = () => {},
  messages = [],
  typing = false, // others are typing
  onTyping = () => {}, // user is typing
  canLoadMore = false,
  loading = true,
  scrollChatBottom,
  showBadge,
  onBadgeSeen,
}) {
  let [chatOn, setChatOn] = useState(true);
  const [loadMoreIntensity, setLoadMoreIntensity] = useState(1);
  const [chatText, setChatText] = useState("");
  // const [showBadge, setShowBadge] = useState(false);
  const toggleChat = () => setChatOn(!chatOn);

  useEffect(() => {
    // The Chat box is on so the badge is not needed
    if (chatOn && showBadge) onBadgeSeen();
  }, [showBadge, chatOn]);

  useEffect(() => {
    if (chatTextContainer.current === null) return;
    let chatscroller = chatTextContainer.current;
    const onScroll = debounce(() => {
      if (chatscroller.scrollTop < 30) {
        setLoadMoreIntensity(chatscroller.scrollTop / 30);
      }
    }, 10);
    chatscroller.addEventListener("scroll", onScroll);
    return () => chatscroller.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (chatTextContainer.current === null) return;
    console.log("Scrolling to Bottom");
    chatTextContainer.current.scrollTop =
      chatTextContainer.current.scrollHeight;

    function scrollToBottom() {
      // if (chatTextContainer.current) {
      chatTextContainer.current.scrollTop =
        chatTextContainer.current.scrollHeight;
      // }
    }
    scrollToBottom();
  }, [messages, scrollChatBottom, chatOn]);

  let chatTextContainer = useRef(null);

  return (
    <>
      {!loading && chatOn && (
        <div
          style={{
            width: 350,
            height: "60vh",
            position: "fixed",
            right: 30,
            bottom: 80,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontSize: "0.9em",
            background: "#fff",
            zIndex: 100000000,
          }}
        >
          <div
            style={{
              flex: 1,
              // display: "flex",
              // flexDirection: "column",
              overflowY: "auto",

              border: "2px solid #ccc",
              borderBottom: 0,
              borderRadius: "5px 5px 0 0",
            }}
            ref={chatTextContainer}
          >
            <div
              style={{
                minHeight: "calc(60vh)",
                // maxHeight: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {canLoadMore && (
                <div
                  style={{
                    padding: 10,
                    height: 60,
                    background: "blue",
                    opacity: 1 - loadMoreIntensity ?? 0,
                  }}
                >
                  Load more
                </div>
              )}
              <div style={{ flex: 1 }}></div>
              {messages.map((i) => (
                <ChatMessage key={i.id}>{i}</ChatMessage>
              ))}
            </div>
            {typing && (
              <div
                style={{
                  background: "white",
                  paddingLeft: 20,
                  position: "sticky",
                  bottom: 0,
                }}
              >
                <TypingDots />
              </div>
            )}
          </div>
          <div
            style={{
              border: "2px solid #ccc",
              borderTop: 0,
              borderRadius: "0 0 6px 6px",
            }}
          >
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                let content = e.target.childNodes[0].value.trim();
                if (content === "") return;
                e.target.childNodes[0].value = "";
                let data = onNewMessage({ content });
              }}
            >
              {/* <Form.Control placeholder="Aa" /> */}
              <Form.Control
                placeholder="Aa"
                as={ChatInput}
                onTyping={(t) => {
                  onTyping(t);
                }}
              />
            </Form>
          </div>
        </div>
      )}
      <div
        style={{
          position: "relative",
          position: "fixed",
          right: 30,
          bottom: 30,
          zIndex: 100000000,
        }}
      >
        {showBadge && (
          <div
            style={{
              width: 15,
              height: 15,
              borderRadius: 10,
              background: "red",
              position: "absolute",
              top: -6,
              right: -6,
            }}
          ></div>
        )}
        <Button
          style={{}}
          onClick={(e) => {
            if (!loading) toggleChat();
          }}
          disabled={loading}
        >
          {loading ? <MdRefresh /> : chatOn ? <MdClose /> : <MdChat />}
        </Button>
      </div>
    </>
  );
}
