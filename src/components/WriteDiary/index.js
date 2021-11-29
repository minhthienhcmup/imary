import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
  LogBox,
  BackHandler,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {Init_Schema, Diary_Schema} from '../../realm/ExcuteData';
import Realm from 'realm';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import {
  getCurrentDate,
  getCurrentTime,
  getDay,
  mergeListTag,
  saveVideo,
  mergeListDate,
  convertListTag,
  convertMiniSecondToTime,
} from '../../realm/Common';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-player';
import Toast from 'react-native-toast-message';
import {saveData} from '../../realm/ExcuteData';
import {Admob} from '../AdMobs/Admobs';
import ImageView from 'react-native-image-viewing';
import {set} from 'react-native-reanimated';
import RNExitApp from 'react-native-exit-app';
import { getStatusBarHeight } from 'react-native-status-bar-height';
const MojiJS = require('mojijs');

export default function WriteDiary({navigation, route}) {
  const [content, setContent] = useState('');
  const [tagText, setTagText] = useState('');
  const [color, setColor] = useState('#F5F5F5');
  const [visible, setVisible] = useState(false);
  const [resourcePath, setResourcePath] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [tagArr, setTagArr] = useState([]);
  const [filterTag, setFilterTag] = useState([]);
  const [listTag, setListTag] = useState([]);
  const [lsTagConvert, setLsTagConvert] = useState([]);
  const [visibleTag, setVisibleTag] = useState(false);
  const [video, setVideo] = useState('');
  const [videoArr, setVideoArr] = useState([]);

  const [listDate, setListDate] = useState([]);
  const [modalVis, setModalVis] = React.useState(false);
  const [modalFullVis, setModalFullVis] = React.useState(false);
  const [imageView, setImageView] = React.useState(false);
  const [indexImage, setIndexImage] = React.useState(0);
  const windowWidth = Dimensions.get('screen').width;
  const windowHeight = Dimensions.get('screen').height;

  const player = React.useRef(null);
  const MINUTE_MS = 1000;
  const [dt, setDt] = useState(
    getCurrentDate(true) + getDay(new Date().getDay()) + getCurrentTime(true),
  );
  let colorDefault = '#F5F5F5';
  let bubbleColor0 = '#CCCDFB';
  let bubbleColor1 = '#9FC7E9';
  let bubbleColor2 = '#D6FEFE';
  let bubbleColor3 = '#D6FDD0';
  let bubbleColor4 = '#FFFED1';
  let bubbleColor5 = '#F7CECD';
  let bubbleColor6 = '#F7CFFC';

  useEffect(() => {
    LogBox.ignoreAllLogs();
    const ac = new AbortController();
    const interval = setInterval(() => {
      setDt(
        getCurrentDate(true) +
          getDay(new Date().getDay()) +
          getCurrentTime(true),
      );
    }, MINUTE_MS);

    const backAction = () => {
      if (route.params) {
        BackHandler.exitApp();
        RNExitApp.exitApp();
      }
      return false;
    };

    if (route.params) {
      const {code} = route.params;
      if (code === '1') {
        checkCamera();
      } else {
        setModalVis(false);
      }
    }

    BackHandler.addEventListener('hardwareBackPress', backAction);

    Realm.open({
      schema: [Diary_Schema, Init_Schema],
      schemaVersion: 5,
    })
      .then(realm => {
        const data = realm.objects('initData');
        if (data !== 'undefined' && data !== null && data.length > 0) {
          setListTag(data[0].listTag);
          setListDate(data[0].listDate);
          convertListTag(data[0].listTag).then(
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
          ac.abort();
        };
      })
      .catch(err => {
        console.log(err);
      });
    return () => {
      clearInterval(interval);
      BackHandler.removeEventListener('hardwareBackPress', backAction);
      ac.abort();
    };
  }, [route]);

  const saveDiary = async () => {
    if (
      content.trim() === '' &&
      resourcePath.length === 0 &&
      videoArr.length === 0
    ) {
      Toast.show({
        type: 'info',
        text1: '記録を入力してください。',
        visibilityTime: 700,
        autoHide: true,
      });
      return;
    }
    let listTags = mergeListTag(listTag, tagArr);
    let listDates = mergeListDate(listDate);
    await saveData(
      content,
      color,
      favorite,
      tagArr,
      resourcePath,
      listTags,
      videoArr,
      listDates,
    );
    if (videoArr.lenght > 0) {
      videoArr.forEach(async video => {
        await saveVideo(video.path);
      });
    }
    setResourcePath([]);
    setContent('');
    setColor(colorDefault);
    setFavorite(false);
    setVisible(false);
    setTagArr([]);
    setTagText('');
    setVideo('');
    setVideoArr([]);
    if (route.params) {
      BackHandler.exitApp();
      RNExitApp.exitApp();
    }
    navigation.navigate({
      name: 'Main',
      params: {index: 0, type: 0, isWrite: true},
    });
  };

  const checkColorBar = () => {
    setVisible(!visible);
    setModalVis(false);
  };

  const checkCamera = () => {
    setModalVis(!modalVis);
    setVisible(false);
  };

  const setBackGroundColor = bgColor => {
    if (color !== bgColor) {
      setColor(bgColor);
    } else {
      setColor(colorDefault);
    }
  };

  const pickPicture = async () => {
    try {
      setVisible(false);
      setFilterTag([]);
      setVisibleTag(false);
      const result = await ImagePicker.openPicker({
        height: 300,
        width: 400,
        cropping: true,
        includeBase64: true,
        multiple: true,
        compressImageMaxHeight: 1500,
        compressImageMaxWidth: 1500,
        compressImageQuality: 0.8,
      }).then(image => {
        let arr = resourcePath;
        image.forEach(e => {
          arr.push({
            uri: `data:${e.mime};base64,` + e.data,
            width: e.width,
            height: e.height,
          });
        });
        setResourcePath([...arr]);
      });
    } catch (error) {
      console.log('Error:', error);
      if (error.message.includes('User did not grant library permission')) {
        alertRequestPermission('library');
      }
    }
  };

  const cameraVideo = async () => {
    try {
      setVisible(false);
      setFilterTag([]);
      setVisibleTag(false);
      const result = await ImagePicker.openCamera({
        mediaType: 'video',
      }).then(image => {
        let arr = [];
        arr.push(image);
        console.log(image);
        setVideo(image);
        setVideoArr([...arr]);
        setModalVis(false);
      });
    } catch (error) {
      console.log('Error:', error);
      if (error.message.includes('User did not grant camera permission')) {
        alertRequestPermission('camera');
      }
    }
  };

  const cameraPicture = async () => {
    try {
      setVisible(false);
      setFilterTag([]);
      setVisibleTag(false);
      const result = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: true,
        multiple: true,
        compressImageMaxHeight: 1500,
        compressImageMaxWidth: 1500,
      }).then(image => {
        let item = {
          uri: `data:${image.mime};base64,` + image.data,
          width: image.width,
          height: image.height,
        };
        setResourcePath([...resourcePath, item]);
        setModalVis(false);
      });
    } catch (error) {
      console.log('Error:', error);
      if (error.message.includes('User did not grant camera permission')) {
        alertRequestPermission('camera');
      }
    }
  };

  const getImageStyle = index => {
    let setFull = false;
    if (resourcePath.length === index + 1 && index % 2 === 0) {
      setFull = true;
    }

    if (setFull === false) {
      return {
        alignSelf: 'center',
        width: windowWidth * 0.5 - 15,
        height: windowWidth * 0.5 - 15,
      };
    }

    return {
      alignSelf: 'center',
      width: windowWidth - 20,
      height: windowWidth - 20,
    };
  };

  const getVideoStyle = index => {
    let setFull = false;
    if (videoArr.length === index + 1 && index % 2 === 0) {
      setFull = true;
    }

    if (setFull === false) {
      return {
        alignSelf: 'center',
        width: windowWidth * 0.5 - 15,
        height: windowWidth * 0.5 - 15,
      };
    }

    return {
      alignSelf: 'center',
      width: windowWidth - 20,
      height: windowWidth - 20,
    };
  };

  const getInputTagText = () => {
    if (filterTag.length > 0 && tagText.replace('#', '').trim() !== '') {
      return {
        borderWidth: 1,
        borderBottomWidth: 0,
        fontFamily: 'Yu Gothic',
        fontSize: 16,
        width: '40%',
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 2,
      };
    }

    return {
      borderWidth: 1,
      fontFamily: 'Yu Gothic',
      fontSize: 16,
      width: '40%',
      flexDirection: 'row',
      marginLeft: 10,
      marginRight: 2,
    };
  };

  const closeImage = index => {
    let arr = resourcePath;
    arr.splice(index, 1);
    setResourcePath([...arr]);
  };

  const removeVideo = index => {
    let arr = videoArr;
    arr.splice(index, 1);
    setVideoArr([...arr]);
  };

  const colorBar = () => {
    return (
      <View style={styles.colorContainer}>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor0}]}
          onPress={() => setBackGroundColor(bubbleColor0)}>
          {color === bubbleColor0 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor1}]}
          onPress={() => setBackGroundColor(bubbleColor1)}>
          {color === bubbleColor1 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor2}]}
          onPress={() => setBackGroundColor(bubbleColor2)}>
          {color === bubbleColor2 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor3}]}
          onPress={() => setBackGroundColor(bubbleColor3)}>
          {color === bubbleColor3 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor4}]}
          onPress={() => setBackGroundColor(bubbleColor4)}>
          {color === bubbleColor4 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor5}]}
          onPress={() => setBackGroundColor(bubbleColor5)}>
          {color === bubbleColor5 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchColor, {backgroundColor: bubbleColor6}]}
          onPress={() => setBackGroundColor(bubbleColor6)}>
          {color === bubbleColor6 ? (
            <Image
              style={{position: 'absolute'}}
              source={require('../../assets/check.png')}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  const onChangeTagText = async text => {
    setVisible(false);
    const format =
      /[`~!@#$ %^&*₹()_|+\-=?;:'",.<>€£¥₫°•○□●■♤♡◇♧☆▪︎¤《》¡¿\{\}\[\]\\\/]/g;
    if (text.match(format)) {
      return;
    }
    setTagText(text);
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

  const selectTag = tag => {
    setTagArr([...tagArr, tag]);
    setTagText('');
    setFilterTag([]);
    Keyboard.dismiss();
  };

  const removeTag = (e, index) => {
    e.preventDefault();
    let arr = tagArr;
    arr.splice(index, 1);
    setTagArr([...arr]);
  };

  const displayTag = async status => {
    setVisible(false);
    if (status === true) {
      setVisibleTag(true);
      setTagText('');
      setFilterTag([]);
    } else {
      setFilterTag([]);
      setTagText('');
      setVisibleTag(false);
    }
  };

  const addTag = () => {
    let text = tagText[0] !== '#' ? '#' + tagText : tagText;
    setTagArr([...tagArr, text]);
    setTagText('');
  };

  const setFocus = () => {
    if (tagText.trim() === '') {
      setFilterTag([]);
    } else {
      let tagConvertArr = lsTagConvert;
      const valTag = MojiJS.toKatakana(tagText.trim());
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
    setVisible(false);
  };

  const setImageListView = index => {
    setIndexImage(index);
    setImageView(true);
  };

  const modalVideo = video => {
    setVideo(video);
    setModalFullVis(true);
  };
  const getStyleBottomNav = () => {
    if (visible) {
      return {
        position: 'absolute',
        backgroundColor: 'transparent',
        width: '100%',
        height: 55,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        bottom: 0,
      };
    }

    return {
      position: 'absolute',
      backgroundColor: 'transparent',
      bottom: 0,
      height: 55,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    };
  };

  const alertRequestPermission = (service) => {
    const libraryString = `Imaryにはまだ「写真アルバム」アクセス権がありません。
    写真を使用するには、写真アルバムへのアクセスを許可してください。`
    const cameraString = `Imaryにはまだ「カメラ」アクセス権がありません。
    写真とビデオ撮影機能を使用するには、カメラへのアクセスを許可してください。`
    Alert.alert('', service === 'library' ? libraryString : cameraString, [
      {
        text: 'キャンセル',
        onPress: () => console.log('Cancel Pressed'),
        style: 'default',
      },
      {
        text: 'OK',
        onPress: () => Linking.openSettings(),
        style: 'default',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Admob />
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.textTitle}>{dt}</Text>
        </View>
        <View style={styles.rightIconContainer}>
          <TouchableOpacity
            style={styles.favorite}
            onPress={() => setFavorite(!favorite)}>
            <Image
              source={
                favorite
                  ? require('../../assets/starFilled.png')
                  : require('../../assets/starEmpty.png')
              }
              style={styles.favorite}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View
          style={{
            backgroundColor: color,
            marginHorizontal: 10,
            borderRadius: 10,
          }}>
          <TextInput
            style={styles.textArea}
            multiline={true}
            autoFocus={true}
            value={content}
            onChangeText={setContent}
            underlineColorAndroid="transparent"
            placeholder="今なにをしていますか？"
            placeholderTextColor="#7F7F7F"
            onFocus={() => displayTag(false)}
            //onContentSizeChange = {(e) => setHeightInput(e.nativeEvent.contentSize.height)}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
          }}>
          {visibleTag ? (
            <View style={getInputTagText()}>
              <Text
                style={{
                  fontSize: 16,
                  alignItems: 'center',
                  alignSelf: 'center',
                  paddingLeft: 5,
                }}>
                #
              </Text>
              <TextInput
                style={{
                  color: 'black',
                  fontSize: 16,
                  width: '90%',
                  paddingLeft: 0,
                  height: 45,
                }}
                value={tagText}
                onChangeText={text => onChangeTagText(text)}
                underlineColorAndroid="transparent"
                placeholderTextColor="black"
                autoFocus={true}
                onFocus={(event: Event) => setFocus(event)}
              />
            </View>
          ) : null}
          {tagText.replace('#', '').trim() !== '' && visibleTag ? (
            <TouchableOpacity
              style={{alignItems: 'center', alignSelf: 'center'}}
              onPress={() => addTag()}>
              <Image
                source={require('../../assets/add.png')}
                style={{width: 26, height: 26}}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {filterTag.length > 0 && tagText.replace('#', '').trim() !== '' ? (
          <View style={styles.containerSuggestTag}>
            {filterTag.map((data, index) => {
              return (
                <View key={index}>
                  <View>
                    <TouchableWithoutFeedback onPress={() => selectTag(data)}>
                      <Text style={styles.suggestTag}>{data}</Text>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.containerTag}>
          {tagArr.map((data, index) => {
            return (
              <View key={index}>
                <Text style={styles.textTag}>{data}</Text>
                <View style={{position: 'absolute', right: 9, top: 9}}>
                  <TouchableOpacity onPress={e => removeTag(e, index)}>
                    <Image
                      source={require('../../assets/close.png')}
                      style={styles.imageRemoveTag}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.imageContainer}>
          <ImageView
            images={resourcePath}
            imageIndex={indexImage}
            visible={imageView}
            onRequestClose={() => setImageView(false)}
            animationType="fade"
            swipeToCloseEnabled={false}
            FooterComponent={({imageIndex}) => (
              <View style={styles.footer}>
                <Text style={styles.footerText}>{imageIndex + 1}</Text>
                <Text style={[styles.footerText, {marginLeft: 5}]}>/</Text>
                <Text style={[styles.footerText, {marginLeft: 5}]}>
                  {resourcePath.length}
                </Text>
              </View>
            )}
          />
          {resourcePath.map((e, index) => {
            return (
              <View key={index} style={{margin: 5}}>
                <TouchableOpacity onPress={() => setImageListView(index)}>
                  <Image
                    source={{uri: e.uri}}
                    style={getImageStyle(index, e.height, e.width)}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeImage}
                  onPress={() => closeImage(index)}>
                  <Image
                    source={require('../../assets/close.png')}
                    style={styles.closeButtonImage}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        <View style={styles.imageContainer}>
          {videoArr.map((e, index) => {
            return (
              <View style={{margin: 5}}>
                <TouchableOpacity onPress={() => modalVideo(e)}>
                  <Video
                    source={{uri: e.path}} // Can be a URL or a local file.
                    ref={player}
                    style={getVideoStyle(index)}
                    paused={true}
                    onLoad={() => {
                      player.current.seek(0); // this will set first frame of video as thumbnail
                    }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 40,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}>
                      {convertMiniSecondToTime(e.duration)}
                    </Text>
                    <Image
                      style={{marginLeft: 5, height: 40, width: 40}}
                      source={require('../../assets/play.png')}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeVideo}
                  onPress={() => removeVideo(index)}>
                  <Image
                    source={require('../../assets/close.png')}
                    style={styles.imageRemoveVideo}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
          <Modal
            style={{margin: 0, backgroundColor: 'black'}}
            isVisible={modalFullVis}
            animationInTiming={300}
            animationOutTiming={300}
            backdropTransitionOutTiming={0}
            onBackdropPress={() => setModalFullVis(false)}
            onRequestClose={() => setModalFullVis(false)}>
            <View style={{flex: 1}}>
              <VideoPlayer
                video={{
                  uri: video.path,
                }}
                style={{width: windowWidth, height: windowHeight * 0.95}}
                resizeMode="contain"
                autoplay={true}
                disableControlsAutoHide
                showDuration
              />
              <TouchableOpacity
                style={styles.closeVideoModal}
                onPress={() => setModalFullVis(false)}>
                <Image
                  source={require('../../assets/close-white.png')}
                  style={styles.imageCloseVideo}
                />
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView>
      <Modal
        transparent={true}
        isVisible={modalVis}
        animationInTiming={300}
        animationOutTiming={300}
        backdropTransitionOutTiming={0}
        onBackdropPress={() => setModalVis(false)}
        onRequestClose={() => setModalVis(false)}>
        <View style={styles.moldalContainer}>
          <TouchableOpacity
            style={styles.cameraItem}
            onPress={() => cameraVideo()}
            activeOpacity={0.7}>
            <View style={[styles.imageNav, {marginBottom: 0, elevation: 13}]}>
              <Image
                source={require('../../assets/gradient.png')}
                style={styles.imageGadient}
              />
              <Image
                source={require('../../assets/video.png')}
                style={styles.imageIcon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraItem}
            onPress={() => cameraPicture()}
            activeOpacity={0.7}>
            {/* <Text style={{fontSize: 20, color: '#1e81b0'}}>写真</Text> */}
            <View style={[styles.imageNav, {marginBottom: 0, elevation: 13}]}>
              <Image
                source={require('../../assets/gradient.png')}
                style={styles.imageGadient}
              />
              <Image
                source={require('../../assets/camera.png')}
                style={styles.imageIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
      { Platform.OS === 'ios' ? 
        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={getStatusBarHeight() + 5}>
          {visible === true ? colorBar() : null}
          <View style={getStyleBottomNav()}>
            <View style={styles.iconNav}>
              <TouchableOpacity onPress={() => pickPicture()} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/gallery.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.iconNav}>
              <TouchableOpacity onPress={() => checkCamera()} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/camera.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.iconNav}>
              <TouchableOpacity onPress={() => checkColorBar()} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/color.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.iconNav}>
              <TouchableOpacity
                onPress={() => displayTag(!visibleTag)}
                activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/tag.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.iconNav}>
              <TouchableOpacity onPress={saveDiary} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/save.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      : 
        <View>
          {visible === true ? colorBar() : null}
          <View style={getStyleBottomNav()}>
            <View style={styles.iconNav}>
              <TouchableOpacity onPress={() => pickPicture()} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/gallery.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.iconNav}>
              <TouchableOpacity onPress={() => checkCamera()} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/camera.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.iconNav}>
              <TouchableOpacity onPress={() => checkColorBar()} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/color.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.iconNav}>
              <TouchableOpacity
                onPress={() => displayTag(!visibleTag)}
                activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/tag.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.iconNav}>
              <TouchableOpacity onPress={saveDiary} activeOpacity={0.7}>
                <View style={[styles.imageNav, {elevation: 13}]}>
                  <Image
                    source={require('../../assets/gradient.png')}
                    style={styles.imageGadient}
                  />
                  <Image
                    source={require('../../assets/save.png')}
                    style={styles.imageIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  iconNav: {
    flex: 0,
  },
  imageNav: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.4,
  },
  imageGadient: {
    width: 48,
    height: 48,
    position: 'absolute',
  },
  imageIcon: {
    width: 28,
    height: 28,
  },
  diaryContainer: {
    width: '100%',
    flex: 2,
  },
  textArea: {
    marginLeft: 10,
    textAlignVertical: 'top',
    color: 'black',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingLeft: 5,
    fontSize: 16,
    minHeight: 170,
    maxHeight: 220,
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 40,
    bottom: 70,
    position: 'absolute',
    paddingHorizontal: 10,
  },
  searchColor: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 90,
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textTitle: {
    fontFamily: 'Yu Gothic',
    fontSize: 16,
    color: 'black',
  },
  titleContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: Dimensions.get('window').width - 60,
    paddingLeft: 40,
  },
  rightIconContainer: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 40,
  },
  favorite: {
    width: 20,
    height: 20,
  },
  closeButtonImage: {
    width: 36,
    height: 36,
  },
  textTag: {
    borderWidth: 1,
    padding: 5,
    paddingRight: 15,
    margin: 5,
    borderRadius: 10,
    fontFamily: 'Yu Gothic',
  },
  containerTag: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 5,
    flex: 2,
  },
  containerSuggestTag: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 10,
    marginRight: 2,
    paddingTop: 5,
    paddingBottom: 5,
    width: '80%',
    borderWidth: 1,
  },
  containerVideo: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginLeft: 5,
    marginRight: 5,
  },
  imageRemoveVideo: {width: 30, height: 30},
  imageCloseVideo: {width: 18, height: 18},
  suggestTag: {
    margin: 5,
    fontFamily: 'Yu Gothic',
    fontSize: 16,
  },
  imageRemoveTag: {width: 15, height: 15},
  imageContainer: {
    marginLeft: 5,
    marginRight: 5,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeImage: {position: 'absolute', right: 5, width: 30, height: 30},
  closeVideo: {position: 'absolute', right: 5, top: 2, width: 30, height: 30},
  closeVideoModal: {
    position: 'absolute',
    right: 10,
    top: 25,
    width: 30,
    height: 30,
  },

  cameraItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moldalContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    alignSelf: 'center',
    height: '10%',
    width: Dimensions.get('screen').width - 20,
    marginTop: 'auto',
    bottom: 50,
    borderRadius: 5,
    flexDirection: 'row',
  },
  footer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  footerText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
