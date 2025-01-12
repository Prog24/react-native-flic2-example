import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, StatusBar, Platform, Vibration } from 'react-native';

import Flic2 from 'react-native-flic2';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPause, faPlay, faTrash, faEdit, faBatteryQuarter, faBatteryFull } from '@fortawesome/free-solid-svg-icons';

import prompt from 'react-native-prompt-android';
import { request as requestPermission, PERMISSIONS } from 'react-native-permissions';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-root-toast';

const App = () => {
  const [buttons, setButtons] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (typeof Flic2.isInitialized === 'function' && Flic2.isInitialized() === true) {
      onInitialized();
    } else {
      Flic2.addListener('managerInitialized', onInitialized);
    }
    Flic2.addListener('didReceiveButtonClick', didReceiveButtonClick);
    Flic2.addListener('didReceiveButtonHold', didReceiveButtonHold);
    Flic2.addListener('didReceiveButtonDoubleClick', didReceiveButtonDouble);
    Flic2.addListener('scanResult', onScanResult);
  }, []);

  const getButtons = async () => {
    setButtons(await Flic2.getButtons());
  };

  const onInitialized = () => {
    Flic2.connectAllKnownButtons();
    getButtons();
  };

  const forgetAllButtons = async () => {
    await Flic2.forgetAllButtons();
    getButtons();
  };

  const startScan = async () => {
    // check os
    if (Platform.OS === 'android') {
      await requestPermission(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }
    // set to scanning
    setScanning(true);
    // go!
    Flic2.startScan();
  };

  const stopScan = () => {
    setScanning(false);
    Flic2.stopScan();
  };

  const connectButton = (button) => {
    // connect it
    button.connect(button);
    // update our button list
    getButtons();
  };

  const disconnectButton = (button) => {
    // disconnect it
    button.disconnect(button);
    // update our button list
    getButtons();
  };

  const forgetButton = (button) => {
    // forget it
    button.forget();
    // update our button list
    getButtons();
  };

  const editButtonName = (button) => {
    // use the prompt to change the name
    prompt(
      'Edit Flic nickname',
      'Choose a name you will recognize',
      [
        { text: 'Cannel', style: 'cancel' },
        {
          text: 'OK',
          onPress: value => {
            // save
            button.setName(value);
            // get new buttons
            getButtons();
          },
        },
      ],
      {
        type: 'plain-text',
        cancelable: true,
        defaultValue: button.getName(),
      }
    );
  };

  const onScanResult = (data) => {
    if (data.event === 'completion') {
      setScanning(false);

      // check
      if (data.error === false) {
        alert('The button has been added');
        getButtons();
      } else {
        if (data.result === Flic2.constants.SCAN_RESULT_ERROR_ALREADY_CONNECTED_TO_ANOTHER_DEVICE) {
          alert('This button is already connected to another device');
        } else if (data.result === Flic2.constants.SCAN_RESULT_ERROR_NO_PUBLIC_BUTTON_DISCOVERED) {
          alert('No buttons found');
        } else {
          alert(`Could not connect\n\nError code: ${data.result}`);
        }
      }
    }
  };

  const didReceiveButtonClick = (eventData) => {
    console.log('Received click event', eventData);
    // update list
    getButtons();
    // do something with the click like showing a notification
    Toast.show(`Button ${eventData.button.getName()} has been pressed ${eventData.button.getPressCount()} times`);

    // wobble
    // we do this extensive check because when you develop the app with live reload, the _logoRef will break.
    if (typeof this._logoRef !== 'undefined' && this._logoRef !== null && typeof this._logoRef.wobble === 'function') {

      // wobble wobble
      this._logoRef.wobble();

    }
    // vibrate
    Vibration.vibrate(200);
  };

  const didReceiveButtonHold = (eventData) => {
    console.log('Received hold event', eventData);
    // update list
    getButtons();
    // do something with the click like showing a notification
    Toast.show(`Button ${eventData.button.getName()} has been hold ${eventData.button.getPressCount()} times`);

    // wobble
    // we do this extensive check because when you develop the app with live reload, the _logoRef will break.
    if (typeof this._logoRef !== 'undefined' && this._logoRef !== null && typeof this._logoRef.wobble === 'function') {

      // wobble wobble
      this._logoRef.wobble();

    }
    // vibrate
    Vibration.vibrate(200);
  };

  const didReceiveButtonDouble = (eventData) => {
    console.log('Received double event', eventData);
    // update list
    getButtons();
    // do something with the click like showing a notification
    Toast.show(`Button ${eventData.button.getName()} has been double ${eventData.button.getPressCount()} times`);

    // wobble
    // we do this extensive check because when you develop the app with live reload, the _logoRef will break.
    if (typeof this._logoRef !== 'undefined' && this._logoRef !== null && typeof this._logoRef.wobble === 'function') {

      // wobble wobble
      this._logoRef.wobble();

    }
    // vibrate
    Vibration.vibrate(200);
  };

  const getBatteryIcon = (batteryPercentage) => {
    if (batteryPercentage === true) {
      return faBatteryFull;
    } else {
      return faBatteryQuarter;
    }
  };


  return (
    <View style={style.container}>
      <StatusBar barStyle="light-content" />
      {/* eslint-disable-next-line */}
      <Animatable.Image ref={ image => this._logoRef = image } style={style.logo} useNativeDriver={true} source={require('./images/flic-logo.png')} />
      {/* Scan button */}
      {
        scanning === false ?
        <TouchableOpacity onPress={startScan.bind(this)}>
          <View style={style.button}><Text style={style.buttonText}>Start scan</Text></View>
        </TouchableOpacity>
        :
        <TouchableOpacity onPress={stopScan.bind(this)}>
          <View style={style.button}><Text style={style.buttonText}>Scanning... (click to cancel)</Text></View>
        </TouchableOpacity>
      }
      <TouchableOpacity onPress={forgetAllButtons.bind(this)}>
        <View style={style.button}><Text style={style.buttonText}>Forget all buttons</Text></View>
      </TouchableOpacity>

      <View style={style.buttonContainer}>
        <Text style={style.heading}>Button list:</Text>
        {
          buttons.length > 0 ?
          <FlatList
            data={buttons}
            keyExtractor={item => item.uuid}
            renderItem={row => {
              // define button
              const button = row.item
              // eslint-disable-next-line react-native/no-inline-styles
              return <View style={[style.listItem, { borderColor: button.getIsReady() ? '#006e1a' : '#b00000' }]}>
                <FontAwesomeIcon style={style.icon} icon={getBatteryIcon(button.getBatteryLevelIsOk())} size={16} />
                <Text style={style.pressCount}>{button.getPressCount()}</Text>
                <Text style={style.listItemText}>{button.getName()}</Text>
                <View style={style.icons}>
                  {
                    button.getIsReady() === true ?
                    <TouchableOpacity onPress={disconnectButton.bind(this, button)}><FontAwesomeIcon icon={faPause} size={16} /></TouchableOpacity>
                    :
                    <TouchableOpacity onPress={connectButton.bind(this, button)}><FontAwesomeIcon icon={faPlay} size={16} /></TouchableOpacity>
                  }
                  <TouchableOpacity onPress={forgetButton.bind(this, button)}><FontAwesomeIcon icon={faTrash} size={16} /></TouchableOpacity>
                  <TouchableOpacity onPress={editButtonName.bind(this, button)}><FontAwesomeIcon icon={faEdit} size={16} /></TouchableOpacity>
                </View>
              </View>;
            }}
          />
          :
          <Text>There are no buttons paired to this app. Click 'start scan' and hold your flic button to add a new button.</Text>
        }
      </View>
    </View>
  );
};

// define stylesheet
const style = StyleSheet.create({

  // container
  container: {
    paddingTop: 20,
    padding: 10,
    backgroundColor: '#45454d',
    flex: 1,
  },

  // logo
  logo: {
    width: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  // button
  button: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ff0089',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },

  // button container
  buttonContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 10,
    marginTop: 20,
  },

  // heading
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // list item
  listItem: {
    padding: 20,
    paddingLeft: 15,
    paddingRight: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f3f9ff',
    borderWidth: 2,
  },
  listItemText: {
    flex: 1,
  },
  pressCount: {
    width: 25,
    color: 'rgba(40, 40, 40, 0.5)',
    fontSize: 10,
  },

  // icons
  icons: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  icon: {
    marginRight: 7,
  },

});

export default App;
