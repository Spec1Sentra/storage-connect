import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {auth, provider} from '../../firebaseConfig';
import {signInWithPopup} from 'firebase/auth';
import {UserContext} from '../../App';

export default function AuthScreen(){
  const {setUser} = useContext(UserContext);

  const loginGoogle = async ()=>{
    try{
      // Expo / mobile uses GoogleSignIn or Firebase web fallback; for Jules/IDX testing this uses web popup.
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged in App will create user doc
    } catch(e){
      console.error(e);
      alert('Google sign-in failed; use email login in Firebase console or test flow.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h}>ChoreSwap</Text>
      <Text style={styles.s}>Turn chores into someone else's joy</Text>
      <TouchableOpacity style={styles.btn} onPress={loginGoogle}>
        <Text style={styles.btnText}>Continue with Google</Text>
      </TouchableOpacity>
      <Text style={{marginTop:16,fontSize:12,color:'#666'}}>Email login available via Firebase Auth (test accounts) if popup blocked.</Text>
    </View>
  );
}

const styles = StyleSheet.create({container:{flex:1,alignItems:'center',justifyContent:'center',padding:24},h:{fontSize:36,fontWeight:'700'},s:{fontSize:16,marginTop:8,color:'#555'},btn:{marginTop:24,backgroundColor:'#0066FF',padding:14,borderRadius:10},btnText:{color:'#fff',fontWeight:'700'}});
