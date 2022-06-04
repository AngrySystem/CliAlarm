import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Switch, TouchableOpacity, Alert } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification from "react-native-push-notification";

import AddScreen from './AddScreen';
import { onlyRadio } from '../Radio';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreAllLogs();

export default function HomeScreen(props) {
    const [alarmList, setAlarmList] = useState([]);

    const [mod, setMod] = useState(false);

    const [currentAlarm, setCurrentAlarm] = useState('empty');

    const createChannels = () => {
        PushNotification.createChannel({
            channelId: "test-channel",
            channelName: "Test Channel"
        }, (created) => { console.log(`created channel returned ${created}`) })
    }

    const setData = async (value) => {
        await AsyncStorage.setItem('storage', value);
    }

    const getData = async () => {
        let gotten = await AsyncStorage.getItem('storage');
        setAlarmList(gotten != null ? JSON.parse(gotten) : []);
    }

    useEffect(() => {
        getData();
        createChannels();
    }, [])

    return (
        <View style={styles.mContainer}>

            <View>
                <FlatList
                    data={alarmList}
                    renderItem={({ item }) => <AlarmItem id={item.id} minutes={item.minutes} hours={item.hours} togl={item.isActive} list={alarmList} radio={item.radio} set={setData} get={getData} setCurrent={setCurrentAlarm} getcurrent={currentAlarm} />}
                    keyExtractor={(item) => item.id}
                />
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity style={styles.button} onPress={() => { setMod(true) }}>
                    <Text style={{ fontSize: 30, fontWeight: '700', paddingBottom: 7 }}>+</Text>
                </TouchableOpacity>
            </View>

            <AddScreen mod={mod} set={setMod} list={alarmList} setList={setAlarmList} />

        </View>
    );
}

function AlarmItem(props) {
    const [enable, setEnable] = useState(props.togl);
    const [timer, setTimer] = useState('');

    const toggleSwitch = () => {
        setEnable(oldValue => !oldValue);

        props.list.forEach(
            (elem) => {
                if (elem.id == props.id) {
                    elem.isActive = !enable;
                };
            });
        
        props.set(JSON.stringify(props.list));
        props.get();
    }

    const delItem = () => {
        const newList = props.list.filter(item => item.id != props.id);
        const newListJson = JSON.stringify(newList);

        if (props.id == props.getcurrent) {
            onlyRadio.stop();
        }
        BackgroundTimer.clearTimeout(timer);

        props.set(newListJson);
        props.get();
    }

    const pushNotify = () => {
        PushNotification.localNotification({
            channelId: "test-channel",
            title: "Time!",
            message: `Already ${String(props.hours).length == 1 ? '0' + props.hours : props.hours}:${String(props.minutes).length == 1 ? '0' + props.minutes : props.minutes}`,
        })
    }

    const computeTimer = () => {
        let nows = new Date(Date.now());
        let firstDate = new Date(0, 0, 0, nows.getHours(), nows.getMinutes(), nows.getSeconds());
        let secondDate = new Date(0, 0, 0, props.hours, props.minutes, 0);
        let different = secondDate - firstDate;

        if (different > -60000) {
            return different;
        } else {
            let differentRes = Math.abs(firstDate - secondDate);
            let hours = Math.floor(24 - (differentRes % 86400000) / 3600000);
            let minuts = Math.round(60 - ((differentRes % 86400000) % 3600000) / 60000);
            let end = new Date(0, 0, 0, hours, minuts, 0);
            let endhelp = new Date(0, 0, 0, 0, 0, 0);
            return end - endhelp;
        }
    }

    const stopper = () => {
        BackgroundTimer.clearTimeout(timer);
        if (props.getcurrent == props.id) {
            props.setCurrent('empty');
            onlyRadio.stop();
        }
    }

    const stopperAlert = () => {
        props.setCurrent('empty');
        BackgroundTimer.clearTimeout(timer);
        onlyRadio.stop();
    }

    useEffect(() => {
        if (enable) {
            setTimer(BackgroundTimer.setTimeout(() => {
                Alert.alert('Alert', `Already ${String(props.hours).length == 1 ? '0' + props.hours : props.hours}:${String(props.minutes).length == 1 ? '0' + props.minutes : props.minutes}`, [
                    {
                        text: "Disable",
                        onPress: () => { stopperAlert() }
                    },
                    {
                        text: "Ok",
                    },
                ]);
                onlyRadio.play(props.radio);
                pushNotify();
                props.setCurrent(props.id);
            }, computeTimer()));
        }
        if (!enable) {
            stopper();            
        }       
    }, [enable])

    return (
        <View style={styles.aItem}>
            <View style={{ paddingLeft: 30, flexDirection: 'column', alignItems: 'center' }}>
                <View style={{ marginTop: 15 }}>
                    <Text style={{ fontSize: 50, fontWeight: '600' }}>{String(props.hours).length == 1 ? '0' + props.hours : props.hours}:{String(props.minutes).length == 1 ? '0' + props.minutes : props.minutes}</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 12, paddingBottom: 15 }}>{props.radio == 'http://dorognoe.hostingradio.ru:8000/dorognoe' ? 'Road Radio' : (props.radio == 'http://icecast.mirtv.cdnvideo.ru:8000/radio_mir128' ? 'Radio World' : 'Business FM')}</Text>
                </View>
            </View>

            <View style={props.getcurrent == props.id ? styles.play : styles.noPlay}></View>

            <View style={{ alignItems: 'center', height: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>

                <View style={{ width: 60, marginRight: 15 }}>
                    <Switch value={enable} onValueChange={toggleSwitch} trackColor={{ false: "#ede9d5", true: "#baf5b8" }} thumbColor={enable ? '#57e352' : '#ebe7e4'} />
                </View>

                <TouchableOpacity style={{ width: 50, height: '100%', justifyContent: 'center' }} onPress={delItem}>
                    <Ionicons name="md-trash-outline" size={24} color="black" />
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mContainer: {
        flex: 1,
        backgroundColor: '#ebe7e4',
        padding: 10,
        justifyContent: 'space-between',
    },
    aItem: {
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#faf8f5',
        borderRadius: 10,
        marginBottom: 10
    },
    button: {
        position: 'absolute',
        top: -65,
        width: 65,
        height: 65,
        backgroundColor: '#ccb681',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.75
    },
    play: {
        width: 10,
        height: 10,
        borderRadius: 30,
        backgroundColor: 'red',
        marginLeft: 65,
        marginTop: 3
    },
    noPlay: {
        width: 10,
        height: 10,
        borderRadius: 50,
        marginLeft: 65,
        marginTop: 3
    }
})