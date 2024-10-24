import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { UserType } from "../UserContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { NGROK_URL } from '@env';

const FriendRequests = ({ item, friendRequests, setFriendRequests }) => {
    const {userId,setUserId}=useContext(UserType);
    const navigation=useNavigation()
    const acceptRequest = async (friendRequestId) => {
        try {
            const response = await axios.post(
                `${NGROK_URL}/friend-request/accept`,
                {
                    senderId: friendRequestId,
                    recepientId: userId
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status === 200) {
                
                setFriendRequests(
                    friendRequests.filter((request) => request._id !== friendRequestId)
                );
                navigation.navigate("Chats")
            }
        } catch (error) {
            console.log("Error accepting friend request", error);
        }
    };
console.log(NGROK_URL)
  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        maxWidth: "100%",
      }}
    >
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
          item.image ? { uri: item.image } : require("../assets/user.jpg")
        }
      />
      <Text
        style={{ flex: 1, marginLeft: 10, flexShrink: 1, flexWrap: "wrap",fontSize:15, fontWeight:'bold' }}
      >
        {item?.name} sent you a friend request
      </Text>
      <Pressable
      onPress={()=>acceptRequest(item._id)}
        style={{ backgroundColor: "#0066B2", padding: 10, borderRadius: 6 }}
      >
        <Text style={{ textAlign: "center", color: "white" }}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequests;

const styles = StyleSheet.create({});
