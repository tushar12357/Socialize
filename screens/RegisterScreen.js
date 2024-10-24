import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { NGROK_URL } from '@env';

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const navigation = useNavigation();
  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
      image: image,
    };
    axios.post(`${NGROK_URL}/register`, user)
      .then((res) => {
        console.log("Registration data", res.data);
        Alert.alert(
          "Registration successful",
          "You have been successfully registered"
        );
        navigation.navigate("Login")
        setName(""), setEmail(""), setPassword(""), setImage("");
      })
      .catch((err) => {
        console.log("Registration failed", err);
        Alert.alert("Registration failed", "Please try again");
      });
  };
  console.log(NGROK_URL)
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 10,
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView>
        <View
          style={{
            marginTop: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#4A55A2", fontSize: 17, fontWeight: "600" }}>
            Sign Up
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 15 }}>
            Sign Up into Your Account
          </Text>
        </View>
        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                fontSize: 18,
              }}
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                fontSize: 18,
              }}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                fontSize: 18,
              }}
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Image</Text>
            <TextInput
              placeholder="Enter your image"
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                fontSize: 18,
              }}
              value={image}
              onChangeText={(text) => setImage(text)}
            />
          </View>
          <Pressable
            style={{
              width: 200,
              backgroundColor: "#4A55A2",
              padding: 15,
              marginTop: 50,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 6,
            }}
            onPress={handleRegister}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Sign Up
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Already have an account? Sign In
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
