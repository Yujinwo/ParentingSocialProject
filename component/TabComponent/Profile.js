import React, { useEffect, useState } from "react";
import { MenuProvider } from 'react-native-popup-menu';
import { renderers } from 'react-native-popup-menu';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {
  SafeAreaView,
  View,
  TouchableOpacity,StyleSheet,
  ImageBackground,Modal,
  Text, FlatList,ActivityIndicator,RefreshControl,
  Image, Dimensions,ScrollView, useWindowDimensions
} from "react-native";
import {Avatar,Button } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { firebase } from "../../firebase";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import moment from 'moment';
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
const { SlideInMenu } = renderers;
const { width, height } = Dimensions.get('window');
const Folder = (item, props, FolderRefresh, visible, setVisible, ConfirmPopup, cancelPopup) => {
  return (
    <View style={{
      borderStyle: 'solid', borderWidth: 1, borderRadius: 30,
      margin: 10, shadowOpacity: '0.05', backgroundColor: 'white', shadowRadius: 10, shadowColor: 'black'
    }} key={item.folderId}>
      {/* 폴더 삭제 모달 */}
      <Modal visible={visible} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>폴더를 삭제하시겠습니까?</Text>
            <Text style={styles.modalMessage}>확인을 누를 시 폴더는 삭제 됩니다</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={cancelPopup}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonConfirm} onPress={() => ConfirmPopup(item.folderId)}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 폴더 클릭 시의 동작 */}
      <TouchableOpacity onPress={() => props.navigation.navigate('FolderPostinglist', { folderId: item.folderId, placeholder: item.placeholder })}>
        <ImageBackground
          source={item.downloadURL
            ? { uri: item.downloadURL }
            : require("../../assets/black.png")
          }
          style={{
            width: width / 2 - 20, height: 100,
            borderColor: 'gray',
          }}
          imageStyle={{ borderRadius: 30 }}
        >
          {/* 폴더 메뉴 */}
          <Menu renderer={SlideInMenu} style={{ alignItems: 'flex-end' }}>
            <MenuTrigger style={{ borderColor: 'white', height: 30, width: 40 }}>
              <Ionicons name="ellipsis-horizontal-outline" size={25} style={{ color: 'white', marginRight: 12, alignItems: 'center' }} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{ borderWidth: 2, borderColor: 'black', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 30, marginRight: 30 }}>
              {/* 폴더 수정 옵션 */}
              <MenuOption onSelect={() => props.navigation.navigate('EditFolder', { FolderRefresh: FolderRefresh, item: item })}  >
                <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', alignItems: 'center', borderWidth: 2, borderRadius: 15, width: 300 }}>
                  <Ionicons name="pencil-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 폴더 수정
                </Text>
              </MenuOption>
              {/* 폴더 삭제 옵션 */}
              <MenuOption onSelect={() => setVisible(true)}>
                <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', borderWidth: 2, borderRadius: 15, width: 300 }}>
                  <Ionicons name="trash-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 폴더 삭제
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', paddingTop: 1 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {/* 프로필 사진 */}
          <Image
            source={item.postBy?.profilePicUrl
              ? { uri: item.postBy?.profilePicUrl }
              : require("../../assets/defaultProfilePic.png")}
            style={{ width: 40, height: 40, borderRadius: 37.5 }}
          />
        </View>
        <View style={{ flex: 2 }}>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: 'bold', paddingBottom: 5, textAlign: 'center' }}>{item.caption}</Text>
              <Text style={{ fontSize: 15, color: 'gray' }}>{moment(item.creation).format("YYYY-MM-D")}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
const Scrap = (props) => {
  return (
    <TouchableOpacity onPress={() => props.navigation.navigate('FollwingPostingUi', props.item.folderpostId)}>
      <View style={{ borderRadius: 1, borderWidth: 1 }} key={props.item.folderpostId}>
        {/* Scrap 항목 클릭 시의 동작 */}
        <View style={{ width: 300, flexDirection: 'row', marginBottom: 1 }}>
          {/* 이미지 */}
          <Image
            source={props.item.downloadURL ? { uri: props.item.downloadURL } : require("../../assets/black.png")}
            style={{ borderRadius: 20, height: 100, width: 100 }}
          />
          <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            {/* 캡션 */}
            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{props.item.caption}</Text>
            <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-around' }}>
              {/* 프로필 사진 */}
              <Avatar.Image
                size={30}
                style={{ bottom: 0, marginRight: 30 }}
                source={
                  props.item.postBy?.profilePicUrl
                    ? { uri: props.item.postBy?.profilePicUrl }
                    : require("../../assets/defaultProfilePic.png")
                }
              />
              {/* 사용자 이름 */}
              <Text style={{ marginLeft: 20, marginRight: 30, fontWeight: 'bold', top: 10 }}>
                {props.item.postBy.userName}
              </Text>
              {/* 작성일 */}
              <Text style={{ marginLeft: 20, color: 'gray', top: 10 }}>
                * {moment(props.item.creation).format("YYYY-MM-D")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Tab = createMaterialTopTabNavigator();
export default function Profile({ props, navigation, route }) {
  const [user, setUser] = useState([]);
  const [folderlist, setfolderlist] = useState([]);
  const [Scraplist, setScraplist] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComponent, setShowComponent] = React.useState(false);
  const [dimensions, setDimensions] = useState({window});
  const cancelPopup = () => {
    setVisible(false);
  };
  
  const ConfirmPopup = async (item) => {
    setVisible(false);
    // 폴더를 삭제하기 위해 해당 폴더를 찾습니다.
    const snapshot = await firebase.firestore().collection("Folders")
      .where('folderId', '==', item)
      .get();
    
    const docid = snapshot.docs[0].id;
  
    // 폴더를 삭제합니다.
    await firebase.firestore().collection("Folders")
      .doc(docid)
      .delete();
  
    // 현재 사용자의 ID를 가져옵니다.
    const id = firebase.auth().currentUser.uid;
  
    // 해당 폴더에 속한 포스트를 가져옵니다.
    const snapshot2 = await firebase.firestore().collection("FolderPosts")
      .where('folderId', '==', item)
      .get();
  
    if (snapshot2.docs.length == 0) {
      // 폴더에 속한 포스트가 없는 경우, 폴더 목록을 새로고침합니다.
      FolderRefresh();
    } else {
      // 폴더에 속한 포스트가 있는 경우, 각 포스트를 삭제하고 사용자의 포스트 수를 업데이트합니다.
      await Promise.all(snapshot2.docs.map(async (doc) => {
        const data = doc.id;
        
        await firebase.firestore().collection("FolderPosts")
          .doc(data)
          .delete();
  
        await firebase.firestore().collection("users")
          .doc(id)
          .update({
            postNum: firebase.firestore.FieldValue.increment(-1)
          })
          .catch((error) => {
            // 업데이트 중에 오류가 발생한 경우 처리합니다.
          });
      }));
      // 폴더 목록을 새로고침합니다.
      FolderRefresh();
    }
  };
  
  useEffect(() => {
    // 유저 정보를 가져와서 설정합니다.
    fetchUser("", (user) => {
      setUser(user);
    });
  
    // 폴더 목록을 가져와서 설정합니다.
    fetchFolder("", (folderlist) => {
      setfolderlist(folderlist);
    });
  
    // 스크랩한 포스트 목록을 가져와서 설정합니다.
    fetchScrapPost("", (Scraplist) => {
      setScraplist(Scraplist)
    });
  
    // 1초 후에 컴포넌트를 표시합니다.
    setTimeout(() => {
      setShowComponent(true);
    }, 1000);
  
    // 디바이스 크기 변경 시 이벤트 리스너를 등록합니다.
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window }) => {
        setDimensions({ window })
      }
    );
  
    // 컴포넌트가 언마운트되거나 업데이트되기 전에 이벤트 리스너를 제거합니다.
    return () => subscription?.remove();
  }, []);
  
  const allRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // 유저 정보를 가져와서 설정합니다.
      fetchUser("", (user) => {
        setUser(user);
      });
  
      // 폴더 목록을 가져와서 설정합니다.
      fetchFolder("", (folderlist) => {
        setfolderlist(folderlist);
      });
  
      // 스크랩한 포스트 목록을 가져와서 설정합니다.
      fetchScrapPost("", (Scraplist) => {
        setScraplist(Scraplist)
      });
  
      setRefreshing(false);
    }, 2500);
  }
  
  const FolderRefresh = () => {
    // 폴더 목록을 가져와서 설정합니다.
    fetchFolder("", (folderlist) => {
      setfolderlist(folderlist);
    });
  }
  
  const fetchScrapPost = async (userId, callback) => {
    const id = firebase.auth().currentUser.uid;
    var arr = [];
  
    // 현재 사용자의 스크랩 목록을 가져옵니다.
    firebase.firestore().collection('users')
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.data()) {
          const Scraplists = doc.data().Scrap;
          if (Scraplists.length != 0) {
            // 스크랩한 포스트를 가져옵니다.
            firebase.firestore().collection("FolderPosts")
              .where('folderpostId', 'in', Scraplists)
              .orderBy("creation", "desc")
              .get()
              .then(async (snapshot) => {
                await Promise.all(
                  snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const allDataWithUser = await data.postBy.get();
                    data.postBy = allDataWithUser.data();
                    data.creation = data.creation.toDate();
                    arr.push(data);
                  })
                ).then(() => {
                  arr.sort((a, b) => b.creation - a.creation);
                  callback(arr);
                })
                .catch(() => {
                  // 처리 중에 오류가 발생한 경우 처리합니다.
                });
              });
          } else {
            // 스크랩한 포스트가 없는 경우 빈 배열을 반환합니다.
            callback([]);
          }
        }
      });
  };
  const fetchFolder = async (userId, callback) => {
    const id = firebase.auth().currentUser.uid;
    var arr = [];
  
    // 현재 사용자의 폴더 목록을 가져옵니다.
    await firebase.firestore().collection("Folders")
      .where('userId', '==', id)
      .orderBy("creation", "desc")
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const allDataWithUser = await data.postBy.get();
            data.postBy = allDataWithUser.data();
            data.creation = data.creation.toDate();
            arr.push(data);
          })
        ).then(() => {
          arr.sort((a, b) => b.creation - a.creation);
          callback(arr);
        });
      });
  };
  
  const fetchUser = (userId, callback) => {
    const id = firebase.auth().currentUser.uid;
  
    // 현재 사용자의 정보를 가져와서 감시합니다.
    firebase.firestore().collection("users")
      .doc(id)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          callback(snapshot.data());
        } 
      });
  };
  
  const [activeIndex, setactiveIndex] = useState(0);
  
  const FoldermakeButton = () => {
    if (activeIndex == 0) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateFolder', FolderRefresh)}
          style={{
            alignSelf: 'center',
            position: 'relative',
            bottom: 0,
            left: 120,
            flexDirection: 'row',
            marginRight: 10,
          }}>
          <Ionicons name="folder-open-outline" size={35} style={{ color: '#ffa7a7' }} />
          <Text style={{ top: 12, fontWeight: "bold", color: 'black' }}>폴더 추가</Text>
        </TouchableOpacity>
      );
    }
  };
  
  const Pagestate = (props) => {
    if (showComponent) {
      if (activeIndex == 0) {
        if (folderlist.length == 0) {
          // 폴더가 없는 경우 메시지를 표시합니다.
          return (
            <View style={{height: Dimensions.get('window').height * 0.02, justifyContent: 'center', alignItems: 'center', top: 150 }}>
              <Text>폴더를 추가해주세요!</Text>
            </View>
          );
        }
  
        // 폴더 목록을 표시합니다.
        return (
          <View style={{ height: Dimensions.get('window').height * 0.5 }}>
            <SafeAreaView>
              <FlatList
                scrollEnabled={false}
                data={folderlist}
                renderItem={({ item }) => Folder(item, props, FolderRefresh, visible, setVisible, ConfirmPopup, cancelPopup, dimensions)}
                numColumns={2}
                scrollEventThrottle={1}
                scrollToOverflowEnabled={true}
              />
            </SafeAreaView>
          </View>
        );
      } else {
        // 스크랩한 포스트 목록을 표시합니다.
        return (
          <View style={{ flex: 1 }}>
            <SafeAreaView>
              <FlatList
                scrollEnabled={false}
                data={Scraplist}
                renderItem={({ item }) => <Scrap item={item} navigation={navigation} />}
              />
            </SafeAreaView>
          </View>
        );
      }
    } else {
      // 컴포넌트를 로딩 중임을 표시합니다.
      return (
        <View>
          {true && <ActivityIndicator style={{ height: Dimensions.get('window').height * 0.05, marginLeft: 10 }} size="small" color="#000000" />}
        </View>
      );
    }
  };
  
  const senmentClicked = (activeIndex) => {
    setactiveIndex(activeIndex);
  };
  

  return (
    <MenuProvider skipInstanceCheck>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={allRefresh} />
        }
        stickyHeaderIndices={[1]}
        style={{ backgroundColor: 'white' }}
      >
        {/* 유저 정보를 표시하는 섹션 */}
        <View
          style={{
            backgroundColor: 'white',
            width: useWindowDimensions('window').width,
            height: useWindowDimensions('window').height * 0.30,
            marginBottom: 10,
          }}
        >
          <ImageBackground
            style={{ width: useWindowDimensions('window').width, height: useWindowDimensions('window').height * 0.26, flexDirection: 'row' }}
            resizeMode='cover'
            source={
              user?.backPicUrl
                ? { uri: user?.backPicUrl }
                : require('../../assets/backface.jpg')
            }
          >
            {/* 유저 정보와 소개 텍스트를 표시하는 섹션 */}
            <View style={{ height: useWindowDimensions('window').height * 0.1, width: useWindowDimensions('window').width * 0.7 }}>
              <View style={{ height: useWindowDimensions('window').height * 0.16 }}></View>
              <View
                style={{
                  height: useWindowDimensions('window').height * 0.16,
                  backgroundColor: '#fff',
                  borderTopWidth: 2,
                }}
              >
                {user?.introduce && user?.introduce != '' && (
                  <Text style={{ marginTop: 10, marginLeft: 20, fontSize: 19 }}>
                    {user?.introduce}
                  </Text>
                )}
              </View>
            </View>
            {/* 프로필 사진과 유저 이름을 표시하는 섹션 */}
            <View
              style={{
                alignItems: 'center',
                width: useWindowDimensions('window').width * 0.2,
                marginTop: 95,
                borderTopEndRadius: 82,
                borderTopStartRadius: 82,
                backgroundColor: '#fff',
              }}
            >
              <Image
                source={
                  user?.profilePicUrl
                    ? { uri: user?.profilePicUrl }
                    : require('../../assets/defaultProfilePic.png')
                }
                style={{
                  width: useWindowDimensions('window').width * 0.2,
                  height: useWindowDimensions('window').height * 0.093,
                  borderRadius: 500,
                  marginRight: 1,
                }}
              />
              <View
                style={{
                  alignItems: 'center',
                  width: useWindowDimensions('window').width * 0.4,
                  height: useWindowDimensions('window').height * 0.03,
                  marginTop: 10,
                  backgroundColor: '#fff',
                }}
              >
                {user?.name && user?.name != '' && (
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>
                    {user?.name}
                  </Text>
                )}
              </View>
            </View>
            {/* 게시물, 팔로워, 팔로잉 정보를 표시하는 섹션 */}
            <View style={{ width: useWindowDimensions('window').width * 0.1 }}>
              <View style={{ height: useWindowDimensions('window').height * 0.16 }}></View>
              <View style={{ height: useWindowDimensions('window').height * 0.16, borderTopWidth: 2, backgroundColor: '#fff' }}></View>
            </View>
          </ImageBackground>
  
          {/* 게시물/북마크 탭을 표시하는 섹션 */}
          <View style={{ flexDirection: 'row', paddingTop: 10, marginBottom: 5, right: 10 }}>
            <View style={{ flex: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 30 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 15, color: 'gray' }}>게시물 </Text>
                  <Text style={{ fontSize: 15 }}>{user?.postNum} </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 15, color: 'gray' }}>팔로워 </Text>
                  <Text style={{ fontSize: 15 }}>{user?.followerNum} </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 15, color: 'gray' }}>팔로잉 </Text>
                  <Text style={{ fontSize: 15 }}>{user?.followingNum} </Text>
                </View>
              </View>
            </View>
          </View>
          </View>
          {/* 게시물과 북마크 탭을 전환할 수 있는 버튼을 표시하는 섹션 */}
          <View style={{ bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#B2CCFF', borderWidth: 1, borderRadius: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: 350, height: 40 }}>
              <Button onPress={() => senmentClicked(0)}>
                <Ionicons name="ios-apps" size={20} style={[activeIndex === 0 ? {} : { color: 'grey', textDecorationLine: 'underline' }]} />
              </Button>
              <Button onPress={() => senmentClicked(1)}>
                <Ionicons name="ios-bookmark" size={20} style={[activeIndex === 1 ? {} : { color: 'grey', textDecorationLine: 'underline' }]} />
              </Button>
            </View>
          </View>
       
  
        {/* 게시물 또는 북마크를 표시하는 섹션 */}
        <Pagestate user={user} navigation={navigation} />
  
      </ScrollView>
  
      {/* 폴더 추가 버튼을 표시하는 섹션 */}
      <View style={{ backgroundColor: 'white' }}>
        <FoldermakeButton></FoldermakeButton>
      </View>
  
      {/* 하단 여백 */}
      <View style={{ backgroundColor: 'white', height: useWindowDimensions('window').height * 0.03 }}></View>
  
    </MenuProvider>
  );
  
};

const styles = StyleSheet.create({
  inputIOS: {
    marginTop:20,
    marginBottom:20,
    fontSize: 16,
    width:320,
    height:50,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    
    paddingRight: 30, 
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonConfirm: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


