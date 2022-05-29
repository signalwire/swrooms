import {Button, Input, Text} from '@rneui/base';
import React, {useState} from 'react';
import {TextInput, View} from 'react-native';

export default function Invite({navigation, route}) {
  const [name, setName] = useState('');
  return (
    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
      <View
        style={{
          display: 'flex',
          width: '90%',
          justifyContent: 'center',
          alignItems: 'center',
          height: '90%',
        }}>
        <Text style={{fontSize: 25}}>Join Room</Text>
        <Text>
          Join <Text style={{fontWeight: 'bold'}}>{route.params.room}</Text>
          {route.params.mod === true ? ' as Moderator' : ''}
        </Text>
        <TextInput
          style={{
            width: '90%',
            height: 40,
            padding: 6,
            borderWidth: 1,
            borderColor: '#999',
            margin: 10,
          }}
          value={name}
          onChangeText={n => setName(n)}
          placeholder="Enter your name"
        />
        <Button
          onPress={x => {
            console.log(name, 'abd', route.params.room);
            navigation.navigate('InCall', {
              room: route.params.room,
              name: name,
              mod: route.params.mod ?? true,
            });
          }}>
          Join
        </Button>
      </View>
    </View>
  );
}
