import Button from "react-bootstrap/Button";
export default function ActionButton({
  muted = false,
  setMuted = () => {},
  muteIcon = () => <></>,
  unmuteIcon = () => <></>,
}) {
  return (
    <Button
      variant={muted ? "danger" : "success"}
      onClick={async () => {
        if (muted) {
          setMuted(false);
        } else {
          setMuted(true);
        }
      }}
    >
      {muted ? unmuteIcon() : muteIcon()}
    </Button>
  );
}
