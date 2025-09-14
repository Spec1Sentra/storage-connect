import React, {useContext, useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {firestore, storage} from '../../firebaseConfig';
import {doc, updateDoc, arrayUnion} from 'firebase/firestore';
import {UserContext} from '../../App';
import dayjs from 'dayjs';

export default function ChoreCard({chore}){
  const {user} = useContext(UserContext);
  const [loading,setLoading]=useState(false);

  const claim = async ()=>{
    setLoading(true);
    const ref = doc(firestore,'chores',chore.id);
    await updateDoc(ref,{claimer:user.uid,status:'claimed',claimedAt:new Date()});
    setLoading(false);
    alert('Chore claimed! Coordinate via circle chat.');
  };

  return (
    <View style={styles.card}>
      <View style={{flex:1}}>
        <Text style={{fontWeight:'700'}}>{chore.title}</Text>
        <Text style={{color:'#666',marginTop:4}}>{chore.description}</Text>
        <Text style={{marginTop:8}}>{chore.credits} credits • Level {chore.level} • {chore.status || 'open'}</Text>
        <Text style={{marginTop:8,fontSize:12,color:'#999'}}>Posted {dayjs(chore.createdAt.toDate()).fromNow ? dayjs(chore.createdAt.toDate()).fromNow() : ''}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={claim} disabled={loading || chore.status==='claimed'}>
        <Text style={{color:'#fff',fontWeight:'700'}}>{chore.status==='claimed' ? 'Claimed' : 'Claim'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({card:{backgroundColor:'#fff',padding:16,marginBottom:12,borderRadius:12,flexDirection:'row',alignItems:'center',shadowColor:'#000',shadowOpacity:0.06},btn:{backgroundColor:'#0066FF',paddingVertical:10,paddingHorizontal:12,borderRadius:8}});
