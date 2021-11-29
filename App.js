import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainScreen from './src/components/Main';
import {Diary_Schema, Init_Schema} from './src/realm/ExcuteData';
import Toast from 'react-native-toast-message';
import PasswordGesture from 'react-native-gesture-password';
import {
  View,
  StyleSheet,
  LogBox,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';

const config = {
  screens: {
    Write: 'Write/:code',
  },
};

const linking = {
  prefixes: ['imary://'],
  config,
};

const App = () => {
  const [verified, setVerified] = useState(false);
  const [initData, setInitData] = useState([]);
  const [message, setMessage] = useState('パターンを入力してください');
  const [status, setStatus] = useState('normal');
  const [link, setLink] = useState(null);

  const onEnd = password => {
    if (password == initData[0].password) {
      setMessage('パスワードは正しい');
      setStatus('right');
      setVerified(true);
    } else {
      setMessage('パスワードが間違っています\nもう一度お試しください');
      setStatus('wrong');
    }
  };

  const onStart = () => {
    setMessage('パターンを入力してください');
    setStatus('normal');
  };

  useEffect(async () => {
    const url = await Linking.getInitialURL();
    await setLink(url);
    const ac = new AbortController();
    LogBox.ignoreLogs(['Error: ...']); // Ignore log notification by message
    Realm.open({
      schema: [Diary_Schema, Init_Schema], // predefined schema
      schemaVersion: 5,
    })
      .then(realm => {
        const data = realm.objects('initData');
        if (data !== null && data.length > 0) {
          setInitData(data);
        }
        return () => {
          realm.close();
        };
      })
      .catch(err => {
        console.log(err);
      });
    return () => ac.abort();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      {verified === false &&
      initData.length > 0 &&
      initData[0].usePass === true &&
      initData[0].password.trim() !== '' &&
      link == null ? (
        <View style={styles.container}>
          {/* <MyStatusBar backgroundColor="#292B38" barStyle="dark-content" />  */}
          <PasswordGesture
            style={{backgroundColor: 'white'}}
            normalColor="black"
            rightColor="black"
            wrongColor="red"
            status={status}
            message={message}
            onStart={() => onStart()}
            onEnd={password => onEnd(password)}
            innerCircle={true}
            outerCircle={false}
            textStyle={{fontSize: 16, top: '100%', textAlign: 'center'}}
          />
        </View>
      ) : (
        <NavigationContainer showLabel="false" linking={linking}>
          <MainScreen />
          <Toast ref={ref => Toast.setRef(ref)} />
        </NavigationContainer>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: StatusBar.currentHeight,
  },
});

export default App;
