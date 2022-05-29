import {StackActions} from '@react-navigation/native';
import React, {useState} from 'react';
import InCall from '../video/InCall';

export default function ({navigation, route}) {
  return (
    <InCall
      onRoomEnd={() => {
        console.log('Navigating to home');
        // navigation.dispatch(StackActions.popToTop());
        navigation.navigate('Home', {});
      }}
      roomDetails={{
        space: route?.params?.space,
        room: route?.params?.room,
        name: route?.params?.name,
        mod: route?.params?.mod,
      }}
    />
  );
}
