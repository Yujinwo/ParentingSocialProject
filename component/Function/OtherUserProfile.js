import React, { useEffect, useState } from "react";
import { renderers } from 'react-native-popup-menu';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ImageBackground,
  Text, FlatList, RefreshControl,
  Image, Dimensions, ScrollView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Button } from "react-native-paper";
import { firebase } from "../../firebase";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
import moment from 'moment';
const { SlideInMenu } = renderers;
const { width, height } = Dimensions.get('window');
const Folder = (item, props) => {
  return (
    <View
      style={{
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 30,
        margin: 10,
        shadowOpacity: '0.05',
        backgroundColor: 'white',
        shadowRadius: 10,
        shadowColor: 'black',
      }}
      key={item.folderId}
    >
      <TouchableOpacity onPress={() => props.navigation.navigate('OtherFolerPostinglist', item.folderId)}>
        <ImageBackground
          source={
            item.downloadURL
              ? { uri: item.downloadURL }
              : require("../../assets/black.png")
          }
          style={{
            width: width / 2 - 20,
            height: 100,
            borderColor: 'gray',
          }}
          imageStyle={{ borderRadius: 30 }}
        >
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', paddingTop: 1 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Image
            source={
              item.postBy?.profilePicUrl
                ? { uri: item.postBy?.profilePicUrl }
                : require("../../assets/defaultProfilePic.png")
            }
            style={{ width: 40, height: 40, borderRadius: 37.5 }}
          />
        </View>
        <View style={{ flex: 2 }}>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: 'bold', paddingBottom: 5, textAlign: 'center' }}>
                {item.caption}
              </Text>
              <Text style={{ fontSize: 15, color: 'gray' }}>
                {moment(item.creation).format("YYYY-MM-D")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const Scrap = (props) => {
  return (
    <View style={{ borderRadius: 1, borderWidth: 1 }}>
      <View
        key={props.item.id}
        style={{
          width: 300,
          height: 100,
          flexDirection: 'row',
          marginBottom: 1,
        }}
      >
        <Image
          source={{ url: "https://cdn.pixabay.com/photo/2018/11/29/19/29/autumn-3846345__480.jpg" }}
          style={{ flex: 1, borderRadius: 20 }}
        />
        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>제목</Text>
          <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-around' }}>
            <Text>작성자 </Text>
            <Text>작성날짜</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
const ModHeader = (props) => {
  return (
    <View style={{ marginTop: 30, backgroundColor: 'white', height: 90, bottom: 30 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 40, alignItems: 'center' }}>
        <Ionicons name="arrow-back-outline" size={40} style={{ color: 'black',right:80 }} onPress={() => props.navigation.navigate('Home')} />
        <Text style={{ fontSize: 20, color: 'black',right:50 }}>유저 프로필</Text>
    
      </View>
    </View>
  );
};

const Tab = createMaterialTopTabNavigator();
export default function OtherUserProfile({ navigation, route }) {
  const [user, setUser] = useState([]);
  const [folderlist, setfolderlist] = useState([]);
  const [following, setFollowing] = useState(false);
  const [activeIndex, setactiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  


  useEffect(() => {
    const id = firebase.auth().currentUser.uid;

    Promise.all([
      fetchUser(route.params).then((user) => {
        setUser(user);
      }),

      fetchFollwing(id, (FollwingState) => {
        if (Array.isArray(FollwingState)) {
          setFollowing(FollwingState.includes(route.params));

          if (FollwingState.includes(route.params) == true) {

            fetchfollowFolder(route.params, (folderlist) => {
              setfolderlist(folderlist);
            })
          }
          else {

            fetchFolder(route.params, (folderlist) => {
              setfolderlist(folderlist);
            })
          }
        } else {
          setFollowing(false);

          fetchFolder(route.params, (folderlist) => {
            setfolderlist(folderlist);
          })
        }
      }),
    ]);
  }, []);

  const allRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      Promise.all([
        fetchUser(route.params).then((user) => {
          setUser(user);
        }),

        fetchFollwing("", (FollwingState) => {
          if (Array.isArray(FollwingState)) {
            setFollowing(FollwingState.includes(route.params));

            if (FollwingState.includes(route.params) == true) {
              fetchfollowFolder(route.params, (folderlist) => {
                setfolderlist(folderlist);
              })
            }
            else {
              fetchFolder(route.params, (folderlist) => {
                setfolderlist(folderlist);
              })
            }

          } else {
            setFollowing(false);

            fetchFolder(route.params, (folderlist) => {
              setfolderlist(folderlist);
            })
          }
        }),
      ]);
      setRefreshing(false)
    }, 2500)

  }

  const follow = (otherId) => {
    if (following) {
      Promise.all([
        follwingdown(otherId),
        setFollowing(false),
        fetchFolder(route.params, (folderlist) => {
          setfolderlist(folderlist);
        }),

      ]).then(() => {
        fetchUser(route.params).then((user) => {
          setUser(user);
        });
      });
    } else {
      Promise.all([
        follwingup(otherId),
        setFollowing(true),
        fetchfollowFolder(route.params, (folderlist) => {
          setfolderlist(folderlist);
        }),

      ]).then(() => {
        fetchUser(route.params).then((user) => {
          setUser(user);
        });
      });
    }


  };





  const fetchFolder = async (userId, callback) => {
    const id = userId;
    var arr = [];
    await firebase.firestore().collection("Folders")
      .where('userId', '==', id)
      .where('placeholder', '==', 'all')
      .orderBy("creation", "desc")
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {

            const data = doc.data();

            const allDataWithUser = await data.postBy.get();

            data.postBy = allDataWithUser.data();

            data.creation = data.creation.toDate(); // 파이어베이스 타임스탬프를 Date 객체로 변환
            arr.push(data);
          })
        ).then(() => {

          arr.sort((a, b) => b.creation - a.creation)
          callback(arr);
        });
      });
  };

  const fetchfollowFolder = async (userId, callback) => {
    const id = userId;
    var arr = [];
    await firebase.firestore().collection("Folders")
      .where('userId', '==', id)
      .orderBy("creation", "desc")
      .where('placeholder', 'in', ['friend', 'all'])
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const allDataWithUser = await data.postBy.get();
            data.postBy = allDataWithUser.data();
            data.creation = data.creation.toDate(); // 파이어베이스 타임스탬프를 Date 객체로 변환
            arr.push(data);
          })
        ).then(() => {

          arr.sort((a, b) => b.creation - a.creation)
          callback(arr);
        });
      });
  };

  const follwingup = async (userId) => {
    const id = firebase.auth().currentUser.uid;
    const otherid = userId;
    if (!id || !otherid) {


      return;
    }
    const userRef = firebase.firestore().collection("users").doc(id);
    const otherUserRef = firebase.firestore().collection("users").doc(otherid);

    try {
      userRef.update({
        following: firebase.firestore.FieldValue.arrayUnion(otherid),
        followingNum: firebase.firestore.FieldValue.increment(1),
      });
      otherUserRef.update({
        followerNum: firebase.firestore.FieldValue.increment(1),
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const follwingdown = async (userId) => {
    const id = firebase.auth().currentUser.uid;
    const otherid = userId;
    if (!id || !otherid) {

      return;
    }
    const userRef = firebase.firestore().collection("users").doc(id);
    const otherUserRef = firebase.firestore().collection("users").doc(otherid);

    try {
      userRef.update({
        following: firebase.firestore.FieldValue.arrayRemove(otherid),
        followingNum: firebase.firestore.FieldValue.increment(-1),
      });
      otherUserRef.update({
        followerNum: firebase.firestore.FieldValue.increment(-1),
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchUser = async (userId) => {
    if (!userId) {
      return null;
    }

    const userRef = firebase.firestore().collection("users").doc(userId);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
      console.log(snapshot.data())
      return snapshot.data();
    }

    return null;
  };

  const fetchFollwing = async (userId, callback) => {
    if (!userId) {

      return;
    }

    const userRef = firebase.firestore().collection("users").doc(userId);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
      callback(snapshot.data().following);
    }
  };



  const Pagestate = (props) => {

    if (activeIndex == 0) {
      if (folderlist.length == 0) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', top: 150 }}>
            <Text> 폴더가 존재하지 않습니다!</Text>
          </View>
        )
      }
      return (
        <View style={{ flex: 1 }}>
          <SafeAreaView>
            <FlatList
              scrollEnabled={false}

              data={folderlist}
              renderItem={({ item }) =>
                Folder(item, props)
              }

              numColumns={2}
              scrollEventThrottle={1}
              scrollToOverflowEnabled={true} />
          </SafeAreaView>
        </View>
      )
    }
    else {
      return (
        <View style={{ flex: 1 }}>
          <SafeAreaView>
            <FlatList
              scrollEnabled={false}
              data={DATA}
              renderItem={({ item }) =>
                <Scrap item={item} />
              }
              keyExtractor={item => item.id} />
          </SafeAreaView>
        </View>
      );
    }
  }

  const senmentClicked = (activeIndex) => {
    setactiveIndex(activeIndex)
  }


  const handleMessagePress  = (userName) => {
    navigation.navigate('ChatRoomListScreen', { userName });
   
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={allRefresh} />
        }
        stickyHeaderIndices={[2]} >
        <ModHeader navigation={navigation}></ModHeader>
        <View style={{ backgroundColor: 'white', width: 410, height: 250, marginBottom: 10, }}>
          <ImageBackground
            style={{ width: 410, height: 200, flexDirection: 'row', bottom: 30 }}

            resizeMode='cover'

            source={
              user?.backPicUrl
                ? { uri: user?.backPicUrl }
                : require("../../assets/backface.jpg")
            }>

            <View style={{ flex: 1, }}>
              <View style={{ height: 120, }}>
              </View>
              <View style={{ height: 90, backgroundColor: '#fff', borderTopWidth: 2, }}>
                {user?.introduce && user?.introduce != "" && (
                  <Text style={{ marginTop: 10, marginLeft: 20, fontSize: 19 }}>{user?.introduce}</Text>
                )}
                {/* <Text style={{ marginTop: 10, marginLeft: 20, fontSize: 20 }}>{user?.introduce}</Text> */}
                {/* <Text style={{ marginTop: 10, marginLeft: 20, fontSize: 19 }}>exit is not detected</Text> */}
              </View>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 88, marginTop: 80, borderTopEndRadius: 82, borderTopStartRadius: 82, backgroundColor: '#fff' }}>
              <Image source={
                user?.profilePicUrl
                  ? { uri: user?.profilePicUrl }
                  : require("../../assets/defaultProfilePic.png")
              }
                style={{ width: 91, height: 91, borderRadius: 50000, marginRight: 5 }} />
              <View style={{ alignItems: 'center', width: 130, height: 28, marginTop: 10, backgroundColor: '#fff' }}>
                {user?.name && user?.name != "" && (
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>{user?.name}</Text>
                )}
                {/* <Text style={{ fontWeight: 'bold', fontSize: 18, }}>{user?.userName}</Text> */}
              </View>
            </View>
            <View style={{ width: 30 }}>
              <View style={{ height: 120, }}>
              </View>
              <View style={{ height: 90, borderTopWidth: 2, backgroundColor: '#fff' }}>
              </View>
            </View>
          </ImageBackground>


          <View style={{ flexDirection: 'row', paddingTop: 10, marginBottom: 5 }}>

            <View style={{ flex: 3 }}>


              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 30, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={
                    following
                      ? { borderWidth: 1, borderRadius: 10, width: 80, right: 10, backgroundColor: "gray", height: 25 }
                      : { borderWidth: 1, borderRadius: 10, width: 80, right: 10, backgroundColor: "#B2CCFF", height: 25 }
                  } onPress={() => follow(route.params)}>
                    <Text style={{ fontSize: 18, color: 'black', textAlign: 'center', fontWeight: 'bold' }}>{following ? '팔로잉' : '팔로우'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', }}>
                <TouchableOpacity onPress={() => handleMessagePress(user.name)}
                    style={{ borderWidth: 1, borderRadius: 10, width: 80, right: 10, marginLeft: 3, backgroundColor: "#B2CCFF" }}>
                    <Text style={{ fontSize: 18, color: 'black', textAlign: 'center' }}>메시지 </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', }}>
                  <Text style={{ fontSize: 15, color: 'gray' }}>게시물  </Text>
                  <Text style={{ fontSize: 15, }}>{user?.postNum}   </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 15, color: 'gray' }}>팔로워  </Text>
                  <Text style={{ fontSize: 15, }}>{user?.followerNum}   </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 15, color: 'gray' }}>팔로잉  </Text>
                  <Text style={{ fontSize: 15 }}>{user?.followingNum}   </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#B2CCFF', borderWidth: 1, borderRadius: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: 350, height: 40 }}>
            <Button onPress={() => senmentClicked(0)}>
              <Ionicons name="ios-apps" size={20}
                style={[activeIndex === 0 ? {} : { color: 'grey', textDecorationLine: 'underline' }]} />
            </Button>
          </View>
        </View>
        <Pagestate user={user} navigation={navigation} />
      </ScrollView>
    </View>
  );
};

