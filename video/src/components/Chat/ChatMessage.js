import linkify from "markdown-linkify";
import Markdown from "react-markdown";
import hdate from "human-date";
import { useEffect, useState } from "react";

export function ChatMessage({ children }) {
  let content = (
    <Markdown
      allowedElements={["p", "strong", "em", "a", "s"]}
      linkTarget="_blank"
    >
      {linkify(children.content)}
    </Markdown>
  );

  let [relativeTime, setRelativeTime] = useState(null);
  // let [timer, setTimer] = useState(null);

  useEffect(() => {
    setRelativeTime(hdate.relativeTime(children.publishedAt));
    let t = setInterval(() => {
      setRelativeTime(hdate.relativeTime(children.publishedAt));
    }, 2000);
    // setTimer(t);
    return () => clearInterval(t);
  }, [children]);

  return (
    <div
      style={{
        padding: 20,
        borderBottom: "2px solid #ddd",
        background: children.member.sentByMe && "#efefef",
      }}
    >
      <div style={{ display: "flex" }}>
        <div>
          <div
            style={{
              fontSize: "0.9em",
              fontWeight: "bold",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: 65,
              marginRight: 10,
            }}
          >
            {children?.member?.name}
          </div>
          <div style={{ fontSize: 9, color: "#888" }}>
            {/* {children.publishedAt} */}
            {relativeTime}
          </div>
        </div>
        <div style={{ wordWrap: "break-word", width: "78%" }}>{content}</div>
      </div>
    </div>
  );
}
