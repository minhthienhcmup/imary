import React, {useState} from 'react';
import MainDiaryScreen from '../MainDiary';
//import RandomDiaryScreen from '../Random';
import SearchScreen from '../Search';
import WriteDiarySreen from '../WriteDiary';
import CalendarScreen from '../Calendar';
import SettingScreen from '../Setting';
import {getCurrentCalDate, setMarkedDate} from '../../realm/Common';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();
export default function Main() {
  const [startDay, setStartDay] = useState(0);
  const [initDate, setInitDate] = useState({});
  const [objDate, setObjDate] = useState({});

  // useEffect(() => {
  //   const ac = new AbortController();
  //   return () => {
  //     ac.abort();
  //   };
  // }, []);

  const FilterDaySunSat = (m, y, eventD, active) => {
    let arryListFirst = [];
    let arryListLast = [];
    let daysInMonth = new Date(m, y, 0).getDate();
    //const dayLast = dayStart === 0 ? 6 : dayStart - 1;
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
    setInitDate({
      arrSun: arryListFirst,
      arrSat: arryListLast,
      eventDate: eventD,
    });
    return setMarkedDate(active, arryListLast, arryListFirst, eventD, 0);
  };

  const updateData = (data, index) => {
    setStartDay(data[0].startDay);
    let m = new Date(index).getMonth() + 1;
    let y = new Date(index).getFullYear();
    setObjDate(FilterDaySunSat(m, y, data[0].listDate, index));
  };
  return (
    <Stack.Navigator
      initialRouteName="Main"
      mode="card"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        initialParams={{
          index: getCurrentCalDate(),
          type: 0,
          startDay: startDay,
          mainDate: initDate,
          objDate: objDate,
          isWrite: false,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        initialParams={{
          index: 0,
          type: 2,
          isWrite: false,
        }}
      />
      <Stack.Screen
        name="Main"
        component={MainDiaryScreen}
        initialParams={{
          index: 0,
          type: 0,
          isWrite: false,
          updateData: updateData,
        }}
      />
      <Stack.Screen name="Write" component={WriteDiarySreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
    </Stack.Navigator>
  );
}
