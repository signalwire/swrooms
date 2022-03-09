import { useState, useEffect } from "react";
import ChatWidget from "./Chat";
import { get_chat_token } from "../../Utils/apicalls";
import { Chat } from "@signalwire/js";

export default function ChatController({
  user_id,
  room_id,
  memberNames,
  memberName,
}) {
  let [chatClient, setChatClient] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingPeople, setTypingPeople] = useState([]);
  let [loading, setLoading] = useState(true);
  //   const [messages, setMessages] = useState([]);
  let [messages, setMessages] = useState([]);

  const addMessage = (newmsg) => {
    setMessages((msg) => [...msg, newmsg]);
  };

  useEffect(() => {
    async function chatSetup() {
      setLoading(true);
      console.log(room_id, user_id);
      if (room_id === undefined || user_id === undefined) return;
      let token = await get_chat_token(room_id, memberName + "---" + user_id);
      // let token = await get_chat_token(room_id, user_id);
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
        let sender_data = message.member.id;
        console.log(sender_data);
        let sender_name = message.member.id.split("---")[0];
        let sender_id = message.member.id.split("---")[1];
        console.log("Message received", message.member);
        console.log(sender_name);
        if (user_id === sender_id) message.member.sentByMe = true;
        // console.log(memberNames);
        // let memberName = memberNames.find((x) => x.id === sender_id)?.name;
        message.member.name = sender_name;
        setMessages((m) => [...m, message]);
      });

      chatClient.on("member.updated", (member) => {
        if (member.id === memberName + "---" + user_id) return;
        let typername = member.id.split("---")[0];
        setTypingPeople((t) => {
          let newT = [...t, typername];
          let x = [...new Set(newT)];
          return x;
        });
        setTyping(member.state.typing);
      });

      await chatClient.subscribe(room_id);

      const history = await chatClient.getMessages({ channel: room_id });
      history.messages.reverse().forEach((message) => {
        // let sender_id = message.member.id;
        console.log(memberNames);
        // let memberName = memberNames.find((x) => x.id === sender_id)?.name;
        // message.member.name = memberName;
        let sender_name = message.member.id.split("---")[0];
        console.log("history", message);
        message.member.name = sender_name;
        setMessages((m) => [...m, message]);
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
    <ChatWidget
      loading={loading}
      typing={typing}
      onNewMessage={async (m) => {
        if (chatClient === null || chatClient === undefined) return;
        console.log("Sending message", m);
        await chatClient.publish({
          channel: room_id,
          content: m.content,
        });
        // addMessage({m});
      }}
      messages={messages}
      onOverScroll={() => {
        console.log("overScrolled");
      }}
      canLoadMore={true}
      onTyping={(e) => {
        if (chatClient === null || chatClient === undefined) return;
        chatClient.setMemberState({ channels: room_id, state: { typing: e } });
      }}
    />
  );
}
