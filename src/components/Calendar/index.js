import React, {useEffect} from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import {ItemDiary} from '../ItemDiary';
import {Admob} from '../AdMobs/Admobs';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {
  formatDataCal,
  getCurrentDate,
  getDay,
  getCurrentCalDate,
  setMarkedDate,
} from '../../realm/Common';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import GestureRecognizer from 'react-native-swipe-gestures';
import {Diary_Schema, Init_Schema} from '../../realm/ExcuteData';
import Realm from 'realm';
import PropTypes from 'prop-types';
import {AbortController} from 'abort-controller';

export default function Search({route, navigation}) {
  const {index, type, objDate, startDay, mainDate} = route?.params;
  const {eventDate} = mainDate;
  const calendarRef = React.useRef(null);
  const [month, setMonth] = React.useState(new Date(index).getMonth() + 1);
  const [year, setYear] = React.useState(new Date(index).getFullYear());
  const [data, setData] = React.useState(null);
  const [marked, setMarked] = React.useState(objDate);
  const [initData, setinitData] = React.useState([]);
  const [arrSun, setArrSun] = React.useState(mainDate.arrSun);
  const [arrSat, setArrSat] = React.useState(mainDate.arrSat);
  const [selectDay, setSelectDay] = React.useState(index);
  const [dateHeader, setDateHeader] = React.useState();
  const [loadingData, setLoadingData] = React.useState(true);
  const [realm, setRealm] = React.useState(null);

  const initDate = new Date(index);
  const BackIcon = () => <Ionicons name="arrow-back" size={26} />;
  const itemDate = getCurrentDate(true, initDate) + getDay(initDate.getDay());
  const info = {
    index: index,
    type: type,
    navigation: navigation,
  };
  useEffect(() => {
    const ac = new AbortController();
    const initData = async () => {
      await Realm.open({
        schema: [Diary_Schema, Init_Schema], // predefined schema
        schemaVersion: 5,
      }).then(realm => {
        const result1 = realm.objects('diaryData').sorted('_id', true);
        setinitData(result1);
        result1.length > 0
          ? setData(formatDataCal(result1, itemDate))
          : setData([]);

        let date =
          getCurrentDate(true) + getDay(new Date().getDay()) === itemDate
            ? 'Today　' + itemDate
            : itemDate;
        setDateHeader(date);
        setRealm(realm);
        // setLoading(true);
        return () => {
          realm.close();
        };
      });
    };
    initData();
    return () => {
      if (realm && !realm.isClosed) {
        realm?.close();
      }
      ac.abort();
    };
  }, [route.params]);

  const startLoading = () => {
    setLoadingData(false);
    setTimeout(() => {
      setLoadingData(true);
    }, 200);
  };

  const onDateChange = date => {
    startLoading();
    let initD = new Date(date.dateString);
    let d = getCurrentDate(true, initD) + getDay(initD.getDay());
    let dateH =
      getCurrentDate(true) + getDay(new Date().getDay()) === d
        ? 'Today　' + d
        : d;
    setSelectDay(date.dateString);

    let obj = setMarkedDate(
      date.dateString,
      arrSat,
      arrSun,
      eventDate,
      2,
      marked,
    );
    setMarked(obj);
    setData(formatDataCal(initData, d));
    setDateHeader(dateH);
  };

  const onSwipeLeft = () => {
    const dateInit = new Date(
      new Date(selectDay).setDate(new Date(selectDay).getDate() + 1),
    );
    setSelectDate(dateInit);
  };

  const onSwipeRight = () => {
    const dateInit = new Date(
      new Date(selectDay).setDate(new Date(selectDay).getDate() - 1),
    );
    setSelectDate(dateInit);
  };

  const returnToday = () => {
    setSelectDate(new Date());
  };

  const setSelectDate = d => {
    startLoading();
    let iMonth = d.getMonth() + 1 - month;
    let iYear = d.getFullYear() - year;
    addMonth(iMonth + iYear * 12);
    const date = getCurrentCalDate(d);
    let fullDate = getCurrentDate(true, d) + getDay(d.getDay());
    let dateH =
      getCurrentDate(true) + getDay(new Date().getDay()) === fullDate
        ? 'Today　' + fullDate
        : fullDate;

    setSelectDay(date);
    let obj = setMarkedDate(date, arrSat, arrSun, eventDate, 2, marked);
    setMarked(obj);
    setDateHeader(dateH);
    setData(formatDataCal(initData, fullDate));
  };

  const addMonth = index => {
    calendarRef.current.addMonth(index);
  };

  const FilterDaySunSat = (m, y) => {
    let arryListFirst = [];
    let arryListLast = [];
    let daysInMonth = new Date(m, y, 0).getDate();
    for (var i = 1; i <= daysInMonth; i++) {
      let newDate = new Date(y, m - 1, i);
      if (newDate.getDay() === 0) {
        let dateFirst =
          y + '-' + ('0' + m).slice(-2) + '-' + ('0' + i).slice(-2);
        arryListFirst.push(dateFirst);
      }
      if (newDate.getDay() === 6) {
        let dateLast =
          y + '-' + ('0' + m).slice(-2) + '-' + ('0' + i).slice(-2);
        arryListLast.push(dateLast);
      }
    }
    setArrSat(arryListLast);
    setArrSun(arryListFirst);
    let obj = setMarkedDate(
      selectDay,
      arryListLast,
      arryListFirst,
      eventDate,
      1,
      marked,
    );
    setMarked(obj);
  };

  const setMonthYear = d => {
    setMonth(d.month);
    setYear(d.year);
    FilterDaySunSat(d.month, d.year, [], startDay);
  };

  const goBack = () => {
    let name = type === 2 ? 'Search' : 'Main';
    navigation.navigate({
      name: name,
      params: {index: 0, type: type},
    });
  };

  const setHeaderCanColor = () => {
    let headerTitle = {
      todayTextColor: 'black',
      dayTextColor: 'black',
      textDayFontSize: 15,
      'stylesheet.calendar.main': {
        week: {
          marginBottom: 2,
          marginTop: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
        },
      },
    };
    if (startDay === 0) {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex0: {
            color: 'red',
          },
          dayTextAtIndex6: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    } else if (startDay === 1) {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex6: {
            color: 'red',
          },
          dayTextAtIndex5: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    } else if (startDay === 2) {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex5: {
            color: 'red',
          },
          dayTextAtIndex4: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    } else if (startDay === 3) {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex4: {
            color: 'red',
          },
          dayTextAtIndex3: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    } else if (startDay === 4) {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex3: {
            color: 'red',
          },
          dayTextAtIndex2: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    } else if (startDay === 5) {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex2: {
            color: 'red',
          },
          dayTextAtIndex1: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    } else {
      return {
        'stylesheet.calendar.header': {
          header: {
            height: 0,
            opacity: 0,
          },
          dayHeader: {
            textAlign: 'center',
            fontSize: 16,
            color: 'black',
          },
          dayTextAtIndex1: {
            color: 'red',
          },
          dayTextAtIndex0: {
            color: 'blue',
          },
        },
        ...headerTitle,
      };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Admob />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 5,
          paddingBottom: 10,
        }}
        bounces={false}
        removeClippedSubviews={true}>
        <View>
          <View style={styles.calendarHeader}>
            <View style={{width: '10%', paddingLeft: 5}}>
              <TouchableOpacity onPress={() => goBack()}>
                <BackIcon />
              </TouchableOpacity>
            </View>
            <View style={[styles.calendarMonth, {paddingLeft: 25}]}>
              <TouchableOpacity onPress={() => addMonth(-1)}>
                <Entypo name="chevron-thin-left" size={14} />
              </TouchableOpacity>
              <Text
                style={{
                  paddingLeft: 5,
                  paddingRight: 3,
                  fontSize: 20,
                  fontFamily: 'Yu Gothic',
                  fontWeight: 'bold',
                }}>
                {month}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  paddingRight: 5,
                  fontFamily: 'Yu Gothic',
                }}>
                月
              </Text>
              <TouchableOpacity onPress={() => addMonth(1)}>
                <Entypo name="chevron-thin-right" size={14} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarMonth}>
              <TouchableOpacity onPress={() => addMonth(-12)}>
                <Entypo name="chevron-thin-left" size={14} />
              </TouchableOpacity>
              <Text
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  fontSize: 20,
                  fontFamily: 'Yu Gothic',
                  fontWeight: 'bold',
                }}>
                {year}
              </Text>
              <TouchableOpacity onPress={() => addMonth(12)}>
                <Entypo name="chevron-thin-right" size={14} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '18%',
                borderWidth: 1,
                borderRadius: 15,
                marginRight: 5,
                alignSelf: 'center',
              }}>
              <TouchableOpacity onPress={() => returnToday()}>
                <Text style={{padding: 2, textAlign: 'center', fontSize: 14}}>
                  Today
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Calendar
            ref={calendarRef}
            current={new Date(index)}
            enableSwipeMonths={true}
            firstDay={startDay}
            hideArrows={true}
            disableArrowLeft={true}
            disableArrowRight={true}
            renderHeader={() => null}
            theme={setHeaderCanColor()}
            onDayPress={day => onDateChange(day)}
            markedDates={marked.markedDate}
            markingType={'custom'}
            onMonthChange={date => setMonthYear(date)}
          />
        </View>
        {loadingData === true ? (
          <GestureRecognizer
            style={{flex: 1, backgroundColor: 'white'}}
            onSwipeLeft={state => onSwipeLeft(state)}
            onSwipeRight={state => onSwipeRight(state)}
            config={{
              velocityThreshold: 0.8,
              directionalOffsetThreshold: 150,
            }}>
            {data !== null && data.length > 0 && (
              <Text style={styles.textDate}>{dateHeader}</Text>
            )}
            <View>
              {data !== null &&
                data.length > 0 &&
                data.map((item, index) => {
                  return <ItemDiary key={index} item={item} info={info} />;
                })}
              {data !== null && data.length === 0 && (
                <View style={styles.contentEmpty}>
                  <Text style={styles.textDate}>{dateHeader}</Text>
                </View>
              )}
            </View>
          </GestureRecognizer>
        ) : (
          <View style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </ScrollView>
      <View style={styles.iconNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Write')}
          activeOpacity={0.7}>
          <View style={[styles.imageNav, {elevation: 13}]}>
            <Image
              source={require('../../assets/Gradient.png')}
              style={styles.imageGadient}
            />
            <Image
              source={require('../../assets/writeDiary.png')}
              style={styles.imageIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

Search.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  route: PropTypes.shape({
    params: PropTypes.shape({
      index: PropTypes.number,
      type: PropTypes.number,
      objDate: PropTypes.object,
      startDay: PropTypes.string,
      mainDate: PropTypes.string,
    }),
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  calendarHeader: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  calendarMonth: {
    width: '35%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  containerInfo: {
    marginTop: '1%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  textDate: {
    marginTop: '2%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Yu Gothic',
  },
  textTime: {
    width: '15%',
    textAlign: 'left',
    fontSize: 15,
    fontFamily: 'Yu Gothic',
  },
  diaryContent: {
    width: '70%',
    marginLeft: 25,
    marginRight: 10,
  },
  imageDiary: {
    margin: 1,
  },
  textDiary: {
    width: '70%',
    fontSize: 15,
    fontFamily: 'Yu Gothic',
  },
  favorite: {
    width: '3%',
  },
  tag: {
    paddingRight: 6,
    fontFamily: 'Yu Gothic',
    marginTop: 10,
  },
  tagContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  imageContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  iconNav: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
    margin: '3%',
    justifyContent: 'flex-end',
  },
  imageNav: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.4,
  },
  imageGadient: {
    width: 56,
    height: 56,
    position: 'absolute',
  },
  imageIcon: {
    width: 30,
    height: 30,
  },
  contentEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textEmpty: {fontSize: 16, fontFamily: 'Yu Gothic'},
  imageMonth: {height: 18, width: 18},
});

LocaleConfig.locales.jp = {
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  dayNames: [
    '日曜日',
    '月曜日',
    '火曜日',
    '水曜日',
    '木曜日',
    '金曜日',
    '土曜日',
  ],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';
