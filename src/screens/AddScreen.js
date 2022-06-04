import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';

export default function AddScreen(props) {

    const [date, setDate] = useState(new Date(Date.now()));
    const [show, setShow] = useState(false);
    const [isSelected, setIsSelected] = useState('');
    const [warning, setWarning] = useState('');

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showPicker = () => {
        setShow(true);
    }

    const changeActive = (value) => {
        setIsSelected(value);
    }

    const goBackSave = () => {
        let same = false;
        for (let i = 0; i < props.list.length; i++) {
            if (props.list[i]['hours'] == date.getHours() && props.list[i]['minutes'] == date.getMinutes()) {
                same = true;
            }
        }

        if (isSelected == '' || same) {
            if (isSelected == '') {
                setWarning('Please select a radio station');
            } else {
                setWarning('There is already an alarm clock with this time')
            }
        } else {
            const stations = {
                'one': 'http://dorognoe.hostingradio.ru:8000/dorognoe',
                'two': 'http://icecast.mirtv.cdnvideo.ru:8000/radio_mir128',
                'three': 'http://bfm.hostingradio.ru:8004/fm'
            }

            let newAlarm = { id: Date.now().toString(), minutes: date.getMinutes(), hours: date.getHours(), isActive: true, radio: stations[isSelected] };
            let newList = [...props.list, newAlarm];

            const newListJson = JSON.stringify(newList);
            setData(newListJson);

            props.setList(newList);

            setIsSelected('');
            props.set(false);

            setWarning('');
            setDate(new Date(Date.now()));
            
            getData();
        }
    }

    const simpleBack = () => {
        setIsSelected('');
        setWarning('');
        setDate(new Date(Date.now()));
        props.set(false);
    }

    const setData = async (value) => {
        await AsyncStorage.setItem('storage', value);
    }

    const getData = async () => {
        let gotten = await AsyncStorage.getItem('storage');
        props.setList(gotten != null ? JSON.parse(gotten) : []);
    }

    return (
        <Modal visible={props.mod} animationType='fade'>

            <View>

                <View style={styles.firstBlock}>
                    <Text style={{ fontSize: 80, fontWeight: '700' }}>{date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:{date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}</Text>
                </View>

                <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
                    <TouchableOpacity style={styles.addAlarmButton} onPress={() => { showPicker() }}>
                        <Text style={{ fontSize: 18, fontWeight: '500' }}>Choose time...</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
                    <ToggleButton type='one' isSelected={isSelected} setIsSelected={changeActive} text={'Road Radio'} />
                    <ToggleButton type='two' isSelected={isSelected} setIsSelected={changeActive} text={'Radio World'} />
                    <ToggleButton type='three' isSelected={isSelected} setIsSelected={changeActive} text={'Business FM'} />
                </View>

                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ color: 'red' }}>{warning}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginHorizontal: 13 }}>
                    <View>
                        <TouchableOpacity onPress={() => { simpleBack() }} style={{ width: 65, height: 65, backgroundColor: '#f7dda1', borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="arrow-back" size={28} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity style={{ width: 65, height: 65, backgroundColor: '#ceff6b', borderRadius: 40, justifyContent: 'center', alignItems: 'center' }} onPress={() => { goBackSave() }}>
                            <FontAwesome5 name="check" size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={'time'}
                        is24Hour={true}
                        onChange={onChange}
                    />
                )}

            </View>
        </Modal>
    );
}

const ToggleButton = (props) => {

    const buttonHandler = (key) => {
        props.setIsSelected(key);
    }

    return (
        <TouchableOpacity style={props.isSelected == props.type ? styles.activeButton : styles.buttons} onPress={() => buttonHandler(props.type)}>
            <Text style={{ fontSize: 20, fontWeight: '600', alignItems: 'center', justifyContent: 'center' }}>{props.text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    firstBlock: {
        height: 200,
        backgroundColor: '#f7f1e1',
        borderRadius: 50,
        marginTop: 20,
        marginHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addAlarmButton: {
        backgroundColor: '#fadc6b',
        width: 140,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    buttons: {
        height: 50,
        width: 150,
        justifyContent: 'center',
        backgroundColor: '#bdb499',
        borderRadius: 17,
        marginBottom: 10,
        alignItems: 'center',
    },
    activeButton: {
        height: 50,
        width: 150,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 17,
        marginBottom: 10,
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1
    }
})