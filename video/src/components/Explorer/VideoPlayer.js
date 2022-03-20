import React, { useEffect, useState, useRef } from "react";

export default function VideoPlayer({
  src,
  refreshInterval = 30,
  maxRetries = 7,
}) {
  const mydiv = useRef(null);
  const [loading, setLoading] = useState(true);
  const [srcUrl, setSrcUrl] = useState(src);
  const [loadFail, setLoadFail] = useState(false);

  useEffect(() => {
    let timeoutD = null;
    let intervalD = null;
    async function refreshVideo(retryCount = 0) {
      if (loading) {
        const result = await fetch(src);
        if (result.status < 400) {
          setSrcUrl(src);
          setLoading(false);
        } else {
          // Try again in a sec
          if (retryCount < maxRetries) {
            if (timeoutD !== null) clearTimeout(timeoutD);
            timeoutD = setTimeout(() => {
              console.log("Retrying", retryCount);
              refreshVideo(retryCount + 1);
            }, 1500);
          } else {
            console.log("Couldn't load video preview.");
            setLoadFail(true);
          }
        }
      } else {
        const url = new URL(src);
        url.searchParams.set("t", +new Date());
        setSrcUrl(url.toString());
      }
    }
    refreshVideo();

    if (intervalD !== null) clearInterval(intervalD);
    intervalD = setInterval(() => {
      console.log("Checking if video is updated.");
      clearTimeout(timeoutD);
      refreshVideo();
    }, refreshInterval * 1000);

    return () => {
      if (intervalD !== null) clearInterval(intervalD);
      if (timeoutD !== null) clearTimeout(timeoutD);
      intervalD = null;
      timeoutD = null;
    };
  }, [src, refreshInterval, loading]);

  // needed to preserve the "muted" attribute
  // see https://github.com/facebook/react/issues/10389
  const videoElement = {
    __html: `<video src="${
      loading ? "https://hq.api.sw.work/media/loading_loop.mp4" : srcUrl
    }" autoPlay loop muted playsInline style="width: 100%;"></video>`,
  };

  if (srcUrl === null) {
    return (
      <div
        style={{
          background: "#eee",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 170,
          color: "#aaa",
        }}
      >
        Preview disabled for <br />
        this room
      </div>
    );
  }

  if (loadFail) {
    return (
      <div
        style={{
          background: "#eee",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 170,
          color: "#aaa",
        }}
      >
        Error Loading Preview
      </div>
    );
  }

  return <div ref={mydiv} dangerouslySetInnerHTML={videoElement}></div>;
}
