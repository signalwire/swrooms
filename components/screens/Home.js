import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Rooms from '../Explorer/Rooms';
import {Button} from '@rneui/base';

export default function Home({navigation, space}) {
  return (
    <SafeAreaView style={{alignItems: 'center', ...StyleSheet.absoluteFill}}>
      <ScrollView
        style={{width: '100%'}}
        contentContainerStyle={{alignItems: 'center'}}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginTop: 10,
            marginBottom: 10,
          }}>
          Join a room
        </Text>
        <Text>
          Welcome to{' '}
          <Text style={{fontWeight: 'bold', color: '#f72b73'}}>
            {space ?? 'Nirav'}
          </Text>
          's video-calling platform.
        </Text>
        <Rooms navigation={navigation} />
        <View style={{color: '#aaa', marginTop: 25}}>
          <Text>— or —</Text>
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
          }}>
          <Button
            style={{
              width: 200,
              marginTop: 25,
              marginBottom: 40,
              marginRight: 20,
            }}
            onPress={e => {
              navigation.navigate('Join', {});
            }}>
            Join Manually
          </Button>
          <Text>{'      '}</Text>
          <Button
            style={{marginRight: 25}}
            onPress={e => {
              navigation.navigate('Invite', {room: 'guest', mod: true});
            }}>
            Join guest room
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
