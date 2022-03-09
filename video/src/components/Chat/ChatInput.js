import { forwardRef, useEffect, useState } from "react";

const ChatInput = (
  {
    onTyping = () => {},
    debounceRate = 1200,
    value = undefined,
    onChange = null,
    ...props
  },
  ref
) => {
  let [timer, setTimer] = useState(null);
  useEffect(() => {}, []);
  function extendTypingTime() {
    if (timer === null) {
      // This is the first character user has input after rest
      onTyping(true);
      let typeTimer = setTimeout(() => {
        onTyping(false);
        setTimer(null);
      }, debounceRate);
      setTimer(typeTimer);
    } else {
      clearTimeout(timer);
      let typeTimer = setTimeout(() => {
        onTyping(false);
        setTimer(null);
      }, debounceRate);
      setTimer(typeTimer);
    }
  }

  function stopTyping() {
    if (timer !== null) clearTimeout(timer);
    onTyping(false);
    setTimer(null);
  }

  return (
    <input
      ref={ref}
      onBlur={() => {
        stopTyping();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          stopTyping();
        }
        extendTypingTime();
      }}
      value={value}
      onChange={(e) => {
        onChange && onChange(e);
      }}
      {...props}
    ></input>
  );
};

export default forwardRef(ChatInput);
