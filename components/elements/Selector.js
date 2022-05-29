import {Button, Text, Overlay} from '@rneui/base';
import React, {useState} from 'react';

export default function Selector({
  items = [],
  placeholder = 'Select from below',
  onChange = () => {},
  value,
}) {
  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  return (
    <>
      <Button
        onPress={e => {
          toggleOverlay();
        }}>
        Layout: ({value})
      </Button>

      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <Text style={{fontSize: 22}}>Layout</Text>
        {items.map(i => {
          if (typeof i === 'object')
            return (
              <Text
                key={i.value}
                style={{color: 'white'}}
                onPress={e => {
                  onChange(i.value);
                  setVisible(false);
                }}>
                {i.name}
              </Text>
            );
          return (
            <Text
              key={i}
              style={{color: 'white'}}
              onPress={e => {
                onChange(i);
                setVisible(false);
              }}>
              {i}
            </Text>
          );
        })}
      </Overlay>
    </>
  );
}
