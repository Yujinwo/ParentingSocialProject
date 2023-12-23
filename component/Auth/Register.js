import React from "react";
import {
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Button,
  Text,
  TextInput,
  Banner,
} from "react-native-paper";
import { firebase } from "../../firebase";
import styles from "./styles";

export default function Signup({ navigation }) {
  const [Name, setName] = React.useState("");
  const [securedpassword, setSecuredpassword] = React.useState(true);
  const [Email, setEmail] = React.useState("");
  const [Password, setPassword] = React.useState("");
  const [userName, setuserName] = React.useState("");
  const [color, setColor] = React.useState("#9d9d9d");

  const [label, setLabel] = React.useState("");
  const [visible, setVisible] = React.useState(false);

  const onSignUp = (props) => {
    // 필수 필드를 모두 입력했는지 확인
    if (Name == "" || Email == "" || Password == "") {
      setLabel("모든 필드를 입력해주세요.");
      setVisible(true);
    } else {
      // Firebase를 사용하여 회원 가입 처리
      firebase
        .auth()
        .createUserWithEmailAndPassword(Email, Password)
        .then((props) => {
          // 이메일 인증 메일 전송
          firebase.auth().currentUser.sendEmailVerification();
  
          // 사용자 데이터 Firestore에 저장
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .set({
              name: Name,
              email: Email,
              id: firebase.auth().currentUser.uid,
              profilePicUrl: null,
              userName: "",
              introduce: "",
              postNum: 0,
              followerNum: 0,
              followingNum: 0,
            })
            .then((props) => {
              navigation.navigate("Login");
            })
            .catch((error) => {
              console.log("문서 작성 오류: ", error);
            });
        })
        .catch((error) => {
          console.log(error);
          setLabel(error.message);
          setVisible(true);
        });
    }
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
        {/* 이름 입력 필드 */}
        <TextInput
          label="이름"
          value={Name}
          onChangeText={(text) => setName(text)}
          style={styles.input}
          mode="outlined"
        />
  
        {/* 유저 이름 입력 필드 */}
        <TextInput
          label="유저 이름"
          value={userName}
          onChangeText={(text) => setUserName(text)}
          style={styles.input}
          mode="outlined"
        />
  
        {/* 이메일 입력 필드 */}
        <TextInput
          label="이메일"
          value={Email}
          onChangeText={(text) => setEmail(text)}
          type="이메일"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />
  
        {/* 비밀번호 입력 필드 */}
        <TextInput
          Password
          label="비밀번호"
          value={Password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
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
  
        {/* 회원 가입 버튼 */}
        <Button style={styles.button} mode="contained" onPress={onSignUp}>
          회원 가입
        </Button>
  
        {/* 로그인 버튼 */}
        <Button
          uppercase={false}
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          로그인
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
            backgroundColor: "red",
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
