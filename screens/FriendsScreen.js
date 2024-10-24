import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserType } from '../UserContext';
import FriendRequests from '../components/FriendRequests';
import { NGROK_URL } from '@env';

const FriendsScreen = () => {
    const {userId,setUserId}=useContext(UserType);
    const [friendRequests,setFriendRequests]=useState([])
    useEffect(() => {
        fetchFriendRequests()
    }, [])
    const fetchFriendRequests=async()=>{
        try {
            const response= await axios.get(`${NGROK_URL}/friend-request/${userId}`);
            if(response.status===200){
                const friendRequestData=response.data.map((friendRequest)=>({
                    _id:friendRequest._id,
                    name:friendRequest.name,
                    email:friendRequest.email,
                    image:friendRequest.image
                }))
                setFriendRequests(friendRequestData)
            }
        } catch (error) {
            console.log("Error",error)
        }
    }
    console.log(friendRequests)
    console.log(NGROK_URL)
  return (
    <View style={{padding:10, marginHorizontal:12}}>
        {friendRequests.length>0 && <Text>You have {friendRequests.length} friend requests</Text>}
        {friendRequests.map((item,index)=>{
            return <FriendRequests key={index} item={item} friendRequests=
            {friendRequests}
            setFriendRequests={setFriendRequests}
            />
        })}
    </View>
  )
}

export default FriendsScreen

const styles = StyleSheet.create({})