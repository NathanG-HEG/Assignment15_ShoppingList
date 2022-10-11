import {StatusBar} from 'expo-status-bar';
import {Pressable, StyleSheet, Text, TextInput, View, FlatList, Alert} from 'react-native';
import {useEffect, useState} from "react";
import * as SQLite from 'expo-sqlite';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Input, Button, ListItem} from 'react-native-elements';

export default function App() {
    const [item, setItem] = useState("");
    const [amount, setAmount] = useState("");
    const [list, setList] = useState([]);

    const db = SQLite.openDatabase('shopping_list.db');

    const addItem = () => {
        db.transaction(tx => {
                tx.executeSql(
                    'INSERT INTO shoppingList (name, amount) VALUES (?,?);',
                    [item, amount]
                );
            }, error => {
                console.log(error);
                Alert.alert('An error occurred ' + error);
            },
            updateList);
        setItem('');
        setAmount('');
    }

    const deleteItem = (item) => {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM shoppingList WHERE id = ?;', [item.id]);
        }, error => {
            console.log(error);
            Alert.alert('An error occurred ' + error);
        }, () => {
            console.log('Item ' + item.id + ' successfully deleted!');
            updateList();
        })
    }

    const updateList = () => {
        console.log("Table updated or created!");
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM shoppingList;',
                [],
                (_, {rows}) =>
                    setList(rows._array)
            );
        }, error => {
            console.log(error);
            Alert.alert('An error occurred: ' + error);
        }, null);
    }

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS shoppingList (id INTEGER PRIMARY KEY NOT NULL, name TEXT, amount TEXT);'
            );
        }, error => {
            console.log(error);
            Alert.alert('An error occurred ' + error)
        }, updateList);
    }, []);

    const renderItem = ({item}) =>
        <ListItem.Swipeable
            rightContent={
                <Button
                    title="Delete"
                    icon={{name: 'delete', color: 'white'}}
                    buttonStyle={{minHeight: '100%', backgroundColor: 'red'}}
                    onPress={()=>deleteItem(item)}
                />
            }
        >
            <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
                <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
            </ListItem.Content>
        </ListItem.Swipeable>

    return (
        <View style={styles.container}>
            <Input
                keyboardType="default"
                onChangeText={item => setItem(item)} value={item}
                placeholder='Item'
                textAlign='center'
            />
            <Input
                keyboardType="default"
                onChangeText={amount => setAmount(amount)} value={amount}
                placeholder='Amount'
                textAlign='center'
            />
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button
                    icon={{
                        name: "save",
                        size: 15,
                        color: "white"
                    }}
                    title="Add"
                    onPress={addItem}
                    buttonStyle={{backgroundColor: 'lightblue'}}
                />
            </View>
            <Text style={styles.listTitle}>Shopping List</Text>
            <View style={styles.list}>
                <FlatList
                    data={list}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            <StatusBar style="auto"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 44,
        paddingBottom: 11,
    },
    textInput: {
        borderColor: "#000",
        height: 44,
        marginTop: 11,
        marginBottom: 5,
        width: 200,
        borderWidth: 1
    },
    result: {
        padding: 5,
        fontSize: 16
    },
    button: {
        paddingVertical: 11,
        paddingHorizontal: 11,
        marginTop: 11,
        backgroundColor: 'lightblue',
        marginHorizontal: 11
    },
    list: {
        borderColor: "black",
        borderWidth: 0.5,
        borderStyle: 'dotted',
        width: '90%',
        flex: 1,
        backgroundColor: 'white',

    },
    listTitle: {
        fontSize: 25,
        backgroundColor: "lightblue",
        width: '90%',
        textAlign: 'center',
        color: 'white'
    }
});