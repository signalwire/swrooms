import axios from "axios";
import { useState, useEffect } from "react";

function useStyle(src) {
  const [status, setStatus] = useState(src ? "loading" : "idle");

  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus("idle");
        return;
      }

      let style = document.querySelector(`link[href="${src}"]`);
      if (!style) {
        // Create script
        axios.get(src).then((response) => {
          console.log(response);
          style.innerHTML = response.data;
        });
        style = document.createElement("style");
        style.setAttribute("data-status", "loading");
        // Add script to document body
        document.head.appendChild(style);
        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event) => {
          style.setAttribute(
            "data-status",
            event.type === "load" ? "ready" : "error"
          );
        };
        style.addEventListener("load", setAttributeFromEvent);
        style.addEventListener("error", setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(style.getAttribute("data-status"));
      }
      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event) => {
        setStatus(event.type === "load" ? "ready" : "error");
      };
      // Add event listeners
      style.addEventListener("load", setStateFromEvent);
      style.addEventListener("error", setStateFromEvent);
      // Remove event listeners on cleanup
      return () => {
        if (style) {
          style.removeEventListener("load", setStateFromEvent);
          style.removeEventListener("error", setStateFromEvent);
        }
      };
    },
    [src] // Only re-run effect if script src changes
  );
  return status;
}

export default useStyle;
