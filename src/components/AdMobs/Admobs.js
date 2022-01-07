import React, {useState, useEffect} from 'react';
import {Platform, View, Text} from 'react-native';
import {AdMobBanner} from 'react-native-admob';

export const Admob = () => {
  const [errorAd, setErrorAd] = useState(false);

  useEffect(() => {
    setErrorAd(false);
  }, []);

  return (
    <View
      style={{
        width: '100%',
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {errorAd == true ? (
        <View
          style={{
            width: '100%',
            height: 90,
            justifyContent: 'center',
            textAlign: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
          <Text style={{fontSize: 25}}>Imary</Text>
        </View>
      ) : (
        <AdMobBanner
          adSize="smartBannerPortrait"
          testDevices={['']}
          adUnitID={
            Platform.OS == 'ios'
              ? 'ca-app-pub-3205609387650984/4070470007'
              : 'ca-app-pub-3205609387650984/3287871379'
          }
          onAdFailedToLoad={error => {
            if (error.message.includes('Invalid ad width or height')) {
              setErrorAd(false);
            } else {
              setErrorAd(true);
            }
          }}
        />
      )}
    </View>
  );
};
