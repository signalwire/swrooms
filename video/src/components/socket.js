import io from "socket.io-client";
import { apiurl } from "../Utils/apiurl";
const socket = io(apiurl);

export default socket;
