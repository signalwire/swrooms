import React, { useEffect, useState } from "react";
function ErrorPlaceholder({ message }) {
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
      {/* Preview disabled for <br /> this room */}
      {message}
    </div>
  );
}
export default function PreviewElement({
  src,
  refreshInterval = 9,
  maxRetries = 7,
}) {
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

  if (srcUrl === null)
    return (
      <ErrorPlaceholder>
        Preview disabled for <br />
        this room
      </ErrorPlaceholder>
    );

  if (loadFail)
    return <ErrorPlaceholder>Error Loading Preview</ErrorPlaceholder>;

  return (
    <div>
      <img
        src={loading ? "/swloading.gif" : srcUrl}
        style={{ width: "100%", minHeight: 170 }}
      />
    </div>
  );
}
