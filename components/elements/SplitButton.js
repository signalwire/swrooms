import React, {useState} from 'react';
// import Dropdown from "react-bootstrap/Dropdown";

import {Button, Overlay, Icon} from '@rneui/base';
import {ButtonGroup} from '@rneui/themed';
import {View, Text, StyleSheet} from 'react-native';

export default function SplitButtonMenu({
  muted = false,
  setMuted = () => {},
  muteIcon = () => <></>,
  unmuteIcon = () => <></>,
  deviceName = 'device',
  devices = [],
  pickDevice = () => {},
}) {
  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  return (
    <>
      <View style={{width: 90, height: 30, marginTop: -6}}>
        <ButtonGroup
          selectedIndex={muted ? undefined : 0}
          selectedButtonStyle={{backgroundColor: 'blue'}}
          buttonStyle={{backgroundColor: muted ? 'red' : 'blue'}}
          buttons={[
            {
              element: muted
                ? () => muteIcon('white')
                : () => unmuteIcon('white'),
            },
            {
              element: () => (
                <Icon name="expand-less" type="material" color="white"></Icon>
              ),
            },
          ]}
          onPress={index => {
            if (index === 0) {
              setMuted(!muted);
            } else {
              toggleOverlay();
            }
          }}
          style={{width: 100}}
        />
      </View>

      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        {devices !== undefined && devices.length > 1 ? (
          <>
            <Text style={{color: 'white'}}>Select a device</Text>
            {devices.map(c => (
              <Button
                key={c.deviceId}
                onPress={() => {
                  pickDevice(c.deviceId);
                }}
                title={c.label}></Button>
            ))}
          </>
        ) : (
          <Text style={{color: 'white'}}>Only one {deviceName} found</Text>
        )}
      </Overlay>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 10,
  },
  textPrimary: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  textSecondary: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 17,
  },
});
