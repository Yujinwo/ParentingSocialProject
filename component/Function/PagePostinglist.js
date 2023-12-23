import * as React from "react";
import { useState,useEffect  } from "react";
import {
  Text, 
  View,
  SafeAreaView,Dimensions,ImageBackground,Image,TouchableOpacity,Modal,StyleSheet} from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import Carousel from 'react-native-snap-carousel';
import { ScrollView } from 'react-native-gesture-handler';
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
const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);
const { SlideInMenu } = renderers;
export default function Notelist({props,navigation,route }) { 
  const [visible, setVisible] = useState(false);
  const [PagePostinglist, setPagePostinglist] = useState([]);
  
  // 팝업 창을 닫을 때 호출되는 함수
  const cancelPopup = () => {
    setVisible(false);
    
    // 취소 버튼을 눌렀을 때 수행할 작업을 여기에 추가합니다.
  };
  
  // 팝업 창에서 확인 버튼을 눌렀을 때 호출되는 함수
  const ConfirmPopup = async (item) => {
    // item에 해당하는 PagePosts를 가져옵니다.
    const snapshot = await firebase.firestore().collection("PagePosts")
      .where('NotepostId', '==', item)
      .get();
    
    const docid = snapshot.docs[0].id;
  
    // 가져온 PagePosts를 삭제합니다.
    await firebase.firestore().collection("PagePosts")
      .doc(docid)
      .delete()
  
    setVisible(false);
    RefreshPage(); // 페이지 새로고침 함수 호출
  };
  
  useEffect(() => {
    // 페이지 로드 시 초기 데이터를 가져오기 위해 fetchPagePost 함수를 호출합니다.
    fetchPagePost("", (PagePostinglist) => {
      setPagePostinglist(PagePostinglist)
    });
  }, []);
  
  // 페이지 새로고침 함수
  const RefreshPage = () => {
    fetchPagePost("", (PagePostinglist) => {
      setPagePostinglist(PagePostinglist)
    });
  };
  
  // 페이지 데이터를 가져오는 함수
  const fetchPagePost = async (userId, callback) => {
    var arr = [];
    await firebase.firestore().collection("PagePosts")
      .where('NoteId', '==', route.params)
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
  

  const _renderItem = (item, navigation) => {
    return (
      <View
        style={{
          borderColor: 'gray',
          borderRadius: 20,
          borderWidth: 1,
          width: 270,
          height: 500,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 5,
          marginRight: 25,
          marginTop: 50,
        }}
        key={item.NotepostId}
      >
        <Modal visible={visible} animationType="fade" transparent={true}>
          {/* 페이지 삭제 팝업창 */}
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>페이지를 삭제하시겠습니까?</Text>
              <Text style={styles.modalMessage}>
                확인을 누를 시 페이지는 삭제됩니다.
              </Text>
              <View style={styles.buttonsContainer}>
                {/* 취소 버튼 */}
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={cancelPopup}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                {/* 확인 버튼 */}
                <TouchableOpacity
                  style={styles.buttonConfirm}
                  onPress={() => ConfirmPopup(item.NotepostId)}
                >
                  <Text style={styles.buttonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* 배경 이미지 */}
        <ImageBackground
          style={{ width: 270, height: 500 }}
          source={require('../../assets/wall.jpg')}
          imageStyle={{ borderRadius: 20, borderWidth: 1 }}
        >
          {/* 메뉴 */}
          <Menu renderer={SlideInMenu} style={{ alignItems: 'flex-end' }}>
            <MenuTrigger
              style={{ borderColor: 'white', height: 30, width: 45 }}
            >
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
              {/* 페이지 수정 옵션 */}
              <MenuOption
                onSelect={() =>
                  navigation.navigate('EditPagePosting', {
                    item: item,
                    RefreshPage: RefreshPage,
                  })
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
                  <Ionicons
                    name="pencil-outline"
                    size={30}
                    style={{ color: 'black', alignItems: 'center' }}
                  />{' '}
                  페이지 수정
                </Text>
              </MenuOption>
              {/* 페이지 삭제 옵션 */}
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
                  <Ionicons
                    name="trash-outline"
                    size={30}
                    style={{ color: 'black', alignItems: 'center' }}
                  />{' '}
                  페이지 삭제
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
  
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
            <View>
              {/* 캡션 */}
              <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'center', marginRight: 10 }}>{item.caption}</Text>
            </View>
  
            <View>
              <Text style={{ fontSize: 20, color: 'white' }}>*</Text>
            </View>
  
            <View>
              {/* 생성 일자 */}
              <Text style={{ fontSize: 15, color: 'white', marginLeft: 10 }}>{moment(item.creation).format("YYYY-MM-D")}</Text>
            </View>
          </View>
  
          <Image style={{ width: 270, height: 3, marginTop: 20 }} source={require("../../assets/straight.png")} imageStyle={{ borderRadius: 20, borderWidth: 1 }} />
           {/* 이미지 */}
          <Image
            style={{ width: 270, height: 130, justifyContent: 'center', alignItems: 'center' }}
            source={
              item.downloadURL
                ? { uri: item.downloadURL }
                : require("../../assets/black.png")
            }
          />
          
          <Image style={{ width: 270, height: 3 }} source={require("../../assets/straight.png")} imageStyle={{ borderRadius: 20, borderWidth: 1 }} />
  
          <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
            {/* 내용 */}
            <Text style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'black' }}>{item.content}</Text>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  };
  
  if (PagePostinglist.length == 0) {
    // 페이지가 없을 때
    return (
      <ImageBackground source={require("../../assets/wall.jpg")} style={{ height: 700 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/* "페이지를 추가해주세요!" 텍스트 */}
          <Text>페이지를 추가해주세요!</Text>
  
          {/* "페이지 추가" 버튼 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('PagePost', { Pageid: route.params, RefreshPage: RefreshPage })}
            style={{
              bottom: -230,
              left: 130,
              flexDirection: 'row',
              marginRight: 10,
            }}
          >
            <Ionicons name="reader-outline" size={35} style={{ color: '#ffa7a7' }} />
            <Text style={{ top: 12, fontWeight: "bold", color: 'black' }}>페이지 추가</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
  
  return (
    <MenuProvider skipInstanceCheck>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        {/* 페이지 목록을 Carousel 컴포넌트로 표시 */}
        <Carousel
          layout={'default'}
          data={PagePostinglist}
          sliderWidth={SLIDER_WIDTH}
          itemWidth={ITEM_WIDTH}
          renderItem={({ item, index, route }) => _renderItem(item, navigation)}
        />
  
        {/* "페이지 추가" 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('PagePost', { Pageid: route.params, RefreshPage: RefreshPage })}
          style={{
            alignSelf: 'flex-end',
            position: 'relative',
            bottom: 40,
            right: 0,
            flexDirection: 'row',
            marginRight: 10,
          }}
        >
          <Ionicons name="reader-outline" size={35} style={{ color: '#ffa7a7' }} />
          <Text style={{ top: 12, fontWeight: 'bold', color: '#ffa7a7' }}>페이지 추가</Text>
        </TouchableOpacity>
      </SafeAreaView>
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