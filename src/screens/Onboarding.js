import React, {useState, useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {firestore} from '../../firebaseConfig';
import {doc, updateDoc} from 'firebase/firestore';
import {UserContext} from '../../App';

const archetypes = [
  {id:'zen', label:'Zen Folder - loves organizing'},
  {id:'speed', label:'Speed Demon - quick tasks'},
  {id:'social', label:'Social Butterfly - group chores'},
  {id:'solver', label:'Problem Solver - fixes & repairs'}
];

export default function Onboarding({navigation}){
  const {user,setUser} = useContext(UserContext);
  const [choice,setChoice] = useState(null);

  const finish = async ()=>{
    if(!choice) return alert('Pick one archetype');
    const ref = doc(firestore,'users',user.uid);
    await updateDoc(ref,{personality:choice});
    setUser({...user,personality:choice});
    navigation.replace('Home');
  };

  return (
    <View style={styles.c}>
      <Text style={styles.h}>Welcome to ChoreSwap</Text>
      <Text style={styles.s}>Pick the chore archetype that fits you best</Text>
      {archetypes.map(a=>(
        <TouchableOpacity key={a.id} style={[styles.card, choice===a.id && {borderColor:'#0066FF',borderWidth:2}]} onPress={()=>setChoice(a.id)}>
          <Text style={styles.cardText}>{a.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.btn} onPress={finish}><Text style={{color:'#fff'}}>Finish</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({c:{flex:1,padding:24},h:{fontSize:28,fontWeight:'700'},s:{color:'#666',marginBottom:12},card:{padding:16,marginVertical:8,backgroundColor:'#fff',borderRadius:10,shadowColor:'#000',shadowOpacity:0.06},cardText:{fontSize:16},btn:{marginTop:24,backgroundColor:'#0066FF',padding:14,alignItems:'center',borderRadius:8}});
