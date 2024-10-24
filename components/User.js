import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext";
import axios from "axios";
import { NGROK_URL } from '@env';

const User = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState(false);
  const [friendRequests,setFriendRequests]=useState([])
  const [userFriends,setUserFriends]=useState([])
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(
          `${NGROK_URL}/friend-requests/sent/${userId}`
        );

        const data = await response.data;
        if (response.status===200) {
          setFriendRequests(data);
        } 
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchFriendRequests();
  }, []);

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const response = await axios.get(`${NGROK_URL}/friends/${userId}`);

        const data = await response.data;

        if (response.status===200) {
          setUserFriends(data);
        } 
      } catch (error) {
        console.log("Error message", error);
      }
    };

    fetchUserFriends();
  }, []);
  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      const response = await axios.post(
        `${NGROK_URL}/friend-request`,
        {
          currentUserId,
          selectedUserId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setRequestSent(true);
      }
    } catch (error) {
      console.log("Error sending friend request", error);
    }
  };
  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
    >
      <View>
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
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
        <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
      </View>
      {userFriends.includes(item._id) ? (
        <Pressable
          style={{
            backgroundColor: "#82CD47",
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: "center", color: "white" }}>Friends</Text>
        </Pressable>
      ) : requestSent || friendRequests.some((friend) => friend._id === item._id) ? (
        <Pressable
          style={{
            backgroundColor: "gray",
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Request Sent
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            backgroundColor: "#567189",
            padding: 10,
            borderRadius: 6,
            width: 105,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Add Friend
          </Text>
        </Pressable>
       )} 
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({});
