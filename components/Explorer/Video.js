import { useEffect, useRef } from "react";
export default function AutoPlaySilentVideo(props) {
  const videoRef = useRef(undefined);
  useEffect(() => {
    videoRef.current.defaultMuted = true;
  });
  return (
    <video
      className={props.className}
      ref={videoRef}
      loop
      autoPlay
      muted
      playsInline
      {...props}
    >
      <source src={props.video} type="video/mp4" />
    </video>
  );
}
