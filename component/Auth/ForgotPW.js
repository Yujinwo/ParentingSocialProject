import React from "react";
import {View} from "react-native";
import { Button, TextInput, Snackbar } from "react-native-paper";
import styles from "./styles";
import { firebase } from "../../firebase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
export default function Login({ navigation }) {
  const [Email, setEmail] = React.useState("");
  const [label, setLabel] = React.useState("");

  const [visible, setVisible] = React.useState(false);

  const onToggleSnackBar = () => setVisible(!visible);

  const onDismissSnackBar = () => setVisible(false);
  const onPasswordReset = () => {
    // Firebase 인증을 사용하여 비밀번호 재설정 이메일을 전송합니다.
    firebase.auth()
      .sendPasswordResetEmail(Email)
      .then((res) => {
        console.log(res);
        onToggleSnackBar(); // 스낵바 표시를 토글합니다.
        visible ? "Hide" : "Show";
        setLabel(`비밀번호 재설정 링크가 이메일(${Email})로 전송되었습니다.`);
      })
      .catch((error) => {
        setLabel(error);
        onToggleSnackBar(); // 스낵바 표시를 토글합니다.
        visible ? "Hide" : "Show";
      });
  };
  
  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      {/* 키보드를 자동으로 조정하는 스크롤 가능한 뷰 */}
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 30, y: 0 }}
        contentContainerStyle={[styles.authContainer, { marginBottom: 50 }]}
        scrollEnabled={true}
      >
        {/* 이메일 입력란 */}
        <TextInput
          label="이메일"
          value={Email}
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          type="이메일"
          keyboardType="email-address"
          mode="outlined"
        />
  
        {/* 비밀번호 찾기 버튼 */}
        <Button
          style={styles.button}
          mode="contained"
          onPress={onPasswordReset}
        >
          찾기
        </Button>
      </KeyboardAwareScrollView>
  
      {/* 스낵바 */}
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: "취소",
          onPress: () => {
            navigation.navigate("Login");
          },
        }}
      >
        {label}
      </Snackbar>
    </View>
  );
  
  
}
