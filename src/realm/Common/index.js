import {PermissionsAndroid, Platform} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

export const isAndroid = Platform.OS === 'android';

export const mergeListTag = (tagArr, listTag) => {
  let unionArr = [...listTag, ...tagArr];
  let result = unionArr.filter((item, pos) => unionArr.indexOf(item) === pos);
  return result;
};

export const mergeListDate = listDate => {
  let listArr = [...listDate];
  if (listArr.length === 0 || listDate.indexOf(getCurrentCalDate()) === -1) {
    listArr.push(getCurrentCalDate());
  }
  return listArr;
};

export const hasAndroidPermission = async () => {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  } else {
    console.log('not granted');
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
};

export const saveVideo = async path => {
  if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
    return;
  }
  await CameraRoll.save(path, {album: 'imary'});
};

export const searchData = (dairyText, tagText, colorArr, favorite, data) => {
  var dataArr = [];
  if (
    dairyText.trim() === '' &&
    tagText.trim() === '' &&
    colorArr.length === 0 &&
    favorite === false
  ) {
    return data;
  }
  data.forEach(e => {
    if (
      dairyText.trim() !== '' &&
      !e.content.toUpperCase().includes(dairyText.toUpperCase())
    ) {
      return;
    }

    if (
      tagText.trim() !== '' &&
      !e.tagText.toUpperCase().includes(tagText.toUpperCase())
    ) {
      return;
    }

    if (colorArr.length > 0 && !colorArr.includes(e.color)) {
      return;
    }

    if (favorite === true && !e.favorite === true) {
      return;
    }
    dataArr.push(e);
  });
  return dataArr;
};

export const getListVideoName = snapshot => {
  let data = [];
  snapshot?.forEach(e => {
    if (e?.video && e.video !== '') {
      let videoSrc = JSON.parse(e.video);
      if (videoSrc?.[0]?.filename) {
        data.push(videoSrc?.[0]?.filename);
      }
    }
  });
  return data;
};

export const formatDataCal = (snapshot, d) => {
  let data = [];
  snapshot.forEach(e => {
    if (e.fullDate !== d) {
      return;
    }

    let imageSrc =
      e?.imageSrc && e.imageSrc !== '' ? JSON.parse(e.imageSrc) : [];
    // console.log(imageSrc);
    //let videoSrc = e.video !== '' ? JSON.parse(e.video) : '';

    let videoSrc = e?.video && e.video !== '' ? JSON.parse(e.video) : [];
    videoSrc = Array.isArray(videoSrc) ? videoSrc : [videoSrc];
    console.log(videoSrc);
    let diary = {
      content: e.content,
      color: e.color,
      favorite: e.favorite,
      updateTime: e.time,
      id: e._id,
      tagArr: e.tag,
      imageSrc: imageSrc,
      date: e.fullDate,
      videoSrc: videoSrc,
    };
    data.push(diary);
  });
  data.sort(function (a, b) {
    return a.id.localeCompare(b.id);
  });
  return data;
};
export const formatData = (snapshot, type, initDate, listDate) => {
  let dateBk = '';
  let data = [];
  let diaryArr = [];
  let date = '';
  let sumRandom = 0;
  let index = 0;
  var initSnapshot;

  let iDate = initDate ? initDate : new Date();
  if (type === 0) {
    initSnapshot = setMainData(snapshot, iDate);
  }

  if (type === 0 || type === 1) {
    if (listDate.indexOf(getCurrentCalDate(iDate)) === -1) {
      dateBk = getCurrentDate(true, iDate) + getDay(iDate.getDay());
      if (getCurrentDate(true) + getDay(new Date().getDay()) === dateBk) {
        date = 'Today　' + dateBk;
      } else {
        date = dateBk;
      }

      let objDate = {
        title: date,
        data: [],
        r: 0,
      };
      data.push(objDate);
    }
  }
  dateBk = '';

  initSnapshot?.forEach(element => {
    if (dateBk !== '' && dateBk !== element.fullDate) {
      if (getCurrentDate(true) + getDay(new Date().getDay()) === dateBk) {
        date = 'Today　' + dateBk;
      } else {
        date = dateBk;
      }
      let r =
        getCurrentDate(true, iDate) + getDay(iDate.getDay()) === dateBk
          ? 0
          : (sumRandom / index) * Math.random();

      let objDate = {
        title: date,
        data:
          date.startsWith('Today') && (type === 0 || type === 1)
            ? diaryArr
            : diaryArr.sort(function (a, b) {
                return a.id.localeCompare(b.id);
              }),
        r: r,
      };
      sumRandom = 0;
      index = 0;
      diaryArr = [];
      data.push(objDate);
    }

    let imageSrc =
      element?.imageSrc && element?.imageSrc !== ''
        ? JSON.parse(element.imageSrc)
        : [];
    imageSrc = Array.isArray(imageSrc) ? imageSrc : [imageSrc];

    let videoSrc =
      element?.video && element?.video !== '' ? JSON.parse(element.video) : [];
    videoSrc = Array.isArray(videoSrc) ? videoSrc : [videoSrc];
    console.log(videoSrc);
    let diary = {
      content: element?.content,
      color: element?.color ?? '#F5F5F5',
      favorite: element?.favorite,
      updateTime: element?.time,
      id: element?._id,
      tagArr: element?.tag,
      imageSrc: imageSrc,
      videoSrc: videoSrc,
    };
    diaryArr.push(diary);
    dateBk = element.fullDate;
    sumRandom = sumRandom + element.r;
    index = index + 1;
  });

  if (dateBk !== '') {
    if (getCurrentDate(true) + getDay(new Date().getDay()) === dateBk) {
      date = 'Today　' + dateBk;
    } else {
      date = dateBk;
    }

    let r =
      getCurrentDate(true, iDate) + getDay(iDate.getDay()) === dateBk
        ? 0
        : (sumRandom / index) * Math.random();

    let objDate = {
      title: date,
      data:
        date.startsWith('Today') && (type === 0 || type === 1)
          ? diaryArr
          : diaryArr.sort(function (a, b) {
              return a.id.localeCompare(b.id);
            }),
      r: r,
    };
    diaryArr = [];
    data.push(objDate);
  }

  if (type === 1) {
    data.sort((a, b) => a.r - b.r);
  }
  return data;
};

export const getCurrentDate = (format, initDate) => {
  let dt = initDate ? initDate : new Date();
  if (format) {
    return (
      dt.getFullYear() +
      '/' +
      ('0' + (dt.getMonth() + 1)).slice(-2) +
      '/' +
      ('0' + dt.getDate()).slice(-2)
    );
  }
  return (
    dt.getFullYear() +
    ('0' + (dt.getMonth() + 1)).slice(-2) +
    ('0' + dt.getDate()).slice(-2)
  );
};

export const getDay = day => {
  switch (day) {
    default:
      return '（日）';
    case 1:
      return '（月）';
    case 2:
      return '（火）';
    case 3:
      return '（水）';
    case 4:
      return '（木）';
    case 5:
      return '（金）';
    case 6:
      return '（土）';
  }
};

export const getFullDay = day => {
  switch (day) {
    default:
      return '日曜日';
    case 1:
      return '月曜日';
    case 2:
      return '火曜日';
    case 3:
      return '水曜日';
    case 4:
      return '木曜日';
    case 5:
      return '金曜日';
    case 6:
      return '土曜日';
  }
};

export const getCurrentCalDate = initDate => {
  let dt = initDate ? initDate : new Date();
  return (
    dt.getFullYear() +
    '-' +
    ('0' + (dt.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + dt.getDate()).slice(-2)
  );
};

export const getCurrentTime = format => {
  let dt = new Date();
  if (format) {
    return (
      ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2)
    );
  }
  return (
    ('0' + dt.getHours()).slice(-2) +
    ('0' + dt.getMinutes()).slice(-2) +
    ('0' + dt.getSeconds()).slice(-2)
  );
};

function getArrDate(initDate) {
  let arrMonth = [0, 1, 3, 6];
  let arrDate = [];
  let arrTitle = [];
  arrMonth.forEach(e => {
    let newDt = new Date(initDate);
    newDt.setMonth(newDt.getMonth() - e);

    let title =
      e === 0
        ? ''
        : e === 1
        ? '１ヶ月前　'
        : e === 3
        ? '3ヶ月前　'
        : '半年前　';

    let date =
      newDt.getFullYear() +
      ('0' + (newDt.getMonth() + 1)).slice(-2) +
      ('0' + newDt.getDate()).slice(-2);
    arrDate.push(date);
    arrTitle.push(title);
  });

  for (let i = 0; i < 10; i++) {
    let title = i + 1 + '年前　';
    let newDt = new Date(initDate);
    newDt.setYear(newDt.getFullYear() - (i + 1));
    let date =
      newDt.getFullYear() +
      ('0' + (newDt.getMonth() + 1)).slice(-2) +
      ('0' + newDt.getDate()).slice(-2);
    arrDate.push(date);
    arrTitle.push(title);
  }
  return [arrDate, arrTitle];
}

const setMainData = (data, initDate) => {
  if (!data) {
    return;
  }
  let dataArr = [];
  let dateArr = getArrDate(initDate);
  data?.forEach(e => {
    let index = dateArr[0].indexOf(e._id.substr(0, 8));
    if (index !== -1) {
      let item = {
        _id: e._id,
        color: e.color,
        content: e.content,
        day: e.day,
        favorite: e.favorite,
        fullDate: dateArr[1][index] + e.fullDate,
        imageSrc: e.imageSrc,
        r: e.r,
        tag: e.tag,
        tagText: e.tagText,
        time: e.time,
        video: e.video,
      };
      dataArr.push(item);
    }
  });
  return dataArr;
};

const convertApi = async val => {
  try {
    const url =
      'https://kanji-kana.herokuapp.com/v1/reading?sentence=' +
      val +
      '&nbest_num=1';
    const response = await fetch(url);
    const json = await response.json();
    return json.items[0].reading.replace(/\s/g, '');
  } catch (error) {
    return '';
  }
};

export const convertListTag = async lstTag => {
  let strLstTag = '';
  lstTag.forEach(e => {
    strLstTag = strLstTag.concat(e.replace(/\s/g, '').replace('#', '') + ';');
  });

  strLstTag = strLstTag.substring(0, strLstTag.length - 1);
  const strConvertApi = await convertApi(strLstTag);
  if (strConvertApi.trim() === '') {
    return [];
  }
  let lstArr = strConvertApi.split(';');
  return lstArr;
};

export const setMarkedDate = (
  active,
  lastArr,
  firstArr,
  evenArr,
  type,
  objMark,
) => {
  let td = getCurrentCalDate();
  let markDateEvent = type === 0 ? {} : objMark.markDateEvent;
  let markDateSat = type === 0 || type === 1 ? {} : objMark.markDateSat;
  let markDateSun = type === 0 || type === 1 ? {} : objMark.markDateSun;
  let markToday = type === 0 ? {} : objMark.markToday;
  let markActiveDay = type === 0 || type === 2 ? {} : objMark.markActiveDay;

  if (type === 0) {
    evenArr.map(day => {
      markDateEvent = {
        ...markDateEvent,
        [day]: {
          marked: true,
          dotColor: '#50cebb',
        },
      };
    });
  }

  if (type === 0 || type === 1) {
    lastArr.map(day => {
      if (evenArr?.length > 0 && evenArr?.indexOf(day) !== -1) {
        markDateSat = {
          ...markDateSat,
          [day]: {
            marked: true,
            dotColor: '#50cebb',
            customStyles: {
              text: {
                color: 'blue',
              },
            },
          },
        };
      } else {
        markDateSat = {
          ...markDateSat,
          [day]: {
            customStyles: {
              text: {
                color: 'blue',
              },
            },
          },
        };
      }
    });
    firstArr.map(day => {
      if (evenArr?.length > 0 && evenArr.indexOf(day) !== -1) {
        markDateSun = {
          ...markDateSun,
          [day]: {
            marked: true,
            dotColor: '#50cebb',
            customStyles: {
              text: {
                color: 'red',
              },
            },
          },
        };
      } else {
        markDateSun = {
          ...markDateSun,
          [day]: {
            customStyles: {
              text: {
                color: 'red',
              },
            },
          },
        };
      }
    });

    if (new Date(td).getDay() === 0) {
      evenArr?.length > 0 && evenArr.indexOf(td) !== -1
        ? (markToday = {
            ...markToday,
            [td]: {
              marked: true,
              dotColor: '#50cebb',
              customStyles: {
                container: {
                  borderRadius: 0,
                  borderWidth: 1,
                  borderColor: 'orange',
                },
                text: {color: 'red'},
              },
            },
          })
        : (markToday = {
            ...markToday,
            [td]: {
              customStyles: {
                container: {
                  borderRadius: 0,
                  borderWidth: 1,
                  borderColor: 'orange',
                },
                text: {color: 'red'},
              },
            },
          });
    } else if (new Date(td).getDay() === 6) {
      evenArr?.length > 0 && evenArr.indexOf(td) !== -1
        ? (markToday = {
            ...markToday,
            [td]: {
              marked: true,
              dotColor: '#50cebb',
              customStyles: {
                container: {
                  borderRadius: 0,
                  borderWidth: 1,
                  borderColor: 'orange',
                },
                text: {color: 'blue'},
              },
            },
          })
        : (markToday = {
            ...markToday,
            [td]: {
              customStyles: {
                container: {
                  borderRadius: 0,
                  borderWidth: 1,
                  borderColor: 'orange',
                },
                text: {color: 'blue'},
              },
            },
          });
    } else {
      evenArr?.length > 0 && evenArr.indexOf(td) !== -1
        ? (markToday = {
            ...markToday,
            [td]: {
              marked: true,
              dotColor: '#50cebb',
              customStyles: {
                container: {
                  borderRadius: 0,
                  borderWidth: 1,
                  borderColor: 'orange',
                },
              },
            },
          })
        : (markToday = {
            ...markToday,
            [td]: {
              customStyles: {
                container: {
                  borderRadius: 0,
                  borderWidth: 1,
                  borderColor: 'orange',
                },
              },
            },
          });
    }
  }

  if (type === 0 || type === 2) {
    if (new Date(active).getDay() === 0) {
      evenArr?.length > 0 && evenArr.indexOf(active) !== -1
        ? (markActiveDay = {
            ...markActiveDay,
            [active]: {
              marked: true,
              dotColor: '#50cebb',
              customStyles: {
                selected: true,
                container: {
                  backgroundColor: '#FBE6A3',
                },
                text: {
                  color: 'red',
                },
              },
            },
          })
        : (markActiveDay = {
            ...markActiveDay,
            [active]: {
              customStyles: {
                selected: true,
                container: {
                  backgroundColor: '#FBE6A3',
                },
                text: {
                  color: 'red',
                },
              },
            },
          });
    } else if (new Date(active).getDay() === 6) {
      evenArr?.length > 0 && evenArr.indexOf(active) !== -1
        ? (markActiveDay = {
            ...markActiveDay,
            [active]: {
              marked: true,
              dotColor: '#50cebb',
              customStyles: {
                selected: true,
                container: {
                  backgroundColor: '#FBE6A3',
                },
                text: {
                  color: 'blue',
                },
              },
            },
          })
        : (markActiveDay = {
            ...markActiveDay,
            [active]: {
              customStyles: {
                selected: true,
                container: {
                  backgroundColor: '#FBE6A3',
                },
                text: {
                  color: 'blue',
                },
              },
            },
          });
    } else {
      evenArr?.length > 0 && evenArr.indexOf(active) !== -1
        ? (markActiveDay = {
            ...markActiveDay,
            [active]: {
              marked: true,
              dotColor: '#50cebb',
              customStyles: {
                selected: true,
                container: {
                  backgroundColor: '#FBE6A3',
                },
              },
            },
          })
        : (markActiveDay = {
            ...markActiveDay,
            [active]: {
              customStyles: {
                selected: true,
                container: {
                  backgroundColor: '#FBE6A3',
                },
              },
            },
          });
    }
  }

  const returnedTarget = Object.assign(
    {},
    markDateEvent,
    markDateSun,
    markDateSat,
    markToday,
    markActiveDay,
  );

  return {
    markDateEvent: markDateEvent,
    markDateSun: markDateSun,
    markDateSat: markDateSat,
    markToday: markToday,
    markActiveDay: markActiveDay,
    markedDate: returnedTarget,
  };
  //setMarked(markDate);
};

export const convertMiniSecondToTime = duration => {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  if (hours === '00') {
    return minutes + ':' + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
};
