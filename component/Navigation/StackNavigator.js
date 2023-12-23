import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from 'react-native';
import Home from "../TabComponent/Home";
import Profile from "../TabComponent/Profile";
import Search from "../TabComponent/Search";
import QuestionPostingUi from "../Function/QuestionPostingUi";
import FolderPostinglist from '../Function/FolderPostinglist';
import FolderPost from '../Post/FolderPost';
import QuestionPost from '../Post/QuestionPost';
import EditProfile from "../Function/EditProfile";
import EditFolder from "../Function/EditFolder";
import EditNote from "../Function/EditNote";
import EditPagePosting from "../Function/EditPagePosting";
import ChatGpt from "../Function/ChatGpt";
import EditFolderPosting from "../Function/EditFolderPosting";
import EditQuestionPosting from "../Function/EditQuestionPosting";
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import ChatRoomListScreen from "../Chat/ChatRoomListScreen";
import ChatScreen from "../Chat/ChatScreen";
import PagePostinglist from "../Function/PagePostinglist";
import FollwingPostingUi from "../Function/FollwingPostingUi";
import CreateNote from '../Function/CreateNote';
import CreateFolder from '../Function/CreateFolder';
import PagePost from '../Post/PagePost';
import Notification from '../TabComponent/Notification';
import Note from '../TabComponent/Note';
import { createDrawerNavigator } from "@react-navigation/drawer";
import OtherUserProfile from "../Function/OtherUserProfile";
import { useState } from 'react';
import { firebase } from "../../firebase";
import Logout from "../Auth/Logout";
import OtherFolerPostinglist from "../Function/OtherFolerPostinglist";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
const Stack = createStackNavigator();
const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#9AC4F8",
  },
  headerShown: false,
  headerTintColor: "black",

};
// Home 화면 상세메뉴 스크린
const DrawerNaviHome = ({ navigation }) => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="HomeStackNavigator"
        component={HomeStackNavigator}
        options={{
          title: 'BABY',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('ChatRoomListScreen')}>
              <Ionicons name="paper-plane-outline" size={28} style={{ marginRight: 10, color: 'white' }} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#FFD8D8',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          title: '로그아웃',
        }}
      />
    </Drawer.Navigator>
  );
}
// Search 화면 상세메뉴 스크린 
const DrawerNaviSearch = ({ navigation }) => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="SearchStackNavigator"
        component={SearchStackNavigator}
        options={{
          title: 'BABY',
          headerStyle: {
            backgroundColor: '#FFD8D8',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('ChatGpt')}>
              <Ionicons name="aperture-outline" size={30} style={{ color: '#FFFFFF', marginRight: 10 }} />
            </TouchableOpacity>
          )
        }}
      />
       <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          title: '로그아웃',
        }}
      />
    </Drawer.Navigator>
  );
}

// Profile 화면 상세메뉴 스크린  
const DrawerNaviProfile = ({ navigation }) => {
  const Drawer = createDrawerNavigator();

  const [user, setUser] = useState([]);

  useEffect(() => {
    fetchUser("", (user) => {
      setUser(user);
    });
  }, []);

  const fetchUser = (userId, callback) => {
    const id = firebase.auth().currentUser.uid;
    firebase.firestore().collection("users")
      .doc(id)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          callback(snapshot.data());
        } else {
          // handle error
        }
      });
  };

  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="ProfileStackNavigator"
        component={ProfileStackNavigator}
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EditProfile', {
                  user: user,
                  navigation,
                })
              }>
              <Ionicons
                name="create-outline"
                size={28}
                style={{ marginRight: 10, color: 'white' }}
              />
            </TouchableOpacity>
          ),
          title: 'BABY',
          // Header 블록에 대한 스타일
          headerStyle: {
            backgroundColor: '#FFD8D8',
          },
          // Header의 텍스트, 버튼 색상
          headerTintColor: '#ffffff',
          // 타이틀 텍스트의 스타일
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
       <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          title: '로그아웃',
        }}
      />
    </Drawer.Navigator>
  );
}
// Notification 화면 상세메뉴 스크린  
const DrawerNaviNotification = ({ navigation }) => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="NotificationStackNavigator"
        component={NotificationStackNavigator}
        options={{
          title: 'BABY',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('ChatRoomListScreen')}>
              <Ionicons name="paper-plane-outline" size={28} style={{ marginRight: 10, color: 'white' }} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#FFD8D8',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          title: '로그아웃',
        }}
      />
    </Drawer.Navigator>
  );
}
// Note 화면 상세메뉴 스크린  
const DrawerNaviNote = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="NoteStackNavigator"
        component={NoteStackNavigator}
        options={{
          title: 'BABY',
          // Header 블록에 대한 스타일
          headerStyle: {
            backgroundColor: '#FFD8D8',
          },
          // Header의 텍스트, 버튼 색상
          headerTintColor: '#ffffff',
          // 타이틀 텍스트의 스타일
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
       <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          title: '로그아웃',
        }}
      />
    </Drawer.Navigator>
  );
}
// Home 화면 종합 스택 스크린  
const DrawerHome = ({ route, navigation }) => {
  useEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
  }, [route]);

  return (
    <Stack.Navigator initialRouteName="DrawerNaviHome" screenOptions={screenOptionStyle}>
      <Stack.Screen name="DrawerNaviHome" component={DrawerNaviHome} />
      <Stack.Screen
        name="QuestionPost"
        component={QuestionPost}
        options={{
          title: '질문글 작성',
          headerBackTitle: ' ',
          headerShown: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="checkmark-outline" size={40} style={{ color: '#000000' }} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ChatRoomListScreen"
        component={ChatRoomListScreen}
        options={{
          headerStyle: {
            backgroundColor: '#ffa7a7',
          },
          title: '메시지',
          headerBackTitle: ' ',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        />

      <Stack.Screen
        name="QuestionPostingUi"
        component={QuestionPostingUi}
        headerTintColor={'black'}
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          title: '게시판',
          headerBackTitle: ' ',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FollwingPostingUi"
        component={FollwingPostingUi}
        headerTintColor={'black'}
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          title: '게시판',
          headerBackTitle: ' ',
          headerShown: false,
        }}
      />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfile} />
      <Stack.Screen name="OtherFolerPostinglist" component={OtherFolerPostinglist} />
      <Stack.Screen name="DrawerProfile" component={DrawerProfile} />
      <Stack.Screen name="EditQuestionPosting" component={EditQuestionPosting} />
    </Stack.Navigator>
  );
};
// Search 화면 종합 스택 스크린 
const DrawerSearch = (props) => {

  return (
    <Stack.Navigator initialRouteName="DrawerNaviSearch" screenOptions={screenOptionStyle}>
      <Stack.Screen
        name="DrawerNaviSearch"
        component={DrawerNaviSearch}
      />
      <Stack.Screen
        name="ChatGpt"
        component={ChatGpt}
        options={{
          title: 'Chat',
          headerBackTitle: ' ',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
// Profile 화면 종합 스택 스크린
const DrawerProfile = ({ navigation }) => {
  return (
    <Stack.Navigator initialRouteName="DrawerNaviProfile" screenOptions={screenOptionStyle}>
      <Stack.Screen name="DrawerNaviProfile" component={DrawerNaviProfile} />
      <Stack.Screen
        name="CreateFolder"
        component={CreateFolder}
        options={{
          title: '폴더 추가',
          headerBackTitle: ' ',
          headerShown: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="checkmark-outline" size={40} style={{ color: '#000000' }} />
            </TouchableOpacity>
          )
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerShown: 'true',
          title: '프로필 수정',
          headerBackTitle: ' '
        }}
      />
      <Stack.Screen
        name="FolderPost"
        component={FolderPost}
        options={{
          headerShown: false,
          title: '글 작성'
        }}
      />
      <Stack.Screen
        name="EditFolder"
        component={EditFolder}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditFolderPosting"
        component={EditFolderPosting}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FolderPostinglist"
        component={FolderPostinglist}
        options={{
          headerShown: 'true',
          title: '폴더 글 리스트',
          headerBackTitle: ' '
        }}
      />
      <Stack.Screen
        name="FollwingPostingUi"
        component={FollwingPostingUi}
        headerTintColor={'black'}
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          title: '게시판',
          headerBackTitle: ' ',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}
// Notification 화면 종합 스택 스크린 
const DrawerNotification = (props) => {

  return (
    <Stack.Navigator initialRouteName="DrawerNaviNotification" screenOptions={screenOptionStyle}>
      <Stack.Screen
        name="DrawerNaviNotification"
        component={DrawerNaviNotification}
      />
    </Stack.Navigator>
  );
}


// Note 화면 종합 스택 스크린 
const DrawerNote = (props) => {
  return (
    <Stack.Navigator initialRouteName="DrawerNaviNote" screenOptions={screenOptionStyle}>
      <Stack.Screen
        name="DrawerNaviNote"
        component={DrawerNaviNote}
      />

      <Stack.Screen
        name="PagePostinglist"
        component={PagePostinglist}
        options={{
          headerShown: 'true',
          title: '페이지 리스트',
          headerBackTitle: ' ',
        }}
      />

      <Stack.Screen
        name="CreateNote"
        component={CreateNote}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditNote"
        component={EditNote}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PagePost"
        component={PagePost}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditPagePosting"
        component={EditPagePosting}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
}

// Home 화면 기본 스택
const HomeStackNavigator = ({ navigation, route }) => {

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptionStyle}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}
// Search 화면 기본 스택
const SearchStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
      <Stack.Screen name="Search" component={Search} />
    </Stack.Navigator>
  );
}
// Profile 화면 기본 스택
const ProfileStackNavigator = ({ navigation }) => {
  return (
    <Stack.Navigator initialRouteName="Profile" screenOptions={screenOptionStyle}>
      <Stack.Screen name="Profile" component={Profile}

        options={{
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Ionicons name="arrow-back-outline" size={40} style={{ color: '#FFFFFF' }} />
            </TouchableOpacity>
          )
        }} />

    </Stack.Navigator>
  );
}
// Notification 화면 기본 스택
const NotificationStackNavigator = ({ navigation, route }) => {

  return (
    <Stack.Navigator initialRouteName="Notification" screenOptions={screenOptionStyle}>
      <Stack.Screen name="Notification" component={Notification}
        options={{
          headerStyle: {
            backgroundColor: '#ffa7a7',
          },

          title: '알림 사항',
          headerShown: false
        }} />
    </Stack.Navigator>
  );
}
// Note 화면 기본 스택
const NoteStackNavigator = ({ navigation, route }) => {

  return (
    <Stack.Navigator initialRouteName="Note" screenOptions={screenOptionStyle}>
      <Stack.Screen name="Note" component={Note} />
    </Stack.Navigator>
  );
}

export { HomeStackNavigator, SearchStackNavigator, ProfileStackNavigator, NoteStackNavigator, NotificationStackNavigator, DrawerHome, DrawerSearch, DrawerProfile, DrawerNotification, DrawerNote };