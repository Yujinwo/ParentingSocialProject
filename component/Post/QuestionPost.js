import { StyleSheet, Text,View,KeyboardAvoidingView,ScrollView,Image,Modal,TouchableOpacity,ActivityIndicator} from 'react-native';
import { useState,useEffect } from 'react';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';
import {TextInput } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { firebase } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, getDownloadURL, uploadBytes, } from 'firebase/storage';
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
// 제목 입력 필드 컴포넌트입니다. 
const TitleInput = (props) => {
  return (
    <TextInput
      maxLength={20}
      keyboardType="email-address"
      style={styles.titleinput}
      placeholder='제목을 입력해주세요(최대 20자)'
      label='제목'
      type='제목'
      onChangeText={text => props.Settitletext(text)}
      value={props.titletext}
      mode="flat"
    />
  )
}
// 내용 입력 필드 컴포넌트입니다. 
const ContentInput = (props) => {
  return (
    <AutoGrowingTextInput 
      scrollEnabled={false}
      style={styles.Contentinput}
      onChangeText={text => props.Setcontenttext(text)}
      value={props.contenttext}
      placeholder="내용을 입력해주세요"
      multiline
    />
  )
}
// 하단의 푸터 컴포넌트입니다. 
const Footer = (props) => {
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.footer}>
      <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
        <Ionicons name="image-outline" size={35} style={{color:'#9AC4F8'}} onPress={() => props.pickImage()}/>
        <Ionicons name="camera-outline" size={35} style={{color:'#9AC4F8'}} onPress={() => props.cameraImage()}/>
      </View>
    </KeyboardAvoidingView>
  )
}
// 글 작성 화면의 헤더 컴포넌트입니다. 
const ModHeader = (props) => {
  return (
    <View style={{marginTop:30,backgroundColor:'pink',height:90,bottom:30}}>
      <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:40,alignItems:'center'}}>
        <Ionicons name="close-outline" size={40} style={{color:'#9AC4F8'}} onPress={() => {
          if(props.contenttext != null || props.titletext != null || props.image != null) {
            props.setVisible(true)
          } else {
            props.navigation.goBack()
          }
        }} />
        <Text style={{fontSize:20,color:'black'}}>질문글 작성</Text>
        <Ionicons name="checkmark-outline" size={40} style={{color:'#9AC4F8'}} onPress={() => {
          if(props.contenttext == null || props.titletext == null) {
            alert('제목 및 내용을 입력해주세요')
          } else {
            props.Save()
          }
        }}/>
      </View>
    </View>
  )
}


export default function QuestionPost( {navigation,props,route } ) { 

    const [titletext, Settitletext] = useState(null);
    const [contenttext, Setcontenttext] = useState(null);
    const [image, setImage] = useState(null);
    const [visible, setVisible] = useState(false);
    const [loading, setloading] = useState(false);


    const cameraImage = async () => {
      // 카메라 권한 요청
      await ImagePicker.requestCameraPermissionsAsync();
    
      // 카메라 실행 및 이미지 가져오기
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0,
      });
    
      // 이미지가 선택되었을 경우 이미지 업로드
      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    };
    
    const pickImage = async () => {
      // 미디어 라이브러리 접근 권한 요청
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    
      // 이미지 라이브러리 실행 및 이미지 선택
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0,
      });
    
      // 이미지가 선택되었을 경우 이미지 업로드
      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    };

    const uploadImage = async (puri) => {
      // 이미지 업로드
      setImage(puri);
    };
    
    
    const Save = async () => {
      setloading(true);
      let imageset = "";
    
      if (image != null) {
        // 이미지 업로드를 위한 경로 설정
        const childPath = `${firebase.auth().currentUser.uid + Math.random().toString(36) + "qp"}`;
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
      firebase.firestore()
        .collection("Qposts")
        .doc()
        .set({
          qpostId: Math.random().toString(36) + "qps",
          userId: firebase.auth().currentUser.uid,
          postBy: firebase.firestore().doc("/users/" + firebase.auth().currentUser.uid),
          likes: 0,
          shares: 0,
          views: 0,
          comments: 0,
          downloadURL: imageset,
          caption: titletext,
          content: contenttext,
          creation: firebase.firestore.Timestamp.now(),
        })
        .then(function () {
            // 질문글 목록 화면 새로고침
            route.params();
            // 이전 화면으로 돌아가기
            navigation.goBack();
         
        });
    };
    // 취소 팝업
    const cancelPopup = () => {
      setVisible(false);
      
    };
    // 확인 팝업
    const ConfirmPopup = () => {
      setVisible(false);
      navigation.goBack();
      
    }; 
    

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* 글 작성 헤더 */}
        <ModHeader
          navigation={navigation}
          Save={Save}
          titletext={titletext}
          contenttext={contenttext}
          image={image}
          setVisible={setVisible}
        ></ModHeader>
    
        {/* 작성 취소 팝업 모달 */}
        <Modal visible={visible} animationType="fade" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {/* 팝업 제목 */}
              <Text style={styles.modalTitle}>작성을 취소하시겠습니까?</Text>
              {/* 팝업 메시지 */}
              <Text style={styles.modalMessage}>작성한 내용은 유지되지 않습니다</Text>
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
    
        <ScrollView>
          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            {/* 제목 입력 컴포넌트 */}
            <TitleInput titletext={titletext} Settitletext={Settitletext} />
    
            {/* 내용 입력 컴포넌트 */}
            <ContentInput contenttext={contenttext} Setcontenttext={Setcontenttext} />
    
            {/* 이미지 미리보기 */}
            <Image
              style={{ width: 300, height: 150 }}
              source={image ? { uri: image } : require('../../assets/white.png')}
            />
          </View>
        </ScrollView>
    
        {/* 로딩 중인 경우 로딩 표시 */}
        {loading && <ActivityIndicator style={{ height: 40, marginLeft: 10 }} size="large" color="#000000" />}
    
        {/* 하단 푸터 */}
        <Footer pickImage={pickImage} cameraImage={cameraImage} />
      </View>
    );
    
    
}
const styles = StyleSheet.create({
    titleinput: {
      
     
      height:60,
      width:320,
      backgroundColor:'white'
    },
    Contentinput: {
     
      marginTop: 10,
      width:320,
     
      marginBottom:20,
      backgroundColor:'white'
    },
    footer: {

  
      backgroundColor: 'gray',
      borderTopWidth: 1,
      borderTopColor: '#ccc',
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