import React from "react";
import { View } from "react-native";
import { Button, Text, TextInput, Banner} from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import styles from "./styles";
import {firebase } from "../../firebase";
export default function Login({ navigation }) {
 
  const [label, setLabel] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [securedpassword, setSecuredpassword] = React.useState(true);
  const [Email, setEmail] = React.useState("yjw4758@naver.com");
  const [Password, setPassword] = React.useState("123456");
  const [color, setColor] = React.useState("#9d9d9d");
  const onSignin = () => {
    firebase.auth()
      .signInWithEmailAndPassword(Email, Password)
      .then((result) => {
        // 로그인 성공 시 처리할 로직 작성
      })
      .catch((error) => {
        console.log(error);
        setLabel(error.message);
        setVisible(true);
      });
  };
  
  // 비밀번호 입력 필드의 아이콘 색상 변경 함수
  const eyeColor = () => {
    if (!securedpassword) {
      setColor("#9d9d9d"); // 비밀번호 보이기 모드가 아닐 때 아이콘 색상
    } else {
      setColor("#3d3d3d"); // 비밀번호 보이기 모드일 때 아이콘 색상
  };
}
  
  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 30, y: 0 }}
        contentContainerStyle={styles.authContainer}
        scrollEnabled={true}
      >
        {/* 이메일 입력 필드 */}
        <TextInput
          label="이메일"
          style={styles.input}
          value={Email}
          onChangeText={(text) => setEmail(text)}
          type="이메일"
          keyboardType="email-address"
          mode="outlined"
        />
  
        {/* 비밀번호 입력 필드 */}
        <TextInput
          Password
          label="비밀번호"
          style={styles.input}
          value={Password}
          onChangeText={(text) => setPassword(text)}
          mode="outlined"
          secureTextEntry={securedpassword}
          right={
            <TextInput.Icon
              icon={"eye"}
              size={30}
              color={color}
              onPress={() => {
                setSecuredpassword(!securedpassword);
                eyeColor();
              }}
            />
          }
        />
  
        {/* 로그인 버튼 */}
        <Button style={styles.button} mode="contained" onPress={onSignin}>
          로그인
        </Button>
  
        {/* 비밀번호 찾기 버튼 */}
        <Button
          uppercase={false}
          style={styles.button}
          onPress={() => navigation.navigate("ForgotPW")}
        >
          비밀번호 찾기
        </Button>
  
        {/* 회원 가입 버튼 */}
        <Button
          uppercase={false}
          style={styles.button}
          onPress={() => navigation.navigate("Signup")}
        >
          회원 가입
        </Button>
  
        {/* 스낵바 (에러 메시지 표시) */}
        <Banner
          visible={visible}
          actions={[
            {
              label: "확인",
              onPress: () => setVisible(false),
            },
          ]}
          contentStyle={{
            backgroundColor: 'red',
            borderRadius: 9,
          }}
          style={{
            margin: 10,
            borderRadius: 9,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 15, color: "#000" }}>{label}</Text>
        </Banner>
      </KeyboardAwareScrollView>
    </View>
  );
}
