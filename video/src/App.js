import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import VideoApp from "./sites/App";

import Register from "./sites/Register";

const validHosts = ["localhost", "swrooms", "swroomslocal", "www"];

function App() {
  let domain = window.location.hostname.split(".")[0];
  if (validHosts.includes(domain.toLowerCase())) return <Register />;
  else return <VideoApp space={domain} />;
}

export default App;
