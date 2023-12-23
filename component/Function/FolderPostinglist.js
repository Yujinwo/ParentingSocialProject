import * as React from "react";
import { useState,useEffect  } from "react";
import { Text, View, Image,Dimensions,TouchableOpacity,ImageBackground,Modal,StyleSheet } from "react-native";
import { interpolate } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { MenuProvider } from 'react-native-popup-menu';
import { renderers } from 'react-native-popup-menu';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import moment from 'moment';
import { firebase } from "../../firebase";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
const { SlideInMenu } = renderers;
function Folderlist( {navigation,route }) {
  const [FolderPostinglist, setFolderPostinglist] = useState([]);
  const [visible, setVisible] = useState(false);
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const SLIDER_HEIGHT= Dimensions.get('window').height;
  const headerHeight = 100;
  const scale = 0.9;
  const RIGHT_OFFSET = SLIDER_WIDTH * (1 - scale);
  const ITEM_WIDTH = SLIDER_WIDTH * scale;
  const ITEM_HEIGHT = 120;
  const PAGE_HEIGHT = SLIDER_HEIGHT - headerHeight;
  const PAGE_WIDTH = SLIDER_WIDTH;
  // route.params에서 folderId와 placeholder를 가져옴
  let folderId = route.params.folderId
  let placeholder = route.params.placeholder
  // 애니메이션 스타일을 정의하는 animationStyle 함수
  const animationStyle = React.useCallback(
    (value) => {
    
      "worklet";

      const translateY = interpolate(
        value,
        [-1, 0, 1],
        [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
      );
      const right = interpolate(
        value,
        [-1, -0.2, 1],
        [RIGHT_OFFSET / 2, RIGHT_OFFSET, RIGHT_OFFSET / 3],
      );
      return {
        transform: [{ translateY }],
        right,
      };
    },
    [RIGHT_OFFSET],
  );

  useEffect(() => {
    // 폴더 상태를 가져오고 폴더 포스트를 가져와서 상태를 설정합니다.
    fetchFolderState();
    fetchFolderPost("", (FolderPostinglist) => {
      setFolderPostinglist(FolderPostinglist);
    });
  }, []);
  
  const RefreshFolderPosting = () => {
    setTimeout(() => {
      // 일정 시간 후에 폴더 포스트를 다시 가져와서 상태를 업데이트합니다.
      fetchFolderPost("", (FolderPostinglist) => {
        setFolderPostinglist(FolderPostinglist);
      });
    }, 400);
  };
  
  const fetchFolderState = async (userId, callback) => {
    var arr = [];
    // 파이어베이스에서 "Folders" 컬렉션에서 해당 폴더의 데이터를 가져옵니다.
    await firebase
      .firestore()
      .collection("Folders")
      .where('folderId', '==', route.params.folderId)
      .orderBy("creation", "desc")
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // 포스트 작성자의 데이터를 가져옵니다.
            const allDataWithUser = await data.postBy.get();
            data.postBy = allDataWithUser.data();
            // 파이어베이스 타임스탬프를 Date 객체로 변환합니다.
            data.creation = data.creation.toDate();
            arr.push(data);
          })
        ).then(() => {
          if (arr == null) {
            // 만약 데이터가 없으면 삭제된 폴더라는 알림을 표시하고 이전 화면으로 이동합니다.
            alert('삭제된 폴더입니다. 다시 시도해주세요');
            navigation.goBack();
          }
          // 생성일을 기준으로 내림차순으로 정렬합니다.
          arr.sort((a, b) => b.creation - a.creation);
          callback(arr);
        }).catch(() => {
         
        });
      });
  };
  
  const fetchFolderPost = async (userId, callback) => {
    var arr = [];
    // 파이어베이스에서 "FolderPosts" 컬렉션에서 해당 폴더의 포스트 데이터를 가져옵니다.
    await firebase
      .firestore()
      .collection("FolderPosts")
      .where('folderId', '==', route.params.folderId)
      .orderBy("creation", "desc")
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // 포스트 작성자의 데이터를 가져옵니다.
            const allDataWithUser = await data.postBy.get();
            data.postBy = allDataWithUser.data();
            // 파이어베이스 타임스탬프를 Date 객체로 변환합니다.
            data.creation = data.creation.toDate();
            arr.push(data);
          })
        ).then(() => {
          // 생성일을 기준으로 내림차순으로 정렬합니다.
          arr.sort((a, b) => b.creation - a.creation);
          callback(arr);
        });
      });
  };
  



  if (FolderPostinglist.length == 0) {
    // 만약 FolderPostinglist의 길이가 0이면, 아래의 내용을 화면에 표시합니다.
    return (
      <ImageBackground source={require("../../assets/wall.jpg")} style={{height:700}}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>글을 추가해주세요!</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FolderPost', { folderId: folderId, placeholder: placeholder, RefreshFolderPosting: RefreshFolderPosting })} style={{
            bottom: -230,
            left: 130,
            flexDirection: 'row',
            marginRight: 10,
          }}>
            <Ionicons name="pencil-outline" size={35} style={{ color: '#ffa7a7' }} />
            <Text style={{ top: 12, fontWeight: "bold", color: 'black' }}>글 쓰기</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
  
  const cancelPopup = () => {
    setVisible(false);
  };
  
  const ConfirmPopup = async (item) => {
    // 해당 아이템의 folderpostId와 일치하는 FolderPosts 컬렉션의 문서를 찾습니다.
    const snapshot = await firebase.firestore().collection("FolderPosts")
      .where('folderpostId', '==', item)
      .get();
    const docid = snapshot.docs[0].id;
  
    // 문서를 삭제합니다.
    await firebase.firestore().collection("FolderPosts")
      .doc(docid)
      .delete();
  
    setVisible(false);
    RefreshFolderPosting();
  
    const id = firebase.auth().currentUser.uid;
    // 사용자의 postNum을 1만큼 감소시킵니다.
    await firebase.firestore().collection("users")
      .doc(id)
      .update({
        postNum: firebase.firestore.FieldValue.increment(-1)
      })
      .catch((error) => {
        // 에러 처리
      });
  };
  
  return (
    <MenuProvider skipInstanceCheck>
      <View style={{ flex: 1 }}>
        {/* 배경 이미지 */}
        <Image
          source={require("../../assets/wall.jpg")}
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT + 100,
            position: "absolute",
          }}
        />
  
        {/* 흐린 배경 */}
        <BlurView
          intensity={80}
          tint="dark"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT + 100,
            position: "absolute",
          }}
        />
  
        {/* Carousel */}
        <Carousel
          loop={false}
          vertical
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT - 100,
          }}
          width={ITEM_WIDTH}
          height={ITEM_HEIGHT}
          data={FolderPostinglist}
          renderItem={({ item, index, route }) => {
            return (
              <View style={{ flex: 1, padding: 10 }} key={item.folderpostId}>
                {/* 글 삭제 모달 */}
                <Modal visible={visible} animationType="fade" transparent={true}>
                  <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>글을 삭제하시겠습니까?</Text>
                      <Text style={styles.modalMessage}>확인을 누를 시 글은 삭제 됩니다</Text>
                      <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.buttonCancel} onPress={cancelPopup}>
                          <Text style={styles.buttonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.buttonConfirm}
                          onPress={() => ConfirmPopup(item.folderpostId)}
                        >
                          <Text style={styles.buttonText}>확인</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
  
                {/* 글 내용 */}
                <View
                  style={{
                    alignItems: "flex-start",
                    flex: 1,
                    justifyContent: "space-between",
                    flexDirection: "row",
                    borderRadius: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    
                  </View>
                  <View
                    style={{
                      width: ITEM_WIDTH * 0.8,
                      height: ITEM_HEIGHT + 30,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {/* 글쓴이 정보 */}
                    <TouchableOpacity onPress={() => navigation.navigate('FollwingPostingUi',item.folderpostId)}>
                       {/* 폴더 이미지 */}
                      <ImageBackground
                        style={{
                          width: ITEM_WIDTH * 0.6,
                          height: ITEM_HEIGHT - 40,
                          marginRight: 5,
                          marginBottom: 10,
                        }}
                        imageStyle={{ borderRadius: 10 }}
                        source={
                          item.downloadURL 
                          ? { url: item.downloadURL } 
                          : require("../../assets/black.png")
                        }
                      >
                        {/* 메뉴 */}
                        <Menu renderer={SlideInMenu} style={{ alignItems: 'flex-end' }}>
                          <MenuTrigger style={{ borderColor: 'white', height: 30, width: 45 }}>
                            <Ionicons
                              name="ellipsis-horizontal-outline"
                              size={35}
                              style={{ color: 'white', marginRight: 15, left: 0, bottom: 0, width: 35 }}
                            />
                          </MenuTrigger>
  
                          <MenuOptions
                            optionsContainerStyle={{
                              borderWidth: 2,
                              borderColor: 'black',
                              borderRadius: 30,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginLeft: 30,
                              marginRight: 30,
                            }}
                          >
                            <MenuOption
                              onSelect={() =>
                                navigation.navigate('EditFolderPosting', { item: item, RefreshFolderPosting: RefreshFolderPosting })
                              }
                            >
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontSize: 25,
                                  color: 'gray',
                                  alignItems: 'center',
                                  borderWidth: 2,
                                  borderRadius: 15,
                                  width: 300,
                                }}
                              >
                                <Ionicons name="pencil-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 글 수정
                              </Text>
                            </MenuOption>
                            <MenuOption onSelect={() => setVisible(true)}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontSize: 25,
                                  color: 'gray',
                                  borderWidth: 2,
                                  borderRadius: 15,
                                  width: 300,
                                }}
                              >
                                <Ionicons name="trash-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 글 삭제
                              </Text>
                            </MenuOption>
                          </MenuOptions>
                        </Menu>
                      </ImageBackground>
                        {/* 프로필 이미지 */}
                      <View style={{ flexDirection: 'row' }}>
                        <Image
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            marginRight: 5,
                          }}
                          source={
                            item.postBy?.profilePicUrl
                              ? { uri: item.postBy?.profilePicUrl }
                              : require("../../assets/defaultProfilePic.png")
                          }
                        />
                        {/* 제목 */}
                        <Text
                          numberOfLines={1}
                          style={{
                            maxWidth: ITEM_WIDTH * 0.3 + 40,
                            color: "white",
                            fontWeight: 'bold',
                          }}
                        >
                          {item.caption} 
                        </Text>
                          {/* 텍스트 * */}
                        <Text
                          numberOfLines={1}
                          style={{
                            marginLeft: 10,
                            marginRight: 10,
                            maxWidth: ITEM_WIDTH * 0.3 + 40,
                            color: "white",
                          }}
                        >
                          * 
                        </Text>
                        {/* 생성날짜 */}
                        <Text
                          numberOfLines={1}
                          style={{
                            maxWidth: ITEM_WIDTH * 0.3 + 40,
                            color: "white",
                          }}
                        >
                          {moment(item.creation).format("YYYY-MM-D")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          customAnimation={animationStyle}
        />
        {/* 글 쓰기 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('FolderPost', { folderId: folderId, placeholder: placeholder, RefreshFolderPosting: RefreshFolderPosting })}
          style={{
            bottom: 30,
            left: 280,
            flexDirection: 'row',
            marginRight: 10,
          }}
        >
          <Ionicons name="pencil-outline" size={35} style={{ color: '#ffa7a7' }} />
          <Text style={{ top: 12, fontWeight: "bold", color: 'black' }}>글 쓰기</Text>
        </TouchableOpacity>
      </View>
    </MenuProvider>
  );
}

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



export default Folderlist;