import React, {useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {UserContext} from '../../App';
import {doc, getDoc} from 'firebase/firestore';
import {firestore} from '../../firebaseConfig';

export default function ProfileScreen(){
  const {user,setUser} = useContext(UserContext);
  const [fresh,setFresh] = useState(null);

  useEffect(()=>{(async()=>{const d = (await getDoc(doc(firestore,'users',user.uid))).data(); setFresh(d); setUser({uid:user.uid,...d});})();},[]);

  if(!fresh) return null;
  return (
    <View style={{flex:1,padding:16}}>
      <Text style={{fontSize:24,fontWeight:'700'}}>{fresh.name}</Text>
      <Text style={{color:'#666',marginTop:6}}>Credits: {fresh.credits}</Text>
      <Text style={{color:'#666',marginTop:6}}>XP: {fresh.xp}</Text>
      <Text style={{color:'#666',marginTop:6}}>Karma: {fresh.karma}</Text>
      <TouchableOpacity style={[styles.btn,{marginTop:20}]} onPress={()=>alert('Invite flow: share circle code')}><Text style={{color:'#fff'}}>Invite Roommates</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({btn:{backgroundColor:'#0066FF',padding:12,borderRadius:8,alignItems:'center'}});
