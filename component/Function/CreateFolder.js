import { StyleSheet, View, TouchableOpacity, Image, Keyboard, Text, Modal, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { TextInput } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RNPickerSelect from 'react-native-picker-select';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { LogBox } from "react-native";

// LogBox에 표시되는 모든 로그 무시
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// 헤더 컴포넌트
const ModHeader = (props) => {
  return (
    <View style={{ marginTop: 30, backgroundColor: 'pink', width: useWindowDimensions('window').width, height: useWindowDimensions('window').height * 0.1, bottom: 30 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40, alignItems: 'center' }}>
        {/* 닫기 아이콘 */}
        <Ionicons name="close-outline" size={40} style={{ color: '#9AC4F8' }} onPress={() => {
          if (props.titletext != null || props.holder != null || props.image != null) {
            props.setVisible(true)
          } else {
            props.navigation.goBack()
          }
        }} />

        <Text style={{ fontSize: 20, color: 'black' }}>폴더 추가</Text>

        {/* 확인 아이콘 */}
        <Ionicons name="checkmark-outline" size={40} style={{ color: '#9AC4F8' }} onPress={() => {
          if (props.holder == null || props.titletext == null) {
            alert('제목 및 공개범위를 설정해주세요')
          } else {
            props.Save()
          }
        }} />
      </View>
    </View>
  )
}

export default function CreateFolder({ navigation, route }) {

  const [titletext, Settitletext] = useState("");
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const placeholder = {
    label: '공개 범위를 선택하세요',
    value: null,
    color: '#9EA0A4',
  };

  const [image, setImage] = useState(null);
  const [holder, setholder] = useState(null);
  const [loading, setloading] = useState(false);
  const lodingheight = useWindowDimensions('window').image

  const myid = firebase.auth().currentUser.uid

  // 카메라로부터 이미지 가져오기
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

  // 갤러리로부터 이미지 선택하기
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

  // 이미지 업로드
  const uploadImage = async (puri) => {
    setImage(puri);
  };

  // 폴더 저장
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
    // Firestore에 글 데이터 저장
    await firebase.firestore().collection("Folders")
      .doc()
      .set({
        folderId: Math.random().toString(36) + "fd",
        userId: myid,
        postBy: firebase.firestore().doc("/users/" + myid),
        downloadURL: imageset,
        placeholder: holder,
        caption: titletext,
        creation: firebase.firestore.Timestamp.now(),
      })
      .then(function () {
        // 폴더 목록 화면 새로고침
        route.params();
        // 이전 화면 돌아가기
        navigation.goBack();
      });
  } 

  // 팝업 취소
  const cancelPopup = () => {
    setVisible(false);
  };

  // 팝업 확인
  const ConfirmPopup = () => {
    setVisible(false);
    navigation.goBack();
  };

  // 이미지 선택 팝업 표시
  const pickerPopup = () => {
    pickImage()
  };

  // 카메라 팝업 표시
  const cameraPopup = () => {
    cameraImage()
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
      {/* 취소 및 저장 헤더 */}
      <ModHeader navigation={navigation} Save={Save} titletext={titletext} image={image} holder={holder} setVisible={setVisible}></ModHeader>

      {/* 키보드 자동 스크롤 뷰 */}
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 30, y: 0 }}
        contentContainerStyle={styles.authContainer}
        scrollEnabled={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* 제목 입력란 */}
          <TextInput
            keyboardType="email-address"
            style={{    
              marginTop: 10,
              width: useWindowDimensions('window').width * 0.8, 
              height: useWindowDimensions('window').height * 0.05,
            }}
            label='제목'
            type='제목'
            onChangeText={(text) => Settitletext(text)}
            value={titletext}
            mode="outlined"
          />
        </TouchableWithoutFeedback>

        {/* 공개 범위 선택 */}
        <View style={{    
          marginTop: 20,
          marginBottom: 20,
          fontSize: 14,
          width: useWindowDimensions('window').width * 0.8,
          height: useWindowDimensions('window').height * 0.05,
          paddingVertical: 12,
          paddingHorizontal: 10,
          borderWidth: 1,
          justifyContent: 'center',
          borderColor: 'gray',
          borderRadius: 4,
          color: 'black',
          paddingRight: 30,
        }}>
          <RNPickerSelect
            onValueChange={(value) => setholder(value)}
            items={[
              { label: '전체 공개', value: 'all' },
              { label: '친구만', value: 'friend' },
              { label: '나만 보기', value: 'me' },
            ]}
            useNativeAndroidPickerStyle={true}
            placeholder={placeholder}
          />
        </View>

        {/* 이미지 선택 */}
        <TouchableOpacity onPress={() => { setVisible2(true) }}>
          <Image
            style={{  
              width: useWindowDimensions('window').width * 0.8,
              height: useWindowDimensions('window').height * 0.35, 
              justifyContent: 'center', 
              top: 50, 
            }}
            source={
              image
                ? { uri: image }
                : require("../../assets/camera.png")
            }
          />
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* 로딩 중 표시 */}
      {loading && <ActivityIndicator style={{ height:lodingheight , marginLeft: 10, bottom: 365 }} size="large" color="#000000" />}
    </View>
  );
}
const styles = StyleSheet.create({
  titleinput: {

  },
  Contentinput: {
    marginTop: 10,
    width: 320,
    height: 150,
    marginBottom: 100,
  },
  inputIOS: {

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
