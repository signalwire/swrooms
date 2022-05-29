import React, {useEffect, useState, useCallback} from 'react';
import {get_token_for_video} from '../../utils/apicalls';
import AgnosticVideo from './AgnosticVideo';
import InCallManager from 'react-native-incall-manager';

import SplitButtonMenu from '../elements/SplitButton';

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
} from 'react-native';
import {Button} from '@rneui/base';
import {RTCView} from 'react-native-webrtc';
import Participants from './Participants';
import {Icon, Skeleton} from '@rneui/base';
import isObjEmpty from '../../utils/isObjEmpty';
import Selector from '../elements/Selector';
import {useFocusEffect} from '@react-navigation/native';
import ScreenShareButton from './ShareScreenButton';

export default function ({
  roomDetails = {mod: true},
  space,
  onRoomEnd: onUnmount = () => {},
  navigation,
}) {
  const [roomSession, setRoomSession] = useState(null);
  const [token, setToken] = useState(null);

  let history = {
    push(place) {
      //   console.log('TODO: HISOTRY PUSH');
      navigation.navigate(place);
    },
  };
  let [layouts, setLayouts] = useState([]);
  let [curLayout, setCurLayout] = useState();

  let [cameras, setCameras] = useState([]);
  let [microphones, setMicrophones] = useState([]);
  let [speakers, setSpeakers] = useState([]);

  let [thisMemberId, setThisMemberId] = useState(null);

  let [audioMuted, setAudioMuted] = useState(false);
  let [videoMuted, setVideoMuted] = useState(false);
  let [speakerMuted, setSpeakerMuted] = useState(false);

  let [memberList, setMemberList] = useState([]);

  let [, setUpdateSignal] = useState(true);
  const updateView = () => setUpdateSignal(x => !x);

  let logEvent = useCallback((msg, title, variant) => {
    console.log('Displaying toast for', msg, title, variant);
    if (title === undefined && msg === undefined) return;
    ToastAndroid.show(title ?? msg, ToastAndroid.SHORT);
  }, []);

  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      console.log('InCall Is focused');
      return () => {
        console.log("InCall Isn't focused anymore. DESTROYING EVERYTHING.");
        // Probably turn this off while debugging? (Every hot-reload will break connection)
        return;
        setIsFocused(false);
        if (
          roomSession !== null &&
          roomSession !== undefined &&
          !isObjEmpty(roomSession)
        ) {
          roomSession?.remoteStream.release();
          try {
            roomSession?.leave();
            InCallManager?.stop();
            setRoomSession(null);
          } catch (e) {}
        }
      };
    }, [roomSession]),
  );

  useEffect(() => {
    (async () => {
      let t = await get_token_for_video(roomDetails, space);
      if (t) {
        console.log('Token received', token?.substring(0, 10) + '...');
        setToken(t);
      } else {
        console.log('Token not received');
      }
    })();
  }, [roomDetails, space]);

  let onRoomInit = useCallback(
    (room, layouts, cameras, microphones, speakers) => {
      setLayouts(layouts);
      setCameras(cameras);
      setMicrophones(microphones);
      setSpeakers(speakers);
      //   setRoom(room);
    },
    [],
  );
  let onMemberListUpdate = useCallback(list => {
    setMemberList(list);
  }, []);

  let onRoomEnd = useCallback(() => {
    // InCallManager.stop();
    onUnmount();
  }, []);

  let onRoomJoined = useCallback(rs => {
    console.log('ROOM JOINED');
    setRoomSession(rs);
    updateView();
  }, []);
  let onRoomUpdate = useCallback(
    updatedValues => {
      if (updatedValues.cameras !== undefined)
        setCameras(updatedValues.cameras);
      if (updatedValues.speakers !== undefined)
        setSpeakers(updatedValues.speakers);
      if (updatedValues.microphones !== undefined)
        setMicrophones(updatedValues.microphones);
      if (updatedValues.left === true) history.push('Home');
      if (updatedValues.thisMemberId !== undefined) {
        // console.log('SETTING THIS MEMBER ID', updatedValues.thisMemberId);
        setThisMemberId(updatedValues.thisMemberId);
      }
      if (updatedValues.layout !== undefined)
        setCurLayout(updatedValues.layout);
      if (updatedValues.member !== undefined) {
        let mem = updatedValues.member;
        // console.log('Current User', mem, thisMemberId);
        if (mem.self) {
          setAudioMuted(mem.audio_muted);
          setVideoMuted(mem.video_muted);
          setSpeakerMuted(mem.deaf);
        }
      }
    },
    [history, thisMemberId],
  );

  return (
    <SafeAreaView
      style={{
        justifyContent: 'flex-start',
        ...StyleSheet.absoluteFill,
      }}>
      <View style={{width: Dimensions.get('window').width, height: 300}}>
        <AgnosticVideo
          token={token}
          eventLogger={logEvent}
          onRoomInit={onRoomInit}
          onRoomJoined={onRoomJoined}
          onRoomUpdate={onRoomUpdate}
          onRoomEnd={onRoomEnd}
          onMemberListUpdate={onMemberListUpdate}>
          {roomSession !== null && roomSession.remoteStream ? (
            <>
              <RTCView
                streamURL={roomSession.remoteStream.toURL()}
                style={{
                  top: 0,
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                }}
              />
            </>
          ) : (
            <View style={{}}>
              {/* <Text>Loading ...</Text> */}
              <Skeleton width="100%" height="100%" animation="pulse" />
            </View>
          )}
        </AgnosticVideo>
      </View>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Participants
          memberList={memberList}
          mod={roomDetails.mod}
          onMemberUpdate={async event => {
            if (isObjEmpty(roomSession)) return;
            if (event.action === 'remove') {
              if (roomSession === undefined || roomSession === null) return;
              console.log('Removing Member', event.id);
              await roomSession.removeMember({memberId: event.id});
              console.log('Removed member', event.id);
              if (event.id === thisMemberId) history.push('Home');
            } else if (event.action === 'mute_video') {
              await roomSession.videoMute({memberId: event.id});
              if (event.id === thisMemberId) setVideoMuted(true);
            } else if (event.action === 'mute_audio') {
              await roomSession.audioMute({memberId: event.id});
              if (event.id === thisMemberId) setAudioMuted(true);
            } else if (event.action === 'unmute_audio') {
              await roomSession.audioUnmute({memberId: event.id});
              if (event.id === thisMemberId) setAudioMuted(false);
            } else if (event.action === 'unmute_video') {
              await roomSession.videoUnmute({memberId: event.id});
              if (event.id === thisMemberId) setVideoMuted(false);
            }
          }}
        />
      </View>
      <View style={{flex: 1, flexDirection: 'row'}}></View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <SplitButtonMenu
          muted={audioMuted}
          setMuted={async value => {
            if (isObjEmpty(roomSession)) return;
            if (value) {
              await roomSession.audioMute();
              setAudioMuted(true);
            } else {
              await roomSession.audioUnmute();
              setAudioMuted(false);
            }
          }}
          deviceName="Microphone"
          devices={microphones}
          pickDevice={async id => {
            if (isObjEmpty(roomSession)) return;
            await roomSession.updateMicrophone({deviceId: id});
            updateView();
          }}
          unmuteIcon={(color = 'black') => (
            <Icon color={color} name="mic" type="material" />
          )}
          muteIcon={(color = 'black') => (
            <Icon color={color} name="mic-off" type="material" />
          )}
        />
        <SplitButtonMenu
          muted={videoMuted}
          setMuted={async value => {
            if (isObjEmpty(roomSession)) return;
            if (value) {
              await roomSession.videoMute();
              setVideoMuted(true);
            } else {
              await roomSession.videoUnmute();
              setVideoMuted(false);
            }
          }}
          deviceName="Camera"
          devices={cameras}
          pickDevice={async id => {
            if (isObjEmpty(roomSession)) return;
            await roomSession.updateCamera({deviceId: id});
            updateView();
          }}
          unmuteIcon={(color = 'black') => (
            <Icon color={color} name="videocam" type="material" />
          )}
          muteIcon={(color = 'black') => (
            <Icon color={color} name="videocam-off" type="material" />
          )}
        />

        <SplitButtonMenu
          muted={speakerMuted}
          setMuted={async value => {
            if (isObjEmpty(roomSession)) return;
            if (value) {
              await roomSession.deaf();
              setSpeakerMuted(true);
            } else {
              await roomSession.undeaf();
              setSpeakerMuted(false);
            }
          }}
          deviceName="Speaker"
          devices={speakers}
          pickDevice={async id => {
            if (isObjEmpty(roomSession)) return;
            await roomSession.updateSpeaker({deviceId: id});
            updateView();
          }}
          unmuteIcon={(color = 'black') => (
            <Icon color={color} name="volume-up" type="material" />
          )}
          muteIcon={(color = 'black') => (
            <Icon color={color} name="volume-off" type="material" />
          )}
        />

        <Button
          onPress={async () => {
            if (isObjEmpty(roomSession)) {
              console.log('UNMOUNTING (empty obj)');
              onUnmount();
              return;
            } else {
              console.log('UNMOUNTING');
              onUnmount();
            }
          }}
          color="error">
          Leave
        </Button>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 5,
          marginBottom: 5,
        }}>
        <ScreenShareButton room={roomSession} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginBottom: 5,
        }}>
        {roomDetails && roomDetails.mod && (
          <Selector
            items={layouts}
            placeholder="Select Layout"
            value={curLayout}
            onChange={async value => {
              console.log('Layout: ', value);
              if (isObjEmpty(roomSession)) return;
              await roomSession.setLayout({name: value});
              setCurLayout(value);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
