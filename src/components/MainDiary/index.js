import React, {useEffect} from 'react';
import {formatData, getCurrentCalDate} from '../../realm/Common';
import {ViewDataList} from '../ListData';
import {BottomNav} from '../BtnBottom';
import {EmptyComponents} from '../Empty';
import {SafeAreaView, StyleSheet, View, ActivityIndicator, LogBox,} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import GestureRecognizerView, {swipeDirections} from 'rn-swipe-gestures';
import {Diary_Schema, Init_Schema} from '../../realm/ExcuteData';
import {useFocusEffect} from '@react-navigation/native';
import Realm from 'realm';
import {Admob} from '../AdMobs/Admobs';
import { isIndexedAccessType } from '@babel/types';

export default function MainDiary({route, navigation}) {
  const {index, type, updateData} = route.params;
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);
  const [initData, setInitData] = React.useState([]);
  const [iDay, setIDay] = React.useState(index);
  const [evenDate, setEvenDate] = React.useState([]);

  const startLoading = () => {
    setLoading(false);
    setTimeout(() => {
      setLoading(true);
    }, 200);
  };

  const onSwipeLeft = gestureState => {
    let newIndex = iDay + 1;
    setSwipeData(newIndex);
  };

  const onSwipeRight = gestureState => {
    let newIndex = iDay - 1;
    setSwipeData(newIndex);
  };

  const setSwipeData = i => {
    startLoading();
    setIDay(i);
    let d = new Date(new Date().setDate(new Date().getDate() + i));
    setData(formatData(initData, type, d, evenDate));
  };

  const preparedData = () => {
    setIDay(index);
    Realm.open({
      schema: [Diary_Schema, Init_Schema], // predefined schema
      schemaVersion: 5,
    }).then(realm => {
      let result = realm.objects('initData');
      if (result.length > 0) {
        setEvenDate(result[0].listDate);
      } else {
        let dataInit = {
          _id: '1',
          password: '',
          usePass: false,
          listTag: [],
          listDate: [],
          startDay: 0,
        };
        realm.write(() => {
          realm.create('initData', dataInit);
        });
      }
      result = realm.objects('initData');
      updateData(result, getCurrentCalDate());
      const result1 = realm.objects('diaryData').sorted('_id', true);
      let d = new Date(new Date().setDate(new Date().getDate() + index));
      setInitData(result1);
      setData(formatData(result1, route.params.type, d, result[0].listDate));
      return () => {
        realm.close();
      };
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const ac = new AbortController();
      preparedData();
      return () => {
        ac.abort();
      };
    }, [index, route.params, type]),
  );

  useEffect(() => {
    const ac = new AbortController();
    if (type === 1){
      return;
    }
    if (route.params.isWrite){
      startLoading();
      preparedData();
    }
    LogBox.ignoreAllLogs();
    return () => {
      // willFocusSubscription;
      ac.abort();
    };
  }, [index, route.params, type]);

  return (
    <SafeAreaView style={styles.container}>
      <GestureRecognizerView
        style={{flex: 1}}
        onSwipeLeft={state => onSwipeLeft(state)}
        onSwipeRight={state => onSwipeRight(state)}
        config={{
          velocityThreshold: 0.8,
          directionalOffsetThreshold: 150,
          needVerticalScroll: true,
          detectSwipeUp: false,
          detectSwipeDown: false,
        }}>
        <Admob />
        {loading === true ? (
          <View style={{flex: 1}}>
            {data.length > 0 ? (
              <ViewDataList
                data={data}
                navigation={navigation}
                index={index}
                type={type}
              />
            ) : (
              <EmptyComponents indexDay={iDay} navigation={navigation} />
            )}
          </View>
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </GestureRecognizerView>
      <BottomNav navigation={navigation} type={type} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  rightIconContainer: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 40,
  },
  setting: {
    tintColor: 'black',
    width: 28,
    height: 28,
  },
});
