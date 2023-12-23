import * as React from "react";
import { useState,useEffect  } from "react";
import { Text, View, Image,Dimensions,TouchableOpacity,ImageBackground } from "react-native";
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

{/* 모달 헤더 */}
const ModHeader = (props) => {
  return (
    <View style={{ marginTop: 30, backgroundColor: 'white', height: 90, bottom: 30 }}>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 40, alignItems: 'center' }}>
        {/* 이전 페이지로 이동하는 버튼 */}
        <Ionicons name="arrow-back-outline" size={40} style={{ color: 'black',right:80  }} onPress={() => props.navigation.navigate('OtherUserProfile')} />
        {/* 페이지 제목 */}
        <Text style={{ fontSize: 20, color: 'black',right:50  }}>글 리스트</Text>
        {/* 추가 옵션 메뉴 버튼 */}
      
      </View>
    </View>
  );
}

function OtherFolerPostinglist( {navigation,route }) {

  const [FolderPostinglist, setFolderPostinglist] = useState([]);
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const SLIDER_HEIGHT= Dimensions.get('window').height;
  const headerHeight = 100;
  const scale = 0.9;
  const RIGHT_OFFSET = SLIDER_WIDTH * (1 - scale);
  const ITEM_WIDTH = SLIDER_WIDTH * scale;
  const ITEM_HEIGHT = 120;
  const PAGE_HEIGHT = SLIDER_HEIGHT - headerHeight;
  const PAGE_WIDTH = SLIDER_WIDTH;

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
    fetchFolderState();
    fetchFolderPost("", (FolderPostinglist) => {
      setFolderPostinglist(FolderPostinglist);
    });
  }, []);
  
  // 폴더 상태를 가져오는 함수
  const fetchFolderState = async (userId, callback) => {
    var arr = [];
    await firebase.firestore().collection("Folders")
      .where('folderId', '==', route.params)
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
          if (arr.length == 0) {
            alert('삭제된 폴더 입니다. 다시 시도해주세요');
            navigation.goBack(route.params);
          }
          arr.sort((a, b) => b.creation - a.creation);
          callback(arr);
        }).catch(() => {
          // 에러 처리
        });
      });
  };
  
  // 폴더 게시물을 가져오는 함수
  const fetchFolderPost = async (userId, callback) => {
    var arr = [];
    await firebase.firestore().collection("FolderPosts")
      .where('folderId', '==', route.params)
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
          arr.sort((a, b) => b.creation - a.creation);
          callback(arr);
        });
      });
  };
  // 글이 존재하지 않을 시 렌더링 컴포넌트
  if (FolderPostinglist.length == 0) {
    return (
      <ImageBackground source={require("../../assets/wall.jpg")} style={{ flex: 1 }}>
        {/* 모달 헤더 */}
        <ModHeader navigation={navigation} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>글이 존재하지 않습니다!</Text>
        </View>
      </ImageBackground>
    );
  }
  
 
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
    intensity={0}
    tint="dark"
    style={{
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT + 100,
      position: "absolute",
    }}
  />
  {/* 모달 헤더 */}
  <ModHeader navigation={navigation}></ModHeader>
  {/* Carousel */}
  <Carousel
    loop={false}
    vertical
    style={{
      justifyContent: "center",
      alignItems: 'center',
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT - 100,
    }}
    width={ITEM_WIDTH}
    height={ITEM_HEIGHT}
    data={FolderPostinglist}
    renderItem={({ item, index, route }) => {
      return (
        <View key={item.folderpostId} style={{ flex: 1, padding: 10 }}>
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
              <TouchableOpacity onPress={() => navigation.navigate('FollwingPostingUi', item.folderpostId)}>
                {/* 폴더 이미지 */}
                <ImageBackground
                  style={{
                    width: ITEM_WIDTH * 0.6,
                    height: ITEM_HEIGHT - 40,
                    marginRight: 5,
                    marginBottom: 10,
                  }}
                  imageStyle={{ borderRadius: 10 }}
                  source={item.downloadURL
                    ? { url: item.downloadURL }
                    : require("../../assets/black.png")
                  }
                >
                  {/* 메뉴 */}
                  <Menu renderer={SlideInMenu} style={{ alignItems: 'flex-end' }}>
                    <MenuTrigger style={{ borderColor: 'white', height: 30, width: 45 }}>
                      <Ionicons name="ellipsis-horizontal-outline" size={35} style={{ color: 'white', marginRight: 15, left: 0, bottom: 0, width: 35 }} />
                    </MenuTrigger>
                    <MenuOptions optionsContainerStyle={{ borderWidth: 2, borderColor: 'black', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 30, marginRight: 30 }}>
                      <MenuOption onSelect={() => alert(`수정`)}>
                        <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', alignItems: 'center', borderWidth: 2, borderRadius: 15, width: 300 }}>미구현</Text>
                      </MenuOption>
                      <MenuOption onSelect={() => alert(`삭제`)}>
                        <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', borderWidth: 2, borderRadius: 15, width: 300 }}>미구현</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </ImageBackground>
               
                <View style={{ flexDirection: 'row' }}>
                  {/* 프로필 이미지 */}
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
                      fontWeight: 'bold'
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
</View>

      </MenuProvider>
  );
}

export default OtherFolerPostinglist;