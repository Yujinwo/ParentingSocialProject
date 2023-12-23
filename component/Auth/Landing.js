import React from "react";
import { View, Text} from "react-native";
import { Button } from "react-native-paper";
import styles from "./styles";
const Landing = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* 로고 컨테이너 */}
      <View style={styles.logoContainer}>
        {/* 로고 텍스트 */}
        <Text style={{ fontSize: 40, color: 'pink' }}>BABY</Text>
      </View>
  
      {/* 이미 계정이 있는 경우 로그인 버튼 */}
      <Text style={styles.loginText}>이미 계정이 있습니까?</Text>
      <Button
        style={styles.button}
        mode="contained"
        onPress={() => navigation.navigate("Login")}
      >
        로그인
      </Button>
  
      {/* 또는 회원가입 버튼 */}
      <Text style={styles.loginText}>Or</Text>
      <Button
        style={styles.button}
        mode="contained"
        onPress={() => navigation.navigate("Signup")}
      >
        회원가입
      </Button>
    </View>
  );
  
};

export default Landing;
