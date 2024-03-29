import Realm from 'realm';
import {getCurrentDate, getCurrentTime, getDay} from '../../realm/Common';
import DefaultPreference from 'react-native-default-preference';

const appGroupIdentifier = 'group.com.imary';

export const Diary_Schema = {
  name: 'diaryData',
  properties: {
    _id: 'string',
    fullDate: 'string',
    time: 'string',
    color: 'string',
    content: 'string',
    favorite: 'bool',
    r: 'int',
    day: 'int',
    tag: 'string[]',
    imageSrc: 'string',
    video: 'string',
    tagText: 'string',
  },
  primaryKey: '_id',
};

export const Init_Schema = {
  name: 'initData',
  properties: {
    _id: 'string',
    password: 'string',
    usePass: 'bool',
    listTag: 'string[]',
    listDate: 'string[]',
    startDay: 'int',
  },
  primaryKey: '_id',
};

export const saveData = async (
  diaryContent,
  color,
  favorite,
  tagArr,
  imageSrc,
  listTags,
  video,
  listDates,
) => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });

  let fullDate = getCurrentDate(true) + getDay(new Date().getDay());
  let time = getCurrentTime(true);
  let id = getCurrentDate(false) + getCurrentTime(false);
  let imageSource =
    imageSrc !== '' ? JSON.stringify(imageSrc) : '';
  let tagText = '';
  tagArr.forEach(item => {
    tagText = tagText.concat(item);
  });

  let videoSource = video !== '' ? JSON.stringify(video) : '';
  let data = {
    _id: id,
    fullDate: fullDate,
    time: time,
    content: diaryContent,
    color: color,
    favorite: favorite,
    day: new Date().getDate(),
    tag: tagArr,
    imageSrc: imageSource,
    video: videoSource,
    tagText: tagText,
    r: Math.random() * 100000,
  };

  let dataInit = {
    _id: '1',
    listTag: listTags,
    listDate: listDates,
  };

  realm.write(() => {
    realm.create('initData', dataInit, true);
    realm.create('diaryData', data);
  });
  DefaultPreference.setName(appGroupIdentifier);

  const year = data._id.substring(0, 4);
  const month = data._id.substring(4, 6);
  const day = data._id.substring(6, 8);
  const hour = data._id.substring(8, 10);
  const minute = data._id.substring(10, 12);
  const date = year + '/' + month + '/' + day + ' ' + hour + ':' + minute;
  let image = data.imageSrc !== '' ? JSON.parse(data.imageSrc) : [];
  image = Array.isArray(imageSrc) ? imageSrc : [imageSrc];
  DefaultPreference.get('widgetBackgroundOpt').then(opt => {
    if (image.length > 0 && (opt === '0' || opt === undefined)) {
      DefaultPreference.set('backgroundImage', image[0].uri);
    }
  })
  DefaultPreference.set('date', date);
};
saveData().catch(error => {
  console.log(`An error occurred: ${error}`);
});

export const updateData = async (id, favorite) => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });

  let data = {
    _id: id,
    favorite: favorite,
  };

  realm.write(() => {
    let result = realm.create('diaryData', data, true);
  });
};

export const updateUsePass = async usePass => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });

  let data = {
    _id: '1',
    usePass: usePass,
  };

  realm.write(() => {
    let result = realm.create('initData', data, true);
    console.log(result);
  });
};

export const updatePass = async pass => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });

  let data = {
    _id: '1',
    password: pass,
  };

  realm.write(() => {
    let result = realm.create('initData', data, true);
  });
};

export const updateStartDay = async startDay => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });

  let data = {
    _id: '1',
    startDay: startDay,
  };

  realm.write(() => {
    let result = realm.create('initData', data, true);
    console.log(result);
  });
};

export const deleteById = async id => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });
  realm.write(() => {
    realm.delete(realm.objectForPrimaryKey('diaryData', id)); 
  });
};

export const updateListDate = async id => {
  const realm = await Realm.open({
    schema: [Diary_Schema, Init_Schema],
    schemaVersion: 5,
  });
  const date =
    id.substring(0, 4) + '-' + id.substring(4, 6) + '-' + id.substring(6, 8);
  const result = realm
    .objects('diaryData')
    .filtered('_id BEGINSWITH[c] $0', id.substring(0, 8));
  if (result.length === 0) {
    let resultInit = realm.objects('initData');
    let listDates = [...resultInit[0].listDate];
    const index = listDates.indexOf(date);
    console.log('date ', date, index);

    if (index > -1) {
      listDates.splice(index, 1);
    }
    var dataInit = {
      _id: '1',
      listDate: listDates,
    };
    realm.write(() => {
      realm.create('initData', dataInit, true);
    });
  }
}
