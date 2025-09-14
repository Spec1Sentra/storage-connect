import React, {useEffect, useState, useContext} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {firestore, storage} from '../../firebaseConfig';
import {collection, query, where, onSnapshot, orderBy} from 'firebase/firestore';
import {UserContext} from '../../App';
import {Ionicons} from '@expo/vector-icons';
import ChoreCard from '../shared/ChoreCard';

export default function HomeScreen({navigation}){
  const {user}=useContext(UserContext);
  const [chores,setChores]=useState([]);

  useEffect(()=>{
    // feed: chores from user's circles
    if(!user) return;
    const q = query(collection(firestore,'chores'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q,(snap)=>{
      const arr=[];
      snap.forEach(doc=>{arr.push({id:doc.id,...doc.data()})});
      // quick filter: chores in user's circles or open within same campus
      setChores(arr.filter(c=>!c.circleId || (user.circles && user.circles.includes(c.circleId))));
    });
    return ()=>unsub();
  },[user]);

  return (
    <View style={{flex:1}}>
      <View style={styles.header}>
        <Text style={{fontSize:22,fontWeight:'700'}}>ChoreSwap</Text>
        <View style={{flexDirection:'row',gap:12}}>
          <TouchableOpacity onPress={()=>navigation.navigate('Create')}><Ionicons name="add-circle-outline" size={28}/></TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('Profile')}><Ionicons name="person-circle-outline" size={28}/></TouchableOpacity>
        </View>
      </View>
      <FlatList data={chores} keyExtractor={i=>i.id} renderItem={({item})=> <ChoreCard chore={item} />} contentContainerStyle={{padding:16}} />
    </View>
  );
}

const styles = StyleSheet.create({header:{padding:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}});
