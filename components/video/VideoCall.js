import 'react-native-get-random-values';
import React, {useState, useEffect} from 'react';
import {Button, Text} from 'react-native';
import {Video} from '@signalwire/js';
import InCallManager from 'react-native-incall-manager';
import {RTCView} from 'react-native-webrtc';

export default function VideoCall({token}) {
  let [stream, setStream] = useState(null);
  let [roomSession, setRoomSession] = useState(null);

  useEffect(() => {
    async function checkPermission() {
      if (InCallManager.recordPermission !== 'granted') {
        try {
          let result = await InCallManager.requestRecordPermission();
          console.log('Requested Record Permission', result);
        } catch (e) {
          console.log('RecordPermission Requested, but error', e);
        }
      }
    }
    checkPermission();
  }, []);

  InCallManager.start({media: 'audio'});

  async function start() {
    console.log(token);
    const room = new Video.RoomSession({
      token,
      logLevel: 'silent',
      audio: false,
    });
    setRoomSession(room);
    room.on('room.joined', params => {
      console.log('room.joined', params);
      setStream(room.remoteStream);
    });
    try {
      await room.join();
    } catch (e) {
      console.log('error joining room', e);
    }
  }

  return (
    <>
      <Button
        onPress={e => {
          start();
        }}
        title="Join"
      />
      {stream && (
        <>
          <RTCView
            streamURL={stream.toURL()}
            style={{
              marginVertical: 10,
              top: 0,
              position: 'absolute',
              height: '30%',
              width: '100%',
            }}
          />
        </>
      )}
    </>
  );
}
