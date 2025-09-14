import React, {useState, useContext} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {firestore} from '../../firebaseConfig';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import {UserContext} from '../../App';

export default function ChoreCreate({navigation}){
  const {user} = useContext(UserContext);
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const [credits,setCredits]=useState('5');
  const [level,setLevel]=useState('1');

  const create = async ()=>{
    if(!title) return alert('Title required');
    await addDoc(collection(firestore,'chores'),{
      title, description:desc, credits:parseInt(credits,10), level:parseInt(level,10), poster:user.uid, status:'open', createdAt:serverTimestamp(), circleId: user.circles && user.circles[0] ? user.circles[0] : null
    });
    navigation.goBack();
  };

  return (
    <View style={{flex:1,padding:16}}>
      <Text style={{fontSize:20,fontWeight:'700'}}>Create Chore</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={desc} onChangeText={setDesc} style={[styles.input,{height:100}]} multiline />
      <View style={{flexDirection:'row',gap:12}}>
        <TextInput placeholder="Credits" value={credits} onChangeText={setCredits} style={[styles.input,{flex:1}]} keyboardType='numeric'/>
        <TextInput placeholder="Level" value={level} onChangeText={setLevel} style={[styles.input,{flex:1}]} keyboardType='numeric'/>
      </View>
      <TouchableOpacity style={styles.btn} onPress={create}><Text style={{color:'#fff'}}>Post Chore</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({input:{borderWidth:1,borderColor:'#eee',padding:12,borderRadius:8,marginTop:12},btn:{marginTop:20,backgroundColor:'#0066FF',padding:14,alignItems:'center',borderRadius:8}});
