import { StyleSheet, Text, View , ScrollView, Pressable} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import UserChat from "../components/UserChat";
import { NGROK_URL } from '@env';

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  useEffect(() => {
    const acceptedFriendsList = async () => {
      try {
        const response = await axios.get(
          `${NGROK_URL}/accepted-friends/${userId}`
        );
        const data = await response.data;
        if (response.status===200) {
          setAcceptedFriends(data);
        }
      } catch (error) {
        console.log("Error showing accepted friends", error);
      }
    };
    acceptedFriendsList();
  }, []);
  console.log("Friends", acceptedFriends);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
        {acceptedFriends.map((item, index) => (
        <Pressable key={index}>
          <UserChat item={item} />
        </Pressable>
      ))}
    </ScrollView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});
