import React from 'react';
import {StyleSheet, View, Image, TouchableOpacity, Dimensions} from 'react-native';

export const BottomNav = props => {
  return (
    <View style={styles.bottomNav}>
      <View style={styles.iconNav}>
        <TouchableOpacity onPress={() => props.navigation.navigate('Calendar')} activeOpacity={0.7}>
          <View style={[styles.imageNav, {elevation: 13}]}>
            <Image
              source={require('../../assets/gradient.png')}
              style={styles.imageGadient}
            />
            <Image
              source={require('../../assets/calendar.png')}
              style={styles.imageIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.iconNav}>
        <TouchableOpacity onPress={() => props.navigation.navigate('Search')} activeOpacity={0.7}>
          <View style={[styles.imageNav, {elevation: 13}]}>
            <Image
              source={require('../../assets/gradient.png')}
              style={styles.imageGadient}
            />
            <Image source={require('../../assets/search.jpg')} 
            style={styles.imageIcon2} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.iconNav}>
        {props.type !== 0 ? (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate('Main', {
                index: 0,
                type: 0,
                isWrite: false,
              })
            } 
            activeOpacity={0.7}>
            <View style={[styles.imageNav, {elevation: 13}]}>
              <Image
                source={require('../../assets/gradient.png')}
                style={styles.imageGadient}
              />
              <Image
                source={require('../../assets/main.png')}
                style={[styles.imageIcon1, {marginRight: 3}]}
              />
            </View>
          </TouchableOpacity>
        ) : (
          
            <View style={styles.imageNav} />
        )}
      </View>
      <View style={styles.iconNav}>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('Main', {
              index: 0,
              type: 1,
              isWrite: false,
            })
          } 
          activeOpacity={0.7}>
          <View style={[styles.imageNav, {elevation: 13}]}>
            <Image
              source={require('../../assets/gradient.png')}
              style={styles.imageGadient}
            />
            <Image
              source={require('../../assets/random.png')}
              style={[styles.imageIcon1]}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.iconNav}>
        <TouchableOpacity onPress={() => props.navigation.navigate('Write')} activeOpacity={0.7}>
          <View style={[styles.imageNav, {elevation: 13}]}>
            <Image
              source={require('../../assets/gradient.png')}
              style={styles.imageGadient}
            />
            <Image
              source={require('../../assets/writeDiary.png')}
              style={styles.imageIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    height: 55,
    flexDirection: 'row',
    justifyContent:'space-around',
    alignItems:'center',
    bottom: 0,
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
    shadowColor: "#000",
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
  imageIcon1: {
    width: 40,
    height: 40,
  },
  imageIcon2: {
    width: 32,
    height: 32,
  },
});
