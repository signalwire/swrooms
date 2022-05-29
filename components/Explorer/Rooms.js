import React, {useCallback, useEffect, useState} from 'react';
// import {Card, Container} from 'react-bootstrap';
import PreviewElement from './PreviewElement';
import socket from '../socket.js';
import {View, Text, TouchableOpacity} from 'react-native';
import {Card} from '@rneui/base';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {CardBase} from '@rneui/base/dist/Card/Card';
// import {useHistory} from 'react-router-dom';
// import './rooms.css';
// import NotActivated from '../NotActivated';

export default function Rooms({navigation}) {
  let [roomList, setRoomList] = useState([]);
  // let history = useHistory();
  useFocusEffect(
    useCallback(() => {
      async function getInfo() {
        socket.emit('public_messages');
        socket.on('rooms_updated', rooms => {
          if (rooms.roomSessions) {
            console.log(
              rooms.roomSessions.length,
              'Rooms received from socket',
            );
            setRoomList(rooms);
          }
        });
      }
      getInfo();
    }, []),
  );
  if (roomList.roomSessions === undefined) {
    //We haven't received a socket reply yet
    return (
      <View
        style={{
          height: 244,
          background: '#eee',
          color: '#aaa',
          fontWeight: 'bolder',
          fontSize: '2.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>Loading ... </Text>
      </View>
    );
  } else if (roomList.roomSessions.length === 0) {
    // No rooms in session
    return (
      <View
        style={{
          height: 244,
          background: '#eee',
          color: '#aaa',
          fontWeight: 'bolder',
          fontSize: '2.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>No ongoing rooms</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        marginTop: 20,
      }}>
      {roomList.roomSessions.map(room => (
        <View
          key={room.id}
          style={{
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={e => {
              navigation.navigate('Invite', {room: room.name, mod: true});
            }}>
            <Card
              style={{
                // flexBasis: 240,
                backgroundColor: '#eeeeee',
                cursor: 'pointer',
              }}
              onPress={e => {
                // history.push('/invite?m=1&r=' + encodeURIComponent(room.name));
              }}>
              <Card.Title style={{fontSize: 20}}>{room.name}</Card.Title>
              <PreviewElement src={room.preview_url} />
            </Card>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
