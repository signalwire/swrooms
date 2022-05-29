import React, {useState} from 'react';
import isObjEmpty from '../../utils/isObjEmpty';
import {Button} from '@rneui/base';
import {NativeModules} from 'react-native';

export default function ScreenShareButton({room}) {
  const {InteractionModule} = NativeModules;
  let [screenShareObj, setScreenShareObj] = useState();
  return (
    <Button
      onPress={async () => {
        if (room === undefined || room === null) {
          setScreenShareObj(undefined);
          return;
        }
        if (screenShareObj === undefined) {
          let sc;
          if (isObjEmpty(room)) return;
          try {
            InteractionModule.launch();
            sc = await room.startScreenShare();
          } catch (e) {
            setScreenShareObj(undefined);
            console.log(e);
            return;
          }
          setScreenShareObj(sc);
        } else {
          try {
            screenShareObj.leave();
            InteractionModule.abort();
          } catch (e) {
            console.log(e);
          }
          setScreenShareObj(undefined);
        }
      }}>
      {screenShareObj === undefined
        ? 'Share Screen'
        : 'Turn off Screen Sharing'}
    </Button>
  );
}
