function copyText(text) {
  let tx = document.createElement("textarea");
  document.body.appendChild(tx);
  tx.value = text;
  tx.select();
  document.execCommand("copy");
  document.body.removeChild(tx);
}

export default copyText;
