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
import Realm from 'realm';
import DefaultPreference from 'react-native-default-preference';
import {AbortController} from 'abort-controller';

const appGroupIdentifier = 'group.com.imary';

const config = {
  screens: {
    Write: 'Write/:code',
    Search: 'Search/:widget',
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
  const [diaryData, setDiaryData] = useState(null);
  const [realm, setRealm] = useState(null);

  const onEnd = password => {
    if (password === initData[0].password) {
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

  useEffect(() => {
    DefaultPreference.setName(appGroupIdentifier);
    Linking.getInitialURL().then(url => {
      setLink(url);
    });
    const ac = new AbortController();
    LogBox.ignoreLogs(['Error: ...']); // Ignore log notification by message
    const initData = async () => {
      await Realm.open({
        schema: [Diary_Schema, Init_Schema], // predefined schema
        schemaVersion: 5,
      })
        .then(realm => {
          const data = realm.objects('initData');
          if (data !== null && data.length > 0) {
            setInitData(data);
          }
          const diary = realm.objects('diaryData').sorted('_id', true);
          if (diary !== null && diary.length > 0) {
            const year = diary[0]._id.substring(0, 4);
            const month = diary[0]._id.substring(4, 6);
            const day = diary[0]._id.substring(6, 8);
            const hour = diary[0]._id.substring(8, 10);
            const minute = diary[0]._id.substring(10, 12);
            const date =
              year + '/' + month + '/' + day + ' ' + hour + ':' + minute;
            let image =
              diary?.imageSrc && diary?.imageSrc !== ''
                ? JSON.parse(diary.imageSrc)
                : [];
            image = Array.isArray(image) ? image : [image];
            DefaultPreference.get('widgetBackgroundOpt').then(opt => {
              if ((image.length > 0 && opt === '0') || opt === undefined) {
                DefaultPreference.set('backgroundImage', image?.[0]?.uri);
              }
            });
            DefaultPreference.set('date', date);
          }
          setRealm(realm);
          return () => {
            realm.close();
          };
        })
        .catch(err => {
          console.log(err);
        });
    };
    initData();
    return () => {
      if (realm && !realm.isClosed) {
        realm?.close();
      }
      ac.abort();
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      {verified === false &&
      initData &&
      initData?.length > 0 &&
      initData?.[0]?.usePass &&
      !!initData?.[0]?.password &&
      (link === null || link === 'imary://Search/0') ? (
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
          <StatusBar translucent barStyle="dark-content" />
          <MainScreen />
          <Toast ref={ref => Toast.setRef(ref)} />
        </NavigationContainer>
      )}
    </SafeAreaView>
  );
};

export default App;
