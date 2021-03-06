import { useEffect, useState } from "react";
import { Widget, addResponseMessage } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";
import "./Chat.css";
import { get_chat_token } from "../Utils/apicalls";
import { Chat } from "@signalwire/js";

export default function ChatWidget({ room_id, user_id, memberName }) {
  let [chatClient, setChatClient] = useState(null);
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chatSetup() {
      console.log(room_id, user_id);
      if (room_id === undefined || user_id === undefined) return;
      let token = await get_chat_token(room_id, user_id);
      if (token === false) {
        console.log("NO TOKEN");
        return;
      }
      console.log(token);

      const chatClient = new Chat.Client({
        token, // get this from the REST APIs
      });
      setChatClient(chatClient);
      window.chatClient = chatClient;

      chatClient.on("message", (message) => {
        console.log("Message has arrived", message);
        let content = message.content;
        let sender_id = message.member.id;
        if (user_id === sender_id) return;
        addResponseMessage(content);
      });

      await chatClient.subscribe(room_id);

      const history = await chatClient.getMessages({ channel: room_id });
      history.messages.reverse().forEach((message) => {
        addResponseMessage(message.content);
      });
      console.log(history);

      setLoading(false);
    }
    try {
      chatSetup();
    } catch (e) {
      console.log(e);
    }
    return () => {
      setChatClient((chatClient) => {
        chatClient && chatClient.unsubscribe(room_id);
        return null;
      });
    };
  }, [room_id, user_id]);
  return (
    <>
      {loading ? (
        <></>
      ) : (
        <Widget
          title=""
          subtitle=""
          showTimeStamp
          launcherOpenImg="/chat.png"
          handleNewUserMessage={async (message) => {
            if (chatClient === null || chatClient === undefined) return;
            console.log(room_id);
            await chatClient.publish({
              channel: room_id,
              content: `**${memberName}**: ${message}`,
            });
          }}
        />
      )}
    </>
  );
}
