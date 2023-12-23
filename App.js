
import React, { useState,useEffect } from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavi from './component/Navigation/TabNavi';
import Landing from "./component/Auth/Landing";
import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import ForgotPW from "./component/Auth/ForgotPW";
import Signup from "./component/Auth/Register";
import { firebase } from "./firebase";
const Stack = createStackNavigator();

export default function App() {
  const [login, setLogin] = useState(false);
  // 로그인 상태를 확인해서 로그인 했으면 TRUE 안했으면 False
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        setLogin(false);
      } else {
        setLogin(true);
      }
    });
  }, []);

  // 로그인 안했으면 로그인 화면을 띄운다
  if(!login)
  {
    return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName='Landing'>
        {/* 홈 스택 */ }
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{
            title:'홈' ,
            headerShown: false,
          }}
        />
         {/* 로그인 스택 */ }
        <Stack.Screen
          options={{ headerLargeTitle: true,
            title:'로그인' }}
          name="Login"
          component={Login}
        />
         {/* 회원가입 스택 */ }
        <Stack.Screen
          options={{ headerLargeTitle: true,
            title:'회원 가입'  }}
          name="Signup"
          component={Signup}
        />
         {/* 회원 등록 스택 */ }
        <Stack.Screen
          options={{ headerLargeTitle: true,
            title:'회원 등록'  }}
          name="Register"
          component={Register}
        />
         {/* 비밀번호 찾기 스택 */ }
        <Stack.Screen
          name="ForgotPW"
          component={ForgotPW}
          options={{
            headerShown: true,
            title: "비밀번호 찾기",
            headerLargeTitle: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    )
  }
  else
  {
    // 로그인 했으면 홈 화면으로 넘어간다.
    return (
      <NavigationContainer>
       <TabNavi/>
      </NavigationContainer>
    )
  }
}

