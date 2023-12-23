import { StyleSheet, View, TouchableOpacity, Image, Keyboard, Text, Modal, ActivityIndicator } from 'react-native';
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

// LogBox에서 모든 로그를 무시하도록 설정합니다.
LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Modal Header 컴포넌트
const ModHeader = (props) => {
  return (
    <View style={{ marginTop: 30, backgroundColor: 'pink', height: 90, bottom: 30, width: 400 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40, alignItems: 'center' }}>
        <Ionicons name="close-outline" size={40} style={{ color: '#9AC4F8' }} onPress={() => {
          // 제목, 공개범위, 이미지 중 하나라도 존재하는 경우 모달을 표시하고 그렇지 않으면 뒤로 가기 동작을 수행합니다.
          if (props.titletext != null || props.holder != null || props.image != null) {
            props.setVisible(true);
          } else {
            props.navigation.goBack();
          }
        }}/>
        <Text style={{ fontSize: 20, color: 'black' }}>폴더 수정</Text>
        <Ionicons name="checkmark-outline" size={40} style={{ color: '#9AC4F8' }} onPress={() => {
          // 제목 및 공개범위가 설정되지 않은 경우 경고 메시지를 표시하고, 그렇지 않으면 저장 동작을 수행합니다.
          if (props.holder == null || props.titletext == null) {
            alert('제목 및 공개범위를 설정해주세요');
          } else {
            props.Save();
          }
        }}/>
      </View>
    </View>
  );
};

// EditFolder 컴포넌트
export default function EditFolder({ navigation, route }) {
  const [titletext, Settitletext] = useState(route.params.item.caption); // 제목 텍스트 상태 변수
  const [visible, setVisible] = useState(false); // 모달 표시 여부 상태 변수
  const [visible2, setVisible2] = useState(false); // 모달 표시 여부 상태 변수
  const placeholder = {
    label: '공개 범위를 선택하세요',
    value: null,
    color: '#9EA0A4',
  };
  const [loading, setloading] = useState(false); // 로딩 상태 변수
  const [image, setImage] = useState(route.params.item.downloadURL); // 이미지 URL 상태 변수
  const [holder, setholder] = useState(route.params.item.placeholder); // 공개 범위 상태 변수
  
  const myid = firebase.auth().currentUser.uid
  // 카메라 촬영
  const cameraImage = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });
    setVisible2(false)
    if (!result.canceled) {
      
      uploadImage(result.assets[0].uri);
      
    }
  
    
    };
  // 이미지 선택
  const pickImage = async () => {
    // 이미지 선택기를 엽니다.
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    setVisible2(false)
    // 이미지 선택이 완료되었을 때
    if (!result.canceled) {
      
      // 선택한 이미지를 상태 변수에 설정합니다.
      setImage(result.assets[0].uri);
     
    }
    
  };
  const uploadImage = async (puri) => {
    setImage(puri)
  };

  // 저장 동작
  const Save = async () => {
    setloading(true)
    let imageset = ""
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
    const snapshot = await firebase.firestore().collection("Folders")
      .where('folderId', '==', route.params.item.folderId)
      .get();
    const docid = snapshot.docs[0].id;
    await firebase.firestore().collection("Folders")
      .doc(docid)
      .update({
        downloadURL: imageset,
        placeholder: holder,
        caption: titletext,
  
      })
      .then(function () {
        route.params.FolderRefresh()
        navigation.goBack()
      });
  }
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
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    {/* 작성 취소 팝업 모달 */}
    <Modal visible={visible} animationType="fade" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {/* 팝업 제목 */}
              <Text style={styles.modalTitle}>작성을 취소하시겠습니까?</Text>
              {/* 팝업 메시지 */}
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
        
        {/* 사진 선택 팝업 모달 */}
        <Modal visible={visible2} animationType="fade" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {/* 팝업 제목 */}
              <Text style={styles.modalTitle}>사진 촬영 및 선택을 해주세요</Text>
              <View style={styles.buttonsContainer}>
                {/* 촬영 버튼 */}
                <TouchableOpacity style={styles.buttonCancel} onPress={cameraPopup}>
                  <Text style={styles.buttonText}>촬영</Text>
                </TouchableOpacity>
                {/* 선택 버튼 */}
                <TouchableOpacity style={styles.buttonConfirm} onPress={pickerPopup}>
                  <Text style={styles.buttonText}>선택</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    <ModHeader navigation={navigation} Save={Save} titletext={titletext} image={image} holder={holder} setVisible={setVisible}></ModHeader>
    <KeyboardAwareScrollView
      resetScrollToCoords={{ x: 30, y: 0 }}
      contentContainerStyle={styles.authContainer}
      scrollEnabled={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
      <View style={styles.inputIOS}>
        <RNPickerSelect
          onValueChange={(value) => setholder(value)}
          value={holder}
          items={[
            { label: '전체 공개', value: 'all' },
            { label: '친구만', value: 'friend' },
            { label: '나만 보기', value: 'me' },
          ]}
          useNativeAndroidPickerStyle={false}
          placeholder={placeholder}
        />
      </View>
      <TouchableOpacity onPress={() => setVisible2(true)}>
          {/* 카메라 이미지 */}
        <Image
          style={{width:220,justifyContent:'center',marginLeft:50,top:50,height:200}}
          source={
            image
              ? { uri: image }
              : require("../../assets/camera.png")
          }
        />
      </TouchableOpacity>
    </KeyboardAwareScrollView>
      {/* 로딩 중인 경우, 로딩 스피너 표시 */}
    {loading && <ActivityIndicator style={{height:140,marginLeft:10,bottom:365}} size="large" color="#000000"/>}
  </View>
  );
}
const styles = StyleSheet.create({
    titleinput: {
      marginTop: 10,
      height:50,
      width:320,
    
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