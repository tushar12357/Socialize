import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState,useRef } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NGROK_URL } from "@env";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const ChatMessagesScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const route = useRoute();
  const { recepientId } = route.params;
  console.log("Recepientid", recepientId);
  const [recepientData, setRecepientData] = useState();
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollToBottom()
  },[]);

  const scrollToBottom = () => {
      if(scrollViewRef.current){
          scrollViewRef.current.scrollToEnd({animated:false})
      }
  }

  const handleContentSizeChange = () => {
      scrollToBottom();
  }
  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${NGROK_URL}/messages/${userId}/${recepientId}`
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

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await axios.get(`${NGROK_URL}/users/${recepientId}`);
        const data = await response.data;
        setRecepientData(data);
      } catch (error) {
        console.log("Error", error);
      }
    };
    fetchRecepientData();
  }, []);
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri; // Updated to handle Expo SDK changes
        console.log("Picked image URI:", imageUri);
        handleSend("image", imageUri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleSend = async (messageType, imageUri) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);

      if (messageType === "image") {
        // Extract file name from URI
        const fileName = imageUri.split("/").pop();
        const fileType = fileName.split(".").pop(); // Extract file extension

        // Append image file to FormData
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: fileName,
          type: `image/${fileType}`, // Example: image/jpeg or image/png
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await axios.post(`${NGROK_URL}/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setMessage("");
        setSelectedImage("");
        fetchMessages(); // Refresh messages after sending
      }
    } catch (error) {
      console.log(
        "Error in sending message:",
        error.response?.data || error.message
      );
    }
  };
  console.log(recepientData);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => {
        return (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              onPress={() => navigation.goBack()}
            />
            {selectedMessages.length > 0 ? (
              <View>
                <Text style={{ fontSize: 16, fontWeight: "500" }}>
                  {selectedMessages.length} message(s) selected
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={
                    recepientData?.image
                      ? { uri: recepientData?.image }
                      : require("../assets/user.jpg")
                  }
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    resizeMode: "cover",
                    backgroundColor: "lightgray",
                    borderColor: "black",
                    borderWidth: 1,
                  }}
                />
                <Text
                  style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}
                >
                  {recepientData?.name || "User"}
                </Text>
              </View>
            )}
          </View>
        );
      },
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
            <Ionicons name="arrow-undo" size={24} color="black" />
            <Ionicons name="arrow-redo-sharp" size={24} color="black" />
            <FontAwesome name="star" size={24} color="black" />
            <MaterialIcons onPress={()=>deleteMessage(selectedMessages)} name="delete" size={24} color="black" />
          </View>
        ) : null,
    });
  }, [recepientData,selectedMessages]);
  const deleteMessage = async (messageIds) => {
    try {
      const response = await axios.post(
        `${NGROK_URL}/deleteMessages`,
        { messages: messageIds }, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        setSelectedMessages((prevSelectedMessages) =>
          prevSelectedMessages.filter((id) => !messageIds.includes(id))
        );
        fetchMessages(); 
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };
  const handleSelectMessage = (message) => {
    const isSelected = selectedMessages.includes(message._id);
    if (isSelected) {
      setSelectedMessages((prevMessages) =>
        prevMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((prevMessages) => [...prevMessages, message._id]);
    }
  };
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchMessages();
  //   }, 500); // Poll every 5 seconds
  
  //   return () => clearInterval(interval); // Cleanup the interval on component unmount
  // }, []);
  
  console.log("Messages", selectedMessages);
  console.log("NGROK",NGROK_URL)
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={{flexGrow:1}} onContentSizeChange={handleContentSizeChange}>
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            const isSelected=selectedMessages.includes(item._id)
            return (
              <Pressable
                key={index}
                onLongPress={() => handleSelectMessage(item)}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },
                      isSelected && {width:"100%",backgroundColor:"#F0FFFF"}
                ]}
              >
                <Text style={{ fontSize: 13, textAlign: isSelected?"right":"left" }}>
                  {item?.message}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 9,
                    color: "gray",
                    marginTop: 5,
                  }}
                >
                  {formatTime(item.timeStamp)}
                </Text>
              </Pressable>
            );
          }
          if (item.messageType === "image") {
            const baseUrl = `${NGROK_URL}/`;
            const imageUrl = item.imageUrl;
            const fileName = imageUrl.split("/").pop();
            const source = { uri: baseUrl + fileName };
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      }
                ]}
              >
                <View>
                  <Image
                    source={source}
                    style={{ width: 200, height: 200, borderRadius: 7 }}
                  />
                  <Text
                    style={{
                      textAlign: "right",
                      fontSize: 9,
                      color: "white",
                      position: "absolute",
                      right: 10,
                      marginTop: 5,
                      bottom: 7,
                    }}
                  >
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: 25,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          name="emoji-happy"
          size={24}
          color="black"
          style={{ marginRight: 5 }}
        />
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
          }}
          placeholder="Type Your Message"
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Feather name="mic" size={24} color="black" />
          <Entypo onPress={pickImage} name="camera" size={24} color="black" />
          <Feather
            name="send"
            size={24}
            color="black"
            onPress={() => handleSend("text")}
          />
        </View>
      </View>
      {showEmojiSelector && (
        <EmojiSelector
          style={{ height: 250 }}
          onEmojiSelected={(emoji) => {
            setMessage((prevMessage) => prevMessage + emoji);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({});
