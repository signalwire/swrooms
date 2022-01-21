function generateLink(r, type = "normal") {
  if (type === "normal")
    return (
      window.location.protocol + "//" + window.location.host + "/invite?r=" + r
    );
  else if (type === "mod" || type === true) return generateLink(r) + "&m=mod";
}
export default generateLink;
