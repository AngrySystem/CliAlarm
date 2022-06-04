import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';

import RadioPlayer, { RadioPlayerEvents, RadioPlayerMetadata, } from 'react-native-radio-player';

class Radio {

    play(name) {
        RadioPlayer.radioURL(name);
        RadioPlayer.play();
    }

    stop() {
        RadioPlayer.stop();
    }

    /*
    // State: error, stopped, playing, paused, buffering
    RadioPlayerEvents.addEventListener('stateDidChange', (event) => {
        console.log(event.state);
    });
    // Metadata: {"artistName": "Example Artist", "trackName": "Example Title"}
    RadioPlayerEvents.addListener('MetadataDidChange', (metadata) => {
        console.log(`Artist: ${metadata.artistName}`);
        console.log(`Title: ${metadata.trackName}`);
    });
    */
}

export const onlyRadio = new Radio();