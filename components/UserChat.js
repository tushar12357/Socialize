import { Pressable, StyleSheet, Text, View,Image } from 'react-native'
import React, { useContext,useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { UserType } from '../UserContext'
import axios from 'axios'
import { NGROK_URL } from "@env";


const UserChat = ({item}) => {
  const navigation=useNavigation()
  const [messages,setMessages]=useState([])
  const {userId,setUserId}=useContext(UserType);
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${NGROK_URL}/messages/${userId}/${item._id}`
      );
      const data = await response.data;
      if (response.status === 200) {
        setMessages(data);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  useEffect(() => {
    fetchMessages();
  }, []);
  console.log("Messages",messages)
  const getLastMessage=()=>{
    const userMessages=messages.filter((message)=>message.messageType==="text")
    const n=userMessages.length;
    return userMessages[n-1];
  }
  const lastMessage=getLastMessage()
  console.log("Last message",lastMessage)
  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };
  console.log(NGROK_URL)
  return (
    <Pressable 
    onPress={()=>navigation.navigate("Messages",{
      recepientId:item._id
    })}
    style={{flexDirection:'row', alignItems:'center',gap:10, borderWidth:0.7, borderColor:'#D0D0D0', borderTopWidth:0, borderLeftWidth:0, borderRightWidth:0, padding:10}}>
        <Image
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          resizeMode: "cover",
          backgroundColor: "lightgray",
          borderColor: "black",
          borderWidth: 1,
        }}
        source={
          item?.image ? { uri: item?.image } : require("../assets/user.jpg")
        }
      />
      <View style={{flex:1}}>
        <Text style={{fontSize:15, fontWeight:'500'}}>{item?.name}</Text>
        {lastMessage && (
          <Text style={{marginTop:5, color:'gray', fontWeight:'500'}}>{lastMessage?.message}</Text>

        )}
      </View>
      <View>
        <Text style={{fontSize:11, fontWeight:'400', color:'#585858'}}>{lastMessage && formatTime(lastMessage?.timeStamp)}</Text>
      </View>
    </Pressable>
  )
}

export default UserChat

const styles = StyleSheet.create({})