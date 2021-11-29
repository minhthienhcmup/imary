import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PasswordGesture from 'react-native-gesture-password';
import Modal from 'react-native-modal';
import {
  Diary_Schema,
  Init_Schema,
  updateUsePass,
  updatePass,
  updateStartDay,
} from '../../realm/ExcuteData';
import {getFullDay} from '../../realm/Common';
import ToggleSwitch from 'toggle-switch-react-native';

const BackIcon = () => <Ionicons name="arrow-back" size={25} />;

// const MyStatusBar = ({backgroundColor, ...props}) => (
//   <View style={[styles.statusBar, {backgroundColor}]}>
//     <SafeAreaView>
//       <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//     </SafeAreaView>
//   </View>
// );

const data = [
  {
    title: '日記ロック',
    description: 'ウィジェットはロックされません',
  },
  {
    title: '週の最初の',
    description: '',
  },
  {
    title: 'バックアップと復元',
    description: '',
  },
];

export default function Setting({navigation}) {
  const [pass, setPass] = React.useState('');
  const [captured, setCaptured] = React.useState(true);
  const [checked, setChecked] = React.useState(false);
  const [startDay, setStartDay] = React.useState(getFullDay(0));
  const [modalVis, setModalVis] = React.useState(false);
  const [message, setMessage] = React.useState('パターンを入力してください');
  const [status, setStatus] = React.useState('normal');

  const days = [
    {day: 0, fullDay: '日曜日'},
    {day: 1, fullDay: '月曜日'},
    {day: 2, fullDay: '火曜日'},
    {day: 3, fullDay: '水曜日'},
    {day: 4, fullDay: '木曜日'},
    {day: 5, fullDay: '金曜日'},
    {day: 6, fullDay: '土曜日'},
  ];

  // const renderBackAction = () => (
  //   <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  // );
  const onCheckedChange = isChecked => {
    updateUsePass(isChecked);
    updatePass('');
    setCaptured(!isChecked);
    setChecked(isChecked);
    if (!isChecked) {
      setPass('');
      setStatus('normal');
      setMessage('パターンを入力してください');
    }
  };

  const onEnd = password => {
    console.log('zxczxc ', password, pass);
    if (password.trim() === '') {
      return;
    }
    if (pass.trim() === '') {
      // The first password
      setPass(password);
      setStatus('normal');
      setMessage('パターンの確認を入力してください');
    } else {
      // The second password
      if (password === pass) {
        setStatus('right');
        setMessage('パターンが設定されています');
        setPass('');
        // your codes to close this view
        updatePass(password);
        setCaptured(true);
      } else {
        setStatus('wrong');
        setMessage('パターンが同じではありません\nもう一度お試しください');
      }
    }
  };

  const onStart = () => {
    console.log('start ');
    if (pass.trim() === '') {
      setStatus('normal');
      setMessage('パターンを入力してください');
    } else {
      setStatus('normal');
      setMessage('パターンの確認を入力してください');
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    setPass('');
    Realm.open({
      schema: [Diary_Schema, Init_Schema], // predefined schema
      schemaVersion: 5,
    })
      .then(realm => {
        const data = realm.objects('initData');
        if (data !== null && data.length > 0) {
          if (data[0].usePass && data[0].password.trim() !== '') {
            setChecked(true);
          } else {
            setChecked(false);
          }
          setStartDay(getFullDay(data[0].startDay));
        }
        return () => {
          realm.close();
        };
      })
      .catch(err => {
        console.log(err);
      });
    return () => {
      ac.abort();
    };
  }, []);


  const setModalDay = item => {
    setModalVis(false);
    setStartDay(item.fullDay);
    updateStartDay(item.day);
  };

  const itemStartDay = () => (
    <View>
      <TouchableOpacity onPress={() => setModalVis(true)}>
        <Text style={{fontSize: 16}}>{startDay}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        isVisible={modalVis}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        backdropTransitionOutTiming={0}
        onRequestClose={() => setModalVis(false)}
        onBackdropPress={() => setModalVis(false)}>
        <View style={styles.moldalContainer}>
          {days.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={{margin: 18}}
                onPress={() => setModalDay(item)}>
                <View style={{alignItems: 'center'}}>
                  <Text>{item.fullDay}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {checked === true && captured === false ? (
        <View style={styles.container}>
          <PasswordGesture
            status={status}
            message={message}
            onStart={() => onStart()}
            onEnd={password => onEnd(password)}
            innerCircle={true}
            outerCircle={false}
            style={{backgroundColor: 'white'}}
            normalColor="black"
            rightColor="black"
            wrongColor="red"
            textStyle={{
              fontSize: 16,
              fontFamily: 'Yu Gothic',
              top: '100%',
              textAlign: 'center',
            }}
          />
        </View>
      ) : (
        <View>
          <View style={styles.header}>
            <View style={styles.leftIconContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <BackIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
              <Text style={{fontSize: 18}}>設定</Text>
            </View>
          </View>
          <View style={styles.bodyContainer}>
            <View style={{width: '14%'}}>
              <Image
                source={require('../../assets/lock.png')}
                style={{width: 35, height: 35}}
              />
            </View>
            <View style={{width: '68%'}}>
              <Text style={{fontSize: 16, fontFamily: 'Yu Gothic'}}>日記ロック</Text>
              <Text style={{fontSize: 11, fontFamily: 'Yu Gothic'}}>ウィジェットはロックされません</Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={checked}
                onColor="#98ccec"
                offColor="grey"
                labelStyle={{color: 'black', fontWeight: '900'}}
                size="medium"
                onToggle={onCheckedChange}
              />
            </View>
          </View>
          <View style={styles.bodyContainer}>
            <View style={{width: '14%'}}>
              <Image
                source={require('../../assets/calendar1.png')}
                style={{width: 35, height: 35}}
              />
            </View>
            <View style={{width: '68%'}}>
              <Text style={{fontSize: 16, fontFamily: 'Yu Gothic'}}>
                週の最初の日
              </Text>
            </View>
            {itemStartDay()}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E6E6',
  },
  statusBar: {
    height: StatusBar.currentHeight,
  },
  listItemSetting: {
    paddingHorizontal: '5%',
  },
  switch: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  header: {
    height: 40,
    flexDirection: 'row',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width - 60,
    paddingRight: 60,
  },
  leftIconContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    marginTop: 2,
    padding: 10,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'white',
    height: '20%',
    alignItems: 'center',
  },
  moldalContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    alignSelf: 'center',
    height: '40%',
    width: '70%',
  },
});
