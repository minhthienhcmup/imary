import React, {useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  LogBox,
  SectionList,
  Animated,
} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import {Diary_Schema, Init_Schema} from '../../realm/ExcuteData';
import Realm from 'realm';
import {formatData, searchData, convertListTag, getCurrentCalDate} from '../../realm/Common';
import {ItemDiary} from '../ItemDiary';
import {Admob} from '../AdMobs/Admobs';
import {useFocusEffect} from '@react-navigation/native';
const MojiJS = require('mojijs');

export default function Search({route, navigation}) {
  const {index, type} = route.params;
  const [checked, setChecked] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [color, setColor] = React.useState([]);
  const [initData, setInitData] = React.useState([]);
  const [mainData, setMainData] = React.useState([]);

  const [textDiary, setTextDiary] = React.useState('');
  const [textTag, setTextTag] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [lsTagConvert, setLsTagConvert] = React.useState([]);
  const [listTag, setListTag] = React.useState([]);
  const [filterTag, setFilterTag] = React.useState([]);

  const info = {
    index: index,
    type: type,
    navigation: navigation,
  };

  const startLoading = () => {
    setLoading(false);
    setTimeout(() => {
      setLoading(true);
    }, 200);
  };
  const onCheckedChange = isChecked => {
    startLoading();
    setChecked(isChecked);
    const dataFilter = searchData(
      textDiary,
      textTag,
      color,
      isChecked,
      initData,
    );
    setData(formatData(dataFilter, 2, new Date()));
  };

  const searchColor = id => {
    startLoading();
    let arr = color;
    if (color.includes(id)) {
      arr.splice(arr.indexOf(id), 1);
      setColor([...arr]);
    } else {
      arr = [...color, id];
      setColor(arr);
    }

    const dataFilter = searchData(textDiary, textTag, arr, checked, initData);
    setData(formatData(dataFilter, 2, new Date()));
  };

  const textDiaryChange = text => {
    startLoading();
    setTextDiary(text);
    const dataFilter = searchData(text, textTag, color, checked, initData);
    setData(formatData(dataFilter, 2, new Date()));
  };

  const dataColors = [
    {
      imageSrc: require('../../assets/bubbleColor1.png'),
      id: '#CCCDFB',
    },
    {
      imageSrc: require('../../assets/bubbleColor2.png'),
      id: '#9FC7E9',
    },
    {
      imageSrc: require('../../assets/bubbleColor3.png'),
      id: '#D6FEFE',
    },
    {
      imageSrc: require('../../assets/bubbleColor4.png'),
      id: '#D6FDD0',
    },
    {
      imageSrc: require('../../assets/bubbleColor5.png'),
      id: '#FFFED1',
    },
    {
      imageSrc: require('../../assets/bubbleColor6.png'),
      id: '#F7CECD',
    },
    {
      imageSrc: require('../../assets/bubbleColor7.png'),
      id: '#F7CFFC',
    },
  ];

  const onChangeTagText = async text => {
    const format =
      /[`~!@#$ %^&*₹()_|+\-=?;:'",.<>€£¥₫°•○□●■♤♡◇♧☆▪︎¤《》¡¿\{\}\[\]\\\/]/g;
    if (text.match(format)) {
      return;
    }
    setTextTag(text);
    startLoading();
    const dataFilter = searchData(textDiary, text, color, checked, initData);
    setData(formatData(dataFilter, 2, new Date()));
    const valTag = MojiJS.toKatakana(text.trim());

    if (valTag !== '') {
      let tagConvertArr = lsTagConvert;

      if (tagConvertArr.length === 0) {
        tagConvertArr = await convertListTag(listTag);
        setLsTagConvert(tagConvertArr);
      }

      if (
        !valTag.trim().match(/[\u30a0-\u30ff]/) ||
        tagConvertArr.length === 0
      ) {
        let arrListConvert = [];
        for (let i = 0; i < listTag.length; i++) {
          if (listTag[i].toUpperCase().includes(valTag.toUpperCase())) {
            arrListConvert.push(listTag[i]);
          }
        }
        setFilterTag(arrListConvert);
      } else {
        let arrListConvert = [];
        for (let i = 0; i < tagConvertArr.length; i++) {
          if (tagConvertArr[i].includes(valTag)) {
            arrListConvert.push(listTag[i]);
          }
        }
        setFilterTag(arrListConvert);
      }
    } else {
      // If the query is null then return blank
      setFilterTag([]);
    }
  };

  const setFocus = () => {
    if (textTag.trim() === '') {
      setFilterTag([]);
    } else {
      let tagConvertArr = lsTagConvert;
      const valTag = MojiJS.toKatakana(textTag.trim());
      if (
        !valTag.trim().match(/[\u30a0-\u30ff]/) ||
        tagConvertArr.length === 0
      ) {
        let arrListConvert = [];
        for (let i = 0; i < listTag.length; i++) {
          if (listTag[i].toUpperCase().includes(valTag.toUpperCase())) {
            arrListConvert.push(listTag[i]);
          }
        }
        setFilterTag(arrListConvert);
      } else {
        let arrListConvert = [];
        for (let i = 0; i < tagConvertArr.length; i++) {
          if (tagConvertArr[i].includes(valTag)) {
            arrListConvert.push(listTag[i]);
          }
        }
        setFilterTag(arrListConvert);
      }
    }
  };

  const selectTag = tag => {
    const tagSuggest = tag.replace('#', '').trim();
    setTextTag(tagSuggest);
    onChangeTagText(tagSuggest);
    setFilterTag([]);
    Keyboard.dismiss();
  };
  
  const preparedData = () => {
    Realm.open({
      schema: [Diary_Schema, Init_Schema], // predefined schema
      schemaVersion: 5,
    }).then(realm => {
      const dataInit = realm.objects('initData');
      setMainData(dataInit);
      const result = realm.objects('diaryData').sorted('_id', true);
      setInitData(result);

      const dataFilter = searchData(textDiary, textTag, color, checked, result);
      setData(formatData(dataFilter, 2, new Date()));
      if (
        dataInit !== 'undefined' &&
        dataInit !== null &&
        dataInit.length > 0
      ) {
        setListTag(dataInit[0].listTag);
        convertListTag(dataInit[0].listTag).then(
          res => {
            setLsTagConvert(res);
          },
          error => {
            console.log(error);
            setLsTagConvert([]);
          },
        );
      }
      return () => {
        realm.close();
      };
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      //startLoading();
      const ac = new AbortController();
      preparedData();
      LogBox.ignoreAllLogs();
      return () => {
        ac.abort();
      };
    }, [route.params,textDiary,
      textTag,
      color,
      checked]),
  );

  // useEffect(() => {
  //   const ac = new AbortController();
  //   //setLoading(true);
  //   //startLoading();
  //   //setLoading(false);
  //   preparedData();
  //   //setLoading(true);
  //   LogBox.ignoreAllLogs();
  //   return () => {
  //     ac.abort();
  //   };
  // }, [route.params]);

  return (
    <SafeAreaView style={styles.containerView}>
      <Admob />
      <SectionList
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        stickySectionHeadersEnabled={false}
        horizontal={false}
        sections={data}
        bounces={false}
        onEndReachedThreshold={0.7}
        removeClippedSubviews={true} // Unmount components when outside of window
        initialNumToRender={3} // Reduce initial render amount
        maxToRenderPerBatch={1} // Reduce number in each render batch
        updateCellsBatchingPeriod={100} // Increase time between renders
        windowSize={7} // Reduce the window size
        contentContainerStyle={{paddingBottom: 10}}
        ListHeaderComponent={
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.textTitle}>検索</Text>
              </View>
              <View style={styles.rightIconContainer}>
                <TouchableOpacity
                  style={styles.setting}
                  onPress={() => navigation.navigate('Setting')}>
                  <Image
                    source={require('../../assets/setting.png')}
                    style={styles.setting}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.headerText}
              placeholderTextColor="#7F7F7F"
              placeholder="文章検索"
              onChangeText={text => textDiaryChange(text)}
              value={textDiary}
            />
            <TextInput
              style={styles.headerText}
              placeholderTextColor="#7F7F7F"
              placeholder="タグ検索"
              onChangeText={text => onChangeTagText(text)}
              value={textTag}
              onFocus={(event: Event) => setFocus(event)}
              onBlur={() => setFilterTag([])}
            />
            {filterTag.length > 0 && textTag.replace('#', '').trim() !== '' ? (
              <View style={styles.autocompleteContainer}>
                <View style={styles.containerSuggestTag}>
                  {filterTag.map((data, index) => {
                    return (
                      <View key={index}>
                        <View>
                          <TouchableWithoutFeedback
                            onPress={() => selectTag(data)}>
                            <Text style={styles.suggestTag}>{data}</Text>
                          </TouchableWithoutFeedback>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <View style={styles.colorContainer}>
              {dataColors.map((data, index) => {
                return (
                  <View key={index}>
                    <TouchableOpacity
                      style={styles.searchColor}
                      onPress={() => searchColor(data.id)}>
                      <Image source={data.imageSrc} />
                      {color.includes(data.id) ? (
                        <Image
                          style={{position: 'absolute', top: 3}}
                          source={require('../../assets/check.png')}
                        />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
            <View style={styles.favoriteContainer}>
              <View style={styles.textFavoriteContainer}>
                <Text style={styles.textFavorite}>お気に入り ☆</Text>
              </View>
              <View style={styles.switchButtonContainer}>
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
          </View>
        }
        renderSectionHeader={({section}) => {
          if (section.title === data[0].title) {
            return (
              <Text
                style={[styles.textDate, {marginTop: 10, alignSelf: 'center'}]}>
                {section.title}
              </Text>
            );
          }
          return (
            <Text
              style={[styles.textDate, {marginTop: 25, alignSelf: 'center'}]}>
              {section.title}
            </Text>
          );
        }}
        
        renderItem={({item, i}) => <ItemDiary i={i} item={item} info={info} mainData={mainData} />}
        keyExtractor={(item, index) => index}>
        {/* {loading === true ? (
          <View style={styles.listDiaryContainer}>
            {/* <ViewDataList
            data={data}
            navigation={navigation}
            index={index}
            type={type}
            checkStar={checked}
          /> */}
        {/* {data !== null && data.length > 0
              ? data.map((item, index) => {
                  return (
                    <View key={index}>
                      {item.title === data[0].title ? (
                        <TouchableWithoutFeedback
                          onPress={() => callToCalendar(item.title)}>
                          <Text
                            style={[
                              styles.textDate,
                              {marginTop: 10, alignSelf: 'center'},
                            ]}>
                            {item.title}
                          </Text>
                        </TouchableWithoutFeedback>
                      ) : (
                        <TouchableWithoutFeedback
                          onPress={() => callToCalendar(item.title)}>
                          <Text
                            style={[
                              styles.textDate,
                              {marginTop: 25, alignSelf: 'center'},
                            ]}>
                            {item.title}
                          </Text>
                        </TouchableWithoutFeedback>
                      )}
                      {item.data.map((itemDiary, indexDiary) => {
                        return (
                          <ItemDiary
                            key={indexDiary}
                            item={itemDiary}
                            info={info}
                          />
                        );
                      })}
                    </View>
                  );
                })
              : null}
          </View>
        ) : (
          <View style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )} */}
        */}
      </SectionList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textTitle: {
    fontFamily: 'Yu Gothic',
    fontSize: 18,
    color: 'black',
  },
  titleContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width - 60,
    paddingLeft: 40,
  },
  rightIconContainer: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setting: {
    width: 20,
    height: 20,
  },
  headerText: {
    color: 'black',
    fontSize: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#838383',
    borderRadius: 7,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  colorContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-around',
    height: 20,
  },
  searchColor: {
    alignItems: 'center',
  },
  favoriteContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    height: 40,
  },
  textFavoriteContainer: {
    width: '50%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  switchButtonContainer: {
    width: '50%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20,
  },
  switch: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  textFavorite: {
    fontSize: 18,
    fontFamily: 'Yu Gothic',
  },
  listDiaryContainer: {
    flex: 1,
  },
  textDate: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Yu Gothic',
  },
  contentEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSuggestTag: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginRight: 2,
    paddingTop: 5,
    paddingBottom: 5,
    width: '100%',
    borderWidth: 1,
    borderColor: '#838383',
  },
  suggestTag: {
    margin: 5,
    fontFamily: 'Yu Gothic',
    fontSize: 16,
  },
  autocompleteContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: 1,
    top: 141,
    left: 10,
    right: 10,
    width: '80%',
    backgroundColor: 'white',
  },
});
