import React from 'react';
import {ItemDiary} from '../ItemDiary';
import {
  StyleSheet,
  Text,
  SectionList,
  Dimensions,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

export const ViewDataList = props => {
  const {data, deleteDiary} = props;
  const dateContainer = date => {
    if (date === data[0].title) {
      return {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get('window').width - 30,
        paddingLeft: 30,
      };
    }

    return {
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      width: Dimensions.get('window').width - 30,
      paddingLeft: 30,
      marginTop: 15,
    };
  };

  return (
    <SectionList
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      numColumns={1}
      stickySectionHeadersEnabled={false}
      horizontal={false}
      sections={props?.data}
      bounces={false}
      onEndReachedThreshold={0.7}
      removeClippedSubviews={true} // Unmount components when outside of window
      initialNumToRender={8} // Reduce initial render amount
      maxToRenderPerBatch={1} // Reduce number in each render batch
      updateCellsBatchingPeriod={100} // Increase time between renders
      windowSize={7} // Reduce the window size
      // onScrollToIndexFailed={info => {
      //   setTimeout(() =>
      //     scrollEnd.current?.scrollToLocation(
      //       {
      //         animating: true,
      //         itemIndex: props.data[0].data.length + 1,
      //         viewPosition: 0,
      //       },
      //       500,
      //     ),
      //   );
      // }}
      contentContainerStyle={{paddingBottom: 60}}
      renderSectionHeader={({section}) => {
        if (props.type === 2) {
          return (
            // <TouchableWithoutFeedback
            //   onPress={() => callToCalendar(section.title)}>
            //   <View style={dateContainer(section.title)}>
            //     <Text style={styles.textDate}>{section.title}</Text>
            //   </View>
            // </TouchableWithoutFeedback>
            <View style={dateContainer(section.title)}>
              <Text style={styles.textDate}>{section.title}</Text>
            </View>
          );
        }
        return (
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
            <View style={dateContainer(section.title)}>
              <Text style={styles.textDate}>{section.title}</Text>
            </View>
            {section.title === props.data[0].title && (
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
            )}
          </View>
        );
      }}
      renderItem={({item, i}) => (
        <ItemDiary i={i} item={item} info={props} deleteDiary={deleteDiary} />
      )}
      keyExtractor={(item, index) => index}
    />
  );
};

ViewDataList.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  data: PropTypes.array,
  type: PropTypes.number,
  deleteDiary: PropTypes.func,
};

ViewDataList.defaultProps = {
  deleteDiary: () => {},
};

const styles = StyleSheet.create({
  textDate: {
    marginTop: '2%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Yu Gothic',
  },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  setting: {
    width: 20,
    height: 20,
  },
});
