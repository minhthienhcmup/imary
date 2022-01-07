import React, {useEffect, useMemo, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Share, {SupportedSocialApps} from 'react-native-share';
import Modal from 'react-native-modal';
import VideoPlayer from 'react-native-video-player';
import {setMarkedDate, convertMiniSecondToTime} from '../../realm/Common';
import {updateData} from '../../realm/ExcuteData';
import ImageView from 'react-native-image-viewing';
import Video from 'react-native-video';
//import RNFetchBlob from 'rn-fetch-blob';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import PropTypes from 'prop-types';
export const ItemDiary = props => {
  // const socialType: SupportedSocialApps = 'facebook';
  const {item, info, deleteDiary} = props;
  const [star, setStar] = useState(item.favorite);
  const [modalVis, setModalVis] = useState(false);
  const [modalDeleteVis, setModalDeleteVis] = useState(false);
  const [modalDeleteConfirmVis, setModalDeleteConfirmVis] = useState(false);
  const [imageView, setImageView] = useState(false);
  const [indexImage, setIndexImage] = useState(0);
  const [displayData, setDisplayData] = useState(true);
  const windowWidth = Dimensions.get('screen').width;
  const [modalFullVis, setModalFullVis] = useState(false);
  const [video, setVideo] = useState('');
  const player = useRef();

  useEffect(() => {
    setStar(item?.favorite);
    setDisplayData(true);
  }, [item]);

  const getImageStyle = (index, length) => {
    let setFull = false;
    let size = windowWidth * 0.67;
    if (length === index + 1 && index % 2 === 0) {
      setFull = true;
    }

    if (setFull === false) {
      return {
        alignSelf: 'center',
        width: size * 0.495 - 7,
        height: size * 0.495,
      };
    }
    return {
      alignSelf: 'center',
      width: size * 0.99 - 12,
      height: size * 0.99 - 12,
    };
  };
  const onchangeStar = async id => {
    await updateData(id, !star);
    if (info?.type === 2 && info?.checkStar) {
      info.navigation.navigate({
        name: 'Search',
        params: {index: info?.index, type: info?.type},
      });
      return;
    }
    setStar(!star);
  };

  const modalVideo = e => {
    setVideo(e);
    setModalFullVis(true);
  };

  const callSocial = async (data, type) => {
    try {
      // setModalVis(false);
      let galleryArr = [];
      let tags = '';
      // if (data.videoSrc !== '') {
      //   galleryArr.push(data.videoSrc.path);
      // } else {
      //   data.imageSrc.forEach(e => {
      //     galleryArr.push(e.uri);
      //   });
      // }

      data?.imageSrc?.forEach(e => {
        galleryArr.push(e?.uri);
      });

      data?.videoSrc?.forEach(async e => {
        // if (Platform.OS === 'ios' && type === 2) {
        //   const res = await RNFetchBlob.config({
        //     fileCache : true,
        //     appendExt : 'mp4'
        //   }).fetch('GET', e.path, {})
        //   const filePath = res.path();
        //   await CameraRoll.save(filePath, 'video');
        //   const base64String = await res.base64();
        //   const url = `data:video/mp4;base64,${base64String}`;
        //   await RNFetchBlob.fs.unlink(filePath);
        //   galleryArr.push(url);
        // } else {
        galleryArr.push(e?.path);
        // }
      });

      data?.tagArr?.forEach(e => {
        tags = tags.concat(e + ' ');
      });

      const content =
        tags?.trim() === ''
          ? data.content
          : data.content + '\n' + tags.trimEnd();

      if (type === 2) {
        // const shareOptions = {
        //   url: galleryArr[0],
        // };
        Clipboard.setString(content);
        if (Platform.OS === 'ios') {
          const shareOptions = {
            url: galleryArr[0],
            excludedActivityTypes: [
              'com.apple.UIKit.activity.PostToTwitter',
              'com.apple.UIKit.activity.PostToFacebook',
              'com.apple.UIKit.activity.PostToWeibo',
              'com.apple.UIKit.activity.Print',
              'com.apple.UIKit.activity.CopyToPasteboard',
              'com.apple.UIKit.activity.AssignToContact',
              'com.apple.UIKit.activity.SaveToCameraRoll',
              'com.apple.UIKit.activity.AddToReadingList',
              'com.apple.UIKit.activity.PostToFlickr',
              'com.apple.UIKit.activity.PostToVimeo',
              'com.apple.UIKit.activity.PostToTencentWeibo',
              'com.apple.UIKit.activity.AirDrop',
              'com.apple.UIKit.activity.OpenInIBooks',
              'com.apple.UIKit.activity.MarkupAsPDF',
              'com.apple.UIKit.activity.Message',
              'com.apple.UIKit.activity.Mail',
              'com.apple.reminders.RemindersEditorExtension',
              'com.apple.mobilenotes.SharingExtension',
              'com.apple.reminders.RemindersEditorExtension',
              'com.linkedin.LinkedIn.ShareExtension',
              'pinterest.ShareExtension',
              'com.google.GooglePlus.ShareExtension',
              'com.tumblr.tumblr.Share-With-Tumblr',
              'net.whatsapp.WhatsApp.ShareExtension',
            ],
          };
          await Share.open(shareOptions);
        } else {
          const shareOptions = {
            url: galleryArr[0],
            social: Share.Social.INSTAGRAM,
          };
          await Share.shareSingle(shareOptions);
        }
      } else {
        const social =
          type === 0 ? Share.Social.TWITTER : Share.Social.FACEBOOK;
        let shareOptions = {};
        // if (data.videoSrc !== '') {
        //   shareOptions = {
        //     message: content,
        //     url: galleryArr[0],
        //     social: social,
        //   };
        // } else {
        //   shareOptions = {
        //     message: content,
        //     urls: galleryArr,
        //     social: social,
        //   };
        // }
        if (Platform.OS === 'android') {
          if (data?.videoSrc?.length > 0 && data?.imageSrc?.length > 0) {
            shareOptions = {
              message: content,
              url: galleryArr[0],
              social: social,
            };
          } else {
            shareOptions = {
              message: content,
              urls: galleryArr,
              social: social,
            };
          }
          Clipboard.setString(content);
          await Share.shareSingle(shareOptions);
        } else {
          if (social === Share.Social.FACEBOOK) {
            shareOptions = {
              message: content,
              urls: galleryArr,
              excludedActivityTypes: [
                'com.apple.UIKit.activity.PostToTwitter',
                'com.apple.UIKit.activity.PostToWeibo',
                'com.apple.UIKit.activity.Print',
                'com.apple.UIKit.activity.CopyToPasteboard',
                'com.apple.UIKit.activity.AssignToContact',
                'com.apple.UIKit.activity.SaveToCameraRoll',
                'com.apple.UIKit.activity.AddToReadingList',
                'com.apple.UIKit.activity.PostToFlickr',
                'com.apple.UIKit.activity.PostToVimeo',
                'com.apple.UIKit.activity.PostToTencentWeibo',
                'com.apple.UIKit.activity.AirDrop',
                'com.apple.UIKit.activity.OpenInIBooks',
                'com.apple.UIKit.activity.MarkupAsPDF',
                'com.apple.UIKit.activity.Message',
                'com.apple.UIKit.activity.Mail',
                'com.apple.reminders.RemindersEditorExtension',
                'com.apple.mobilenotes.SharingExtension',
                'com.linkedin.LinkedIn.ShareExtension',
                'pinterest.ShareExtension',
                'com.google.GooglePlus.ShareExtension',
                'com.tumblr.tumblr.Share-With-Tumblr',
                'net.whatsapp.WhatsApp.ShareExtension',
              ],
            };
          } else {
            if (data?.videoSrc?.length > 0 && data?.imageSrc?.length > 0) {
              shareOptions = {
                message: content,
                url: galleryArr[0],
                excludedActivityTypes: [
                  'com.apple.UIKit.activity.PostToFacebook',
                  'com.apple.UIKit.activity.PostToWeibo',
                  'com.apple.UIKit.activity.Print',
                  'com.apple.UIKit.activity.CopyToPasteboard',
                  'com.apple.UIKit.activity.AssignToContact',
                  'com.apple.UIKit.activity.SaveToCameraRoll',
                  'com.apple.UIKit.activity.AddToReadingList',
                  'com.apple.UIKit.activity.PostToFlickr',
                  'com.apple.UIKit.activity.PostToVimeo',
                  'com.apple.UIKit.activity.PostToTencentWeibo',
                  'com.apple.UIKit.activity.AirDrop',
                  'com.apple.UIKit.activity.OpenInIBooks',
                  'com.apple.UIKit.activity.MarkupAsPDF',
                  'com.apple.UIKit.activity.Message',
                  'com.apple.UIKit.activity.Mail',
                  'com.apple.reminders.RemindersEditorExtension',
                  'com.apple.mobilenotes.SharingExtension',
                  'com.linkedin.LinkedIn.ShareExtension',
                  'pinterest.ShareExtension',
                  'com.google.GooglePlus.ShareExtension',
                  'com.tumblr.tumblr.Share-With-Tumblr',
                  'net.whatsapp.WhatsApp.ShareExtension',
                ],
              };
            } else {
              shareOptions = {
                message: content,
                urls: galleryArr,
                excludedActivityTypes: [
                  'com.apple.UIKit.activity.PostToFacebook',
                  'com.apple.UIKit.activity.PostToWeibo',
                  'com.apple.UIKit.activity.Print',
                  'com.apple.UIKit.activity.CopyToPasteboard',
                  'com.apple.UIKit.activity.AssignToContact',
                  'com.apple.UIKit.activity.SaveToCameraRoll',
                  'com.apple.UIKit.activity.AddToReadingList',
                  'com.apple.UIKit.activity.PostToFlickr',
                  'com.apple.UIKit.activity.PostToVimeo',
                  'com.apple.UIKit.activity.PostToTencentWeibo',
                  'com.apple.UIKit.activity.AirDrop',
                  'com.apple.UIKit.activity.OpenInIBooks',
                  'com.apple.UIKit.activity.MarkupAsPDF',
                  'com.apple.UIKit.activity.Message',
                  'com.apple.UIKit.activity.Mail',
                  'com.apple.reminders.RemindersEditorExtension',
                  'com.apple.mobilenotes.SharingExtension',
                  'com.linkedin.LinkedIn.ShareExtension',
                  'pinterest.ShareExtension',
                  'com.google.GooglePlus.ShareExtension',
                  'com.tumblr.tumblr.Share-With-Tumblr',
                  'net.whatsapp.WhatsApp.ShareExtension',
                ],
              };
            }
          }
          Clipboard.setString(content);
          await Share.open(shareOptions);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getVideoStyle = (height, width) => {
    let size = windowWidth * 0.67;
    if (height > width) {
      return {
        alignSelf: 'center',
        width: size * 0.99 - 12,
        height: windowWidth * 1.8 * 0.6,
      };
    } else if (height < width) {
      return {
        alignSelf: 'center',
        width: size * 0.99 - 12,
        height: windowWidth * 0.7 * 0.6,
      };
    }
    return {
      alignSelf: 'center',
      width: '100%',
      height: '100%',
    };
  };

  const setImageListView = index => {
    setIndexImage(index);
    setImageView(true);
  };

  const openShareModal = () => {
    setModalVis(true);
  };

  // const deleteDiary = async id => {
  //   await deleteById(id);
  //   await updateListDate(id);
  //   setDisplayData(false);
  // };

  const createTwoButtonAlert = () => {
    setModalDeleteVis(false);
    Alert.alert('', 'この記録を削除しますか？', [
      {
        text: 'キャンセル',
        onPress: () => console.log('Cancel Pressed'),
        style: 'default',
      },
      {
        text: '削除',
        onPress: () => deleteDiary(item.id),
        style: 'default',
      },
    ]);
  };

  const navigateToCal = id => {
    if (info?.type !== 2 || (info?.type === 2 && info?.index > 0)) {
      return;
    }
    let date =
      id?.substring(0, 4) +
      '-' +
      id?.substring(4, 6) +
      '-' +
      id?.substring(6, 8);

    let m = new Date(date).getMonth() + 1;
    let y = new Date(date).getFullYear();
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

    let initDate = {
      arrSun: arryListFirst,
      arrSat: arryListLast,
      eventDate: props?.mainData?.[0]?.listDate,
    };

    let objDate = setMarkedDate(
      date,
      arryListLast,
      arryListFirst,
      props?.mainData?.[0]?.listDate,
      0,
    );

    //await props.updateData(props.mainData, date);

    info.navigation.navigate({
      name: 'Calendar',
      params: {
        index: date,
        type: 2,
        id: id,
        startDay: props.mainData[0].startDay,
        mainDate: initDate,
        objDate: objDate,
      },
    });
  };

  return useMemo(
    () => (
      <TouchableOpacity
        onLongPress={() => setModalDeleteVis(true)}
        onPress={() => navigateToCal(item.id)}
        activeOpacity={0.7}>
        {item && displayData && (
          <View style={[styles.containerInfo, {backgroundColor: item.color}]}>
            <Text style={styles.textTime}>{item.updateTime}</Text>
            <View style={styles.diaryContent}>
              <View style={styles.imageContainer}>
                <ImageView
                  images={item?.imageSrc}
                  imageIndex={indexImage}
                  visible={imageView}
                  onRequestClose={() => setImageView(false)}
                  animationType="fade"
                  swipeToCloseEnabled={false}
                  FooterComponent={({imageIndex}) => (
                    <View style={styles.footer}>
                      <Text style={styles.footerText}>{imageIndex + 1}</Text>
                      <Text style={[styles.footerText, {marginLeft: 5}]}>
                        /
                      </Text>
                      <Text style={[styles.footerText, {marginLeft: 5}]}>
                        {item?.imageSrc?.length}
                      </Text>
                    </View>
                  )}
                />
                {item?.imageSrc?.map((e, index) => {
                  return (
                    <View key={index} style={styles.imageDiary}>
                      <TouchableOpacity onPress={() => setImageListView(index)}>
                        <Image
                          source={{uri: e.uri}}
                          style={getImageStyle(index, item?.imageSrc?.length)}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
              {/* {item.videoSrc !== '' ? (
                <View>
                  <VideoPlayer
                    video={{
                      uri: item.videoSrc.path,
                    }}
                    style={getVideoStyle(
                      item.videoSrc.height,
                      item.videoSrc.width,
                    )}
                    resizeMode="cover"
                    controlsTimeout={1000}
                  />
                </View>
              ) : null} */}
              <View style={styles.imageContainer}>
                {item?.videoSrc?.map((e, index) => {
                  return (
                    <View key={index} style={styles.imageDiary}>
                      <TouchableOpacity onPress={() => modalVideo(e)}>
                        <Video
                          source={{uri: e?.path}} // Can be a URL or a local file.
                          ref={player}
                          style={getImageStyle(index, item?.videoSrc?.length)}
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
                            top: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 13,
                              fontWeight: 'bold',
                            }}>
                            {convertMiniSecondToTime(e?.duration)}
                          </Text>
                          <Image
                            style={{marginLeft: 5, height: 35, width: 35}}
                            source={require('../../assets/play.png')}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <Modal
                  style={{
                    flex: 1,
                    margin: 0,
                    backgroundColor: 'black',
                  }}
                  isVisible={modalFullVis}
                  animationInTiming={300}
                  animationOutTiming={300}
                  backdropTransitionOutTiming={0}
                  onBackdropPress={() => setModalFullVis(false)}
                  onRequestClose={() => setModalFullVis(false)}>
                  <View
                    style={{
                      flex: 1,
                      paddingTop: getStatusBarHeight(),
                      paddingBottom: getBottomSpace(),
                    }}>
                    <VideoPlayer
                      video={{
                        uri: video?.path,
                      }}
                      style={{width: windowWidth, height: '100%'}}
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
              {!!item?.content?.trim() && (
                <Text style={styles.textDiary}>{item?.content}</Text>
              )}
              {item?.tagArr?.length > 0 && (
                <View style={styles.tagContainer}>
                  {item?.tagArr?.map((data, index) => {
                    return (
                      <View key={index}>
                        <Text style={styles.tag}>{data}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            <View style={styles.favorite}>
              {/* <TouchableWithoutFeedback onPress={() => setModalVis(!modalVis)}>
            <Image
              style={{width: 18, height: 18}}
              source={require('../../assets/share.png')}
            />
          </TouchableWithoutFeedback> */}
              <TouchableWithoutFeedback
                onPress={() => {
                  onchangeStar(item.id);
                }}>
                {star ? (
                  <Image
                    style={{width: 20, height: 20}}
                    source={require('../../assets/starFilled.png')}
                  />
                ) : (
                  <Image
                    style={{width: 20, height: 20}}
                    source={require('../../assets/starEmpty.png')}
                  />
                )}
              </TouchableWithoutFeedback>
            </View>
            <Modal
              animationInTiming={300}
              animationOutTiming={300}
              animationIn="fadeIn"
              animationOut="fadeOut"
              backdropTransitionOutTiming={0}
              transparent={true}
              isVisible={modalDeleteVis}
              onRequestClose={() => setModalDeleteVis(false)}
              onBackdropPress={() => setModalDeleteVis(false)}>
              <Modal
                animationInTiming={300}
                animationOutTiming={300}
                animationIn="fadeIn"
                animationOut="fadeOut"
                backdropTransitionOutTiming={0}
                transparent={true}
                backdropColor="transparent"
                isVisible={modalVis}
                onRequestClose={() => setModalVis(false)}
                onBackdropPress={() => setModalVis(false)}
                // onModalWillHide={() => setModalDeleteVis(false)}
              >
                <View style={styles.moldalContainer}>
                  <Text style={{marginTop: 5}}>SNS連携</Text>
                  <View style={styles.socialContainer}>
                    <TouchableOpacity onPress={() => callSocial(item, 0)}>
                      <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                          source={require('../../assets/twitter.png')}
                          style={{height: 51, width: 50}}
                        />
                        <Text>Twitter</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => callSocial(item, 1)}>
                      <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                          source={require('../../assets/facebook.png')}
                          style={{height: 50, width: 50}}
                        />
                        <Text>Facebook</Text>
                      </View>
                    </TouchableOpacity>
                    {(item?.videoSrc && item?.videoSrc !== '') ||
                      (item?.imageSrc?.length > 0 && (
                        <TouchableOpacity onPress={() => callSocial(item, 2)}>
                          <View style={{alignItems: 'center', padding: 10}}>
                            <Image
                              source={require('../../assets/instagram.png')}
                              style={{height: 50, width: 50}}
                            />
                            <Text>Instagram</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                  <View style={{marginBottom: 10}}>
                    <Text style={styles.textGuide}>
                      投稿文全体がコピーされています。
                    </Text>
                    <Text style={styles.textGuide}>
                      シェア画面にて、貼り付けてください。
                    </Text>
                  </View>
                </View>
              </Modal>
              <View style={styles.moldalDeleteContainer}>
                <TouchableOpacity
                  style={styles.cameraItem}
                  onPress={() => openShareModal()}>
                  <View style={styles.imageNav}>
                    <Image
                      source={require('../../assets/Gradient.png')}
                      style={styles.imageGadient}
                    />
                    <Image
                      source={require('../../assets/share.png')}
                      style={styles.imageIcon}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraItem}
                  onPress={() => createTwoButtonAlert()}>
                  <View style={styles.imageNav}>
                    <Image
                      source={require('../../assets/Gradient.png')}
                      style={styles.imageGadient}
                    />
                    <Image
                      source={require('../../assets/delete.png')}
                      style={{width: 38, height: 38}}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        )}
      </TouchableOpacity>
    ),
    [
      star,
      item,
      modalVis,
      modalDeleteVis,
      modalDeleteConfirmVis,
      imageView,
      displayData,
      modalFullVis,
      video,
    ],
  );
};

ItemDiary.defaultProps = {
  deleteDiary: () => {},
};

ItemDiary.propTypes = {
  item: PropTypes.object,
  info: PropTypes.string,
  deleteDiary: PropTypes.func,
};

const styles = StyleSheet.create({
  containerInfo: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  textTime: {
    paddingTop: 2,
    paddingLeft: 7,
    width: '16%',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Yu Gothic',
  },
  diaryContent: {
    paddingTop: 2,
    width: '70%',
    marginLeft: 10,
    marginRight: 10,
  },
  imageDiary: {
    margin: 1,
  },
  textDiary: {
    fontSize: 14,
    fontFamily: 'Yu Gothic',
  },
  favorite: {
    width: '5%',
  },
  tag: {
    paddingRight: 5,
    fontFamily: 'Yu Gothic',
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
  moldalContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    height: 170,
  },
  moldalDeleteContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    height: 170,
    flexDirection: 'row',
  },
  modalDeleteConfirmMessage: {
    fontFamily: 'Yu Gothic',
    fontSize: 25,
    marginTop: '15%',
    paddingHorizontal: '5%',
    textAlign: 'center',
  },
  modalDeleteConfirmButton: {
    height: '25%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingEnd: '10%',
    marginTop: '10%',
  },
  modalDeleteConfirmButtonText: {
    fontFamily: 'Yu Gothic',
    fontSize: 25,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#5A86B1',
  },
  socialContainer: {
    flexDirection: 'row',
  },
  cameraItem: {
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 56,
    height: 56,
    position: 'absolute',
  },
  imageIcon: {
    width: 32,
    height: 32,
  },
  textGuide: {
    fontSize: 13,
    fontFamily: 'Yu Gothic',
  },
  footerText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
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
  closeVideoModal: {
    position: 'absolute',
    right: 5,
    top: getStatusBarHeight(),
    width: 30,
    height: 30,
  },
  imageCloseVideo: {width: 18, height: 18},
});
