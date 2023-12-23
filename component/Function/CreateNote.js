import { StyleSheet, View, TouchableOpacity, Image, Keyboard, Text, Modal, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { TextInput } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// 컴포넌트 시작: ModHeader
const ModHeader = (props) => {
  return (
    // 헤더 컴포넌트를 구성하는 View
    <View style={{
      marginTop: 30,
      backgroundColor: 'pink',
      height: 90,
      bottom: 30,
      width: 400
    }}>
      {/* 헤더 내부에 있는 아이콘과 텍스트 */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 40,
        alignItems: 'center'
      }}>
        {/* 닫기 아이콘 */}
        <Ionicons
          name="close-outline"
          size={40}
          style={{ color: '#9AC4F8' }}
          onPress={() => {
            {/* 제목과 이미지가 입력되었는지 확인 후 모달 표시 */}
            if (props.titletext != null || props.image != null) {
              props.setVisible(true);
            } else {
              {/* 아무 내용도 입력되지 않았을 때, 이전 화면으로 이동 */}
              props.navigation.goBack();
            }
          }}
        />
        <Text style={{ fontSize: 20, color: 'black' }}>수첩 추가</Text>
        {/* 확인 아이콘 */}
        <Ionicons
          name="checkmark-outline"
          size={40}
          style={{ color: '#9AC4F8' }}
          onPress={() => {
             {/*  제목이 입력되었는지 확인 후 저장 기능 호출*/}
            if (props.titletext == null) {
              alert('제목을 입력해주세요');
            } else {
              props.Save();
            }
          }}
        />
      </View>
    </View>
  )
}
// 컴포넌트 종료: ModHeader

export default function CreateNote({ navigation, route }) {
  // useState를 사용하여 상태값 설정
  const [titletext, Settitletext] = useState(null);
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [loading, setloading] = useState(false);
  const [image, setImage] = useState(null);
  const myid = firebase.auth().currentUser.uid;

  // 카메라 이미지 촬영 함수
  const cameraImage = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });
    setVisible2(false);
    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  // 갤러리에서 이미지 선택 함수
  const pickImage = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });
    setVisible2(false);
    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (puri) => {
    setImage(puri);
  };

  // 저장 함수
  const Save = async () => {
    setloading(true);
    let imageset = "";

    if (image != null) {
      // 이미지 업로드를 위한 경로 설정
      const childPath = `${firebase.auth().currentUser.uid + Math.random().toString(36) + "dp"}`;
      const storage = getStorage();
      const fileRef = ref(storage, childPath);
  
      // 이미지를 가져와서 Blob 형태로 변환
      const responce = await fetch(image);
      const blob = await responce.blob();
  
      // Blob 형태의 이미지 업로드
      const response = await uploadBytes(fileRef, blob, {
        contentType: 'image/jpeg',
      });
  
      // 업로드된 이미지의 다운로드 URL 가져오기
      imageset = await getDownloadURL(fileRef);
    } else {
      imageset = null;
    }

    // Firestore에 데이터 저장
    await firebase.firestore().collection("Notes").doc().set({
      NoteId: Math.random().toString(36) + "nt",
      userId: myid,
      postBy: firebase.firestore().doc("/users/" + myid),
      downloadURL: imageset,
      caption: titletext,
      creation: firebase.firestore.Timestamp.now(),
    })
      .then(function () {
        // 데이터 저장 후 이전 화면으로 이동
        route.params();
        navigation.goBack();
      });
  };

  // 모달 취소 팝업 함수
  const cancelPopup = () => {
    setVisible(false);
  };

  // 모달 확인 팝업 함수
  const ConfirmPopup = () => {
    setVisible(false);
    navigation.goBack();
  };

  // 이미지 선택 모달 팝업 함수
  const pickerPopup = () => {
    pickImage();
  };

  // 이미지 촬영 모달 팝업 함수
  const cameraPopup = () => {
    cameraImage();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* 모달 컴포넌트 */}
      <Modal visible={visible} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>작성을 취소하시겠습니까?</Text>
            <Text style={styles.modalMessage}>작성한 내용은 유지 되지 않습니다</Text>
            <View style={styles.buttonsContainer}>
              {/* 취소 버튼 */}
              <TouchableOpacity style={styles.buttonCancel} onPress={cancelPopup}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              {/* 확인 버튼 */}
              <TouchableOpacity style={styles.buttonConfirm} onPress={ConfirmPopup}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 이미지 선택 모달 */}
   
      <Modal visible={visible2} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>사진 촬영 및 선택을 해주세요</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={cameraPopup}>
                <Text style={styles.buttonText}>촬영</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonConfirm} onPress={pickerPopup}>
                <Text style={styles.buttonText}>선택</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
   
      {/* 헤더 컴포넌트 */}
      <ModHeader titletext={titletext} image={image} setVisible={setVisible} Save={Save} navigation={navigation} />
      <KeyboardAwareScrollView  
        resetScrollToCoords={{ x: 30, y: 0 }}
        contentContainerStyle={styles.authContainer}
        scrollEnabled={true}>
        {/* 키보드 영역 외 터치 시 키보드 닫힘 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        
           {/* 제목 입력란 */}
           <TextInput
           keyboardType="email-address"
           style={styles.titleinput}
           label='제목'
           type='제목'
           onChangeText={(text) => Settitletext(text)}
           value={titletext}
           mode="outlined"
          />
          </TouchableWithoutFeedback>

     
            {/* 이미지 선택 버튼 */}
            <TouchableOpacity onPress={() => setVisible2(true)}>
              {image ? (
                // 선택한 이미지가 있는 경우
                <Image source={{ uri: image }} style={styles.imag2e} />
              ) : (
                // 선택한 이미지가 없는 경우
                <Image source={require('../../assets/camera.png')} style={styles.imag2e} />
              )}
            </TouchableOpacity>
     
         
          {/* 로딩 중일 때 화면에 표시되는 컴포넌트 */}
          {loading && (
            <View style={{height: 180, marginLeft: 10, bottom: 170 }}>
              <ActivityIndicator size="large" color="#000000" />
            </View>
          )}

      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    titleinput: {
      marginTop: 10,
      height:50,
      width:320,
    },
    imag2e: {
      width: 220, 
      justifyContent: 'center', 
      marginLeft: 50, 
      top: 50, 
      height: 200

    },
    Contentinput: {
      marginTop: 10,
      width:320,
      height: 150,

      marginBottom:100
      
    },
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