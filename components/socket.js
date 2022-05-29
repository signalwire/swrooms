import io from 'socket.io-client';
import {apiurl} from '../utils/apiurl';
const socket = io(apiurl);

export default socket;
