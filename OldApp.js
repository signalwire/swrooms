import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import VideoCall from './components/video/VideoCall';
import VideoCallDaniele from './components/video/VideoCallDaniele';

const styles = StyleSheet.create({});
const backgroundStyle = StyleSheet.create({});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    // <VideoCallDaniele />
    <SafeAreaView
      style={{
        marginTop: 50,
        justifyContent: 'center',
        ...StyleSheet.absoluteFill,
      }}>
      <VideoCall token="eyJ0eXAiOiJWUlQiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE2NTMyNDkxMTAsImp0aSI6IjlhOGM2MjU5LTY2YTAtNDBjNC1iMTk0LWVkZTMzMzBmMWQ2ZSIsInN1YiI6ImMzYWQ3NzE2LTAxYjQtNGMzZi05N2FiLWRmMjIxMTM1YWFiMiIsInUiOiJzIiwiciI6Imd1ZXN0IiwicyI6WyJyb29tLmxpc3RfYXZhaWxhYmxlX2xheW91dHMiLCJyb29tLnNlbGYuYXVkaW9fbXV0ZSIsInJvb20uc2VsZi5hdWRpb191bm11dGUiLCJyb29tLnNlbGYudmlkZW9fbXV0ZSIsInJvb20uc2VsZi52aWRlb191bm11dGUiLCJyb29tLnNlbGYuZGVhZiIsInJvb20uc2VsZi51bmRlYWYiLCJyb29tLnNlbGYuc2V0X2lucHV0X3ZvbHVtZSIsInJvb20uc2VsZi5zZXRfb3V0cHV0X3ZvbHVtZSIsInJvb20uc2VsZi5zZXRfaW5wdXRfc2Vuc2l0aXZpdHkiLCJyb29tLmhpZGVfdmlkZW9fbXV0ZWQiLCJyb29tLnNob3dfdmlkZW9fbXV0ZWQiXSwiYWNyIjp0cnVlLCJlcnAiOnRydWUsIm10YSI6e30sInJtdGEiOnt9fQ.OkkLpwd-ZCSY8S0YZRRkQIhpXj8I4rB0p7VtkjMaYTUBxW6-xAuYvpJP_vWZnZOghWbe1pWlU_NOu1yLAeB1FQ" />
    </SafeAreaView>
  );
};

export default App;
