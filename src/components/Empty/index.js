import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {getCurrentDate, getDay} from '../../realm/Common';
const windowWidth = Dimensions.get('screen').width;
export const EmptyComponents = props => {
  const d = new Date(new Date().setDate(new Date().getDate() + props.indexDay));
  const dateBk = getCurrentDate(true, d) + getDay(d.getDay());
  const date =
    getCurrentDate(true) + getDay(new Date().getDay()) === dateBk
      ? 'Today　' + dateBk
      : dateBk;
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={styles.dateContainer}>
          <Text style={styles.textDate}>{date}</Text>
        </View>
        <View style={styles.rightIconContainer}>
          <TouchableOpacity
            style={styles.setting}
            onPress={() => props.navigation.navigate('Setting')}>
            <Image
              source={require('../../assets/setting.png')}
              style={styles.setting}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.diaryContent}>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: windowWidth,
    backgroundColor: 'white',
  },
  textDate: {
    marginTop: '2%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Yu Gothic',
  },
  textDiary: {fontSize: 16, fontFamily: 'Yu Gothic'},
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  setting: {
    width: 20,
    height: 20,
  },
  dateContainer:{
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width - 40,
    paddingLeft: 40,
  }
});
