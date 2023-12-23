import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions
} from "react-native";
import {
  Button,
  Avatar,
  TextInput,
  IconButton,
} from "react-native-paper";
import styles from "./styles";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "../../firebase";
import { getStorage, ref, getDownloadURL, uploadBytes, } from 'firebase/storage';
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const EditProfile = (props) => {
  const { user } = props.route.params;
  const { navigation } = props;

  // 사용자 정보 상태값 설정
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [bio, setBio] = useState(user?.introduce);
  const [image, setImage] = useState(user?.profilePicUrl);
  const [backImage, setbackImage] = useState(user?.backPicUrl);
  const [imageUrl, setImageUrl] = useState(null);
  const [backimageUrl, setbackimageUrl] = useState(null);
  const [userName, setUserName] = useState(user?.userName);

  // 갤러리 권한 상태값 설정
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  // 로딩 상태값 설정
  const [loading, setloading] = useState(false);

  // 사용자 데이터 업데이트 함수
  const setUserData = async (userId, data) => {
    await firebase.firestore().collection("users").doc(userId).update(data);
  };

  // 프로필 업데이트 함수
  const updateProfile = async () => {
    if (name == "") {
      Alert.alert("이름을 입력해주세요");
      return;
    } else if (email == "") {
      Alert.alert("이메일을 입력해주세요");
      return;
    } else {
      setloading(true);
      let imageset = null;
      let backimageset = null;

      // 프로필 이미지 업로드
      if (imageUrl != null) {
        const storage = getStorage();
        const childPath = `${user.id + Math.random().toString(36) + "dp"}`;
        const fileRef = ref(storage, childPath);
        const responce = await fetch(image);
        const blob = await responce.blob();
        
        await uploadBytes(fileRef, blob, {
          contentType: 'image/jpeg',
        });
        imageset = await getDownloadURL(fileRef);
      }

      // 배경 이미지 업로드
      if (backimageUrl != null) {
        const backchildPath = `${user.id + Math.random().toString(36) + "dp"}`;
        const backfileRef = ref(storage, backchildPath);
        const backresponce = await fetch(backImage);
        const backblob = await backresponce.blob();
        await uploadBytes(backfileRef, backblob, {
          contentType: 'image/jpeg',
        });
        backimageset = await getDownloadURL(backfileRef);
      }

      // 사용자 데이터 업데이트
      var userData = {
        name: name,
        email: email,
        introduce: bio,
        userName: userName ? (userName.length > 0 ? userName : null) : null,
        profilePicUrl: imageset ? imageset : image,
        backPicUrl: backimageset ? backimageset : backImage,
      };
      setUserData(user.id, userData);
      navigation.goBack();
    }
  };

  useEffect(() => {
    (async () => {
      // 갤러리 권한 요청
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  // 이미지 선택 함수
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 이미지만 선택 가능
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  // 배경 이미지 선택 함수
  const pickbackImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 이미지만 선택 가능
      allowsEditing: true,
      aspect: [5, 2],
      quality: 0.1,
    });

    if (!result.canceled) {
      uploadbackImage(result.assets[0].uri);
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (puri) => {
    setImage(puri);
    setImageUrl(puri);
  };

  // 배경 이미지 업로드 함수
  const uploadbackImage = async (buri) => {
    setbackImage(buri);
    setbackimageUrl(buri);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* 배경 이미지 */}
        <TouchableOpacity onPress={pickbackImage}>
          <ImageBackground
            style={{width: useWindowDimensions('window').width, height: useWindowDimensions('window').height * 0.26, flexDirection: 'row'}}
            rasizMode="Cover"
            source={
              backImage
                ? { uri: backImage }
                : require("../../assets/wall.jpg")
            }>
            {/* 상단 영역 */}
            <View style={{ height: useWindowDimensions('window').height * 0.12, width: useWindowDimensions('window').width * 0.7 }}>
              <View style={{ height: useWindowDimensions('window').height * 0.18 }}>
                {/* 내용 */}
              </View>
              <View style={{ height: useWindowDimensions('window').height * 0.20, backgroundColor: '#fff', borderTopWidth: 2 }}>
                {/* 내용 */}
              </View>
            </View>
            {/* 프로필 이미지 */}
            <TouchableOpacity onPress={pickImage}>
              <View style={{width: useWindowDimensions('window').width * 0.26, height: useWindowDimensions('window').height * 0.3, marginTop: 85, borderTopEndRadius: 92, borderTopStartRadius: 92, backgroundColor: '#fff'}}>
                <View style={styles.userRaw}>
                  <Avatar.Image
                    size={100}
                    source={
                      image
                        ? { uri: image }
                        : require("../../assets/defaultProfilePic.png")
                    }
                  />
                  <IconButton
                    icon="pencil"
                    animated={true}
                    style={styles.iconButton}
                    size={22}
                  />
                </View>
              </View>
            </TouchableOpacity>
            {/* 오른쪽 영역 */}
            <View style={{ width: useWindowDimensions('window').width * 0.1 }}>
              <View style={{ height:useWindowDimensions('window').height * 0.18 }}>
                {/* 내용 */}
              </View>
              <View style={{ height:useWindowDimensions('window').height * 0.18, borderTopWidth: 2, backgroundColor: '#fff' }}>
                {/* 내용 */}
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <View style={{ paddingHorizontal: 20 }}>
          {/* 이름 입력란 */}
          <TextInput
            label="이름"
            mode="outlined"
            type="이름"
            keyboardType="default"
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
            style={styles.input}
          />
          {/* 사용자 이름 입력란 */}
          <TextInput
            label="사용자 이름"
            value={userName}
            onChangeText={(text) => setUserName(text)}
            type="사용자 이름"
            keyboardType="default"
            style={styles.input}
            mode="outlined"
          />
          {/* 이메일 입력란 */}
          <TextInput
            label="이메일"
            value={email}
            onChangeText={(text) => setEmail(text)}
            type="이메일"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
          />
          {/* 소개 입력란 */}
          <TextInput
            label="소개"
            value={bio}
            multiline={true}
            onChangeText={(text) => setBio(text)}
            type="소개"
            keyboardType="default"
            style={styles.input}
            mode="outlined"
          />
          {/* 완료 버튼 */}
          <Button mode="contained" style={styles.button} onPress={updateProfile}>
            완료
          </Button>
          {/* 로딩 표시 */}
          {loading && <ActivityIndicator style={{height: 230, marginLeft: 10, bottom: 520}} size="large" color="#000000"/>}
        </View>
      </View>
    </ScrollView>
  );
  
};

export default EditProfile;
