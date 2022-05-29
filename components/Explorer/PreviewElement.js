import {Card} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {View, Image, Text} from 'react-native';
function ErrorPlaceholder({children}) {
  return (
    <View
      style={{
        backgroundColor: '#eee',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 170,
        color: '#aaa',
      }}>
      <Text>{children}</Text>
    </View>
  );
}
export default function PreviewElement({
  src,
  refreshInterval = 15,
  maxRetries = 15,
}) {
  const [loading, setLoading] = useState(true);
  const [srcUrl, setSrcUrl] = useState(src);
  const [loadFail, setLoadFail] = useState(false);

  useEffect(() => {
    let timeoutD = null;
    let intervalD = null;
    async function refreshVideo(retryCount = 0) {
      if (loading) {
        const result = await fetch(src);
        if (result.status < 400) {
          setSrcUrl(src);
          setLoading(false);
        } else {
          // Try again in a sec
          if (retryCount < maxRetries) {
            if (timeoutD !== null) clearTimeout(timeoutD);
            timeoutD = setTimeout(() => {
              // console.log('Retrying', retryCount);
              refreshVideo(retryCount + 1);
            }, 1500);
          } else {
            console.log("Couldn't load video preview.");
            setLoadFail(true);
          }
        }
      } else {
        if (src === null || src === undefined) return;
        setSrcUrl(src + '?t=' + Date.now());
        // console.log('Set url', src);
      }
    }
    refreshVideo();

    if (intervalD !== null) clearInterval(intervalD);
    intervalD = setInterval(() => {
      // console.log('Checking if video is updated.');
      clearTimeout(timeoutD);
      refreshVideo();
    }, refreshInterval * 1000);

    return () => {
      if (intervalD !== null) clearInterval(intervalD);
      if (timeoutD !== null) clearTimeout(timeoutD);
      intervalD = null;
      timeoutD = null;
    };
  }, [src, refreshInterval, loading]);

  if (srcUrl === null)
    return <ErrorPlaceholder>Preview disabled for this room</ErrorPlaceholder>;

  if (loadFail)
    return <ErrorPlaceholder>Error Loading Preview</ErrorPlaceholder>;

  return (
    <Card.Image
      source={
        loading ? require('../swloading.gif') : {uri: srcUrl, cache: 'reload'}
      }
      style={{minWidth: '100%'}}
    />
  );
}
