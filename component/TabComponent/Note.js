import React, { useEffect, useState } from "react";
import { View,TouchableOpacity,Image,ImageBackground ,Modal,StyleSheet} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Card,Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MenuProvider } from 'react-native-popup-menu';
import { renderers } from 'react-native-popup-menu';
import { firebase } from "../../firebase";
import moment from 'moment';
const { SlideInMenu } = renderers;
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
function Note({navigation}) {
  const [mode, setMode] = React.useState("rotate-scale-fade-in-out");
  const [snapDirection, setSnapDirection] = React.useState("left")
  const [pagingEnabled, setPagingEnabled] = React.useState(true);
  const [snapEnabled, setSnapEnabled] = React.useState(true);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [visible, setVisible] = useState(false);
  const cancelPopup = () => {
    setVisible(false);
    
    
  };

  const ConfirmPopup = async (noteid) => {
    console.log(noteid);
  
    setVisible(false);
  
    // Notes 컬렉션에서 해당 noteid와 일치하는 문서를 가져옴
    const snapshot = await firebase.firestore().collection("Notes")
      .where('NoteId', '==', noteid)
      .get();
  
    const docid = snapshot.docs[0].id; // 일치하는 문서의 ID를 가져옴
  
    // Notes 컬렉션에서 해당 문서를 삭제
    await firebase.firestore().collection("Notes")
      .doc(docid)
      .delete();
  
    // PagePosts 컬렉션에서 해당 noteid와 일치하는 문서들을 가져옴
    const snapshot2 = await firebase.firestore().collection("PagePosts")
      .where('NoteId', '==', noteid)
      .get();
  
    if (snapshot2.docs.length == 0) {
      // PagePosts 컬렉션에서 일치하는 문서가 없는 경우
      RefreshNote();
    } else {
      // PagePosts 컬렉션에서 일치하는 문서가 있는 경우
      await Promise.all(snapshot2.docs.map(async (doc) => {
        const data = doc.id;
        // 일치하는 문서를 삭제
        await firebase.firestore().collection("PagePosts")
          .doc(data)
          .delete();
      }));
      RefreshNote();
    }
  };
  
  const viewCount = 5;
  const [Notelist, setNotelist] = useState([]);
  
  useEffect(() => {
    // 컴포넌트가 마운트될 때 Notes를 가져와서 Notelist 상태를 업데이트
    fetchNote("", (Notelist) => {
      setNotelist(Notelist);
    });
  }, []);
  
  const RefreshNote = () => {
    // Notes를 다시 가져와서 Notelist 상태를 업데이트
    fetchNote("", (Notelist) => {
      setNotelist(Notelist);
    });
  };
  
  const fetchNote = async (userId, callback) => {
    const id = firebase.auth().currentUser.uid; // 현재 사용자의 UID를 가져옴
    var arr = []; // 빈 배열을 선언하여 데이터를 저장할 준비
  
    // Notes 컬렉션에서 현재 사용자의 ID와 일치하는 문서들을 가져옴
    await firebase.firestore().collection("Notes")
      .where('userId', '==', id)
      .orderBy("creation", "desc") // creation 필드를 기준으로 내림차순으로 정렬
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data(); // 문서 데이터를 가져옴
            const allDataWithUser = await data.postBy.get(); // postBy 필드의 참조 문서를 가져옴
            data.postBy = allDataWithUser.data(); // postBy 필드에 해당하는 문서의 데이터를 할당
            data.creation = data.creation.toDate(); // creation 필드의 값을 JavaScript Date 객체로 변환
            arr.push(data); // 데이터를 배열에 추가
          })
        ).then(() => {
          arr.sort((a, b) => b.creation - a.creation); // creation 필드를 기준으로 내림차순으로 정렬
          callback(arr); // 정렬된 배열을 콜백 함수에 전달하여 처리
        });
      });
  };
  


  const NoteCard = (item, navigation) => {
    return (
      <Card style={{flex: 1, width: 300, height: 350, borderRadius: 30, marginTop: 30}} key={item.NoteId}>
        {/* 삭제 확인 팝업 모달 */}
        <Modal visible={visible} animationType="fade" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>수첩을 삭제하시겠습니까?</Text>
              <Text style={styles.modalMessage}>확인을 누를 시 수첩은 삭제됩니다.</Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.buttonCancel} onPress={cancelPopup}>
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonConfirm} onPress={() => ConfirmPopup(item.NoteId)}>
                  <Text style={styles.buttonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
  
        {/* 페이지 목록으로 이동하는 터치 가능한 컴포넌트 */}
        <TouchableOpacity onPress={() => navigation.navigate('PagePostinglist', item.NoteId)}>
          <ImageBackground style={{width: 300, height: 300, justifyContent: 'center', alignItems: 'center'}} source={ 
            item.downloadURL
              ? {uri: item.downloadURL}
              : require("../../assets/black.png")
          } imageStyle={{borderRadius: 30}}>
            {/* 더보기 메뉴 */}
            <Menu renderer={SlideInMenu} style={{alignItems: 'flex-end'}}>
              <MenuTrigger style={{borderColor: 'white', height: 30, width: 45}}>
                <Ionicons name="ellipsis-horizontal-outline" size={35} style={{color: 'white', marginRight: 12, left: 100, bottom: 120}}/>
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={{borderWidth: 2, borderColor: 'black', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 30, marginRight: 30}}>
                {/* 수정하기 옵션 */}
                <MenuOption onSelect={() => navigation.navigate('EditNote', {RefreshNote: RefreshNote, item: item})}>
                  <Text style={{textAlign: 'center', fontSize: 25, color: 'gray', alignItems: 'center', borderWidth: 2, borderRadius: 15, width: 300}}>
                    <Ionicons name="pencil-outline" size={30} style={{color: 'black', alignItems: 'center'}} /> 수첩 수정
                  </Text>
                </MenuOption>
                {/* 삭제하기 옵션 */}
                <MenuOption onSelect={() => {
                  setVisible(true);
                  console.log(item.NoteId);
                }}>
                  <Text style={{textAlign: 'center', fontSize: 25, color: 'gray', borderWidth: 2, borderRadius: 15, width: 300}}>
                    <Ionicons name="trash-outline" size={30} style={{color: 'black', alignItems: 'center'}} /> 수첩 삭제
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </ImageBackground>
        </TouchableOpacity>
  
        {/* 수첩 제목과 생성일 */}
        <View style={{justifyContent: "center", marginTop: 10, alignItems: 'center'}}>
          <Text style={{bottom: 0, color: 'black', fontSize: 30, fontWeight: 'bold'}}>{item.caption}</Text>
          <Text style={{bottom: 0, color: 'black', fontSize: 30}}>{moment(item.creation).format("YYYY-MM-D")}</Text>
        </View>
      </Card>
    );
  }
  
  if (Notelist.length == 0) {
    // 수첩 목록이 비어있을 때의 화면
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', top: 150}}>
        <Text>수첩을 추가해주세요!</Text>
        {/*수첩 버튼 */}
        <Image
          source={require("../../assets/notebutton.png")}
          style={{
            marginTop: 70,
            top: 180,
            width: 335,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderRadius: 20,
            left: 10,
            right: 60,
            borderColor: '#9AC4F8',
            bottom: 0,
            right: 0,
            marginRight: 10,
          }}
        />
        <TouchableOpacity onPress={() => navigation.navigate('CreateNote', RefreshNote)} style={{
          alignSelf: 'center',
          position: 'relative',
          bottom: 160,
          top: 20,
          left: 10,
          right: 0,
          flexDirection: 'row',
          marginRight: 10,
        }}>
          <Image source={require("../../assets/plus3Dg.png")} style={{height: 120, width: 120}} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    );
  } else {
    // 수첩 목록이 있을 때의 화면
    return (
      <MenuProvider skipInstanceCheck>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View style={{justifyContent: 'center', alignItems: 'flex-end', marginRight: 10}}>
            {/* Carousel 컴포넌트 */}
            <Carousel
              style={{
                width: 350,
                height: 520,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                left: 15,
              }}
              width={340}
              height={420}
              pagingEnabled={pagingEnabled}
              snapEnabled={snapEnabled}
              autoPlay={autoPlay}
              autoPlayInterval={1500}
              loop={false}
              data={Notelist}
              modeConfig={{
                snapDirection,
                stackInterval: mode === "horizontal-stack" ? 8 : 18,
              }}
              customConfig={() => ({type: "positive", viewCount})}
              renderItem={({item}) => NoteCard(item, navigation)}
            />
          </View>
           {/*수첩 버튼 */}
          <Image
            source={require("../../assets/notebutton.png")}
            style={{
              marginTop: 70,
              width: 335,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderRadius: 20,
              left: 25,
              right: 40,
              borderColor: '#9AC4F8',
              bottom: 0,
              right: 0,
              marginRight: 10,
            }}
          />
          <TouchableOpacity onPress={() => navigation.navigate('CreateNote', RefreshNote)} style={{
            alignSelf: 'center',
            position: 'relative',
            bottom: 160,
            left: 10,
            right: 0,
            flexDirection: 'row',
            marginRight: 10,
          }}>
            <Image source={require("../../assets/plus3Dg.png")} style={{height: 120, width: 120}} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </MenuProvider>
    );
  }

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


export default Note;