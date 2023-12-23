import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, Text, KeyboardAvoidingView, Alert, Image, Modal } from 'react-native';
import { firebase } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, getDownloadURL, uploadBytes, } from 'firebase/storage';
const { width, height } = Dimensions.get('window');


export default function ChatListScreen({ navigation, route }) {
  const { chatRoom } = route.params; // 라우트 매개변수에서 chatRoom을 가져옵니다.
  const [selectedRoom, setSelectedRoom] = useState(chatRoom.id); // 선택된 채팅방 ID를 저장하는 상태 변수입니다.
  const [message, setMessage] = useState(''); // 입력된 메시지를 저장하는 상태 변수입니다.
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록을 저장하는 상태 변수입니다.
  const [image, setImage] = useState(null); // 선택된 이미지를 저장하는 상태 변수입니다.
  const [modalVisible, setModalVisible] = useState(false); // 모달 창의 가시성을 제어하는 상태 변수입니다.
  const [selectedImage, setSelectedImage] = useState(''); // 선택된 이미지의 URL을 저장하는 상태 변수입니다.
  
  // 선택된 채팅방이 변경될 때마다 해당 채팅방의 메시지 목록을 가져와 업데이트합니다.
  useEffect(() => {
    if (selectedRoom) {
      const unsubscribe = firebase
        .firestore()
        .collection('messages')
        .doc(selectedRoom)
        .collection('chats')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          const messageList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setMessages(messageList);
        });
  
      return () => unsubscribe();
    }
  }, [selectedRoom]);
  
  // 메시지를 전송하는 함수입니다.
  const handleSend = async () => {
    if (message || image) {
      try {
        const newMessage = {
          text: message,
          timestamp: firebase.firestore.Timestamp.now(),
          sender: width,
          image: null
        };
  
        if (image) {
          const response = await fetch(image);
          const blob = await response.blob();
          const imageName = `${Date.now()}.jpg`;
  
          // 선택된 이미지를 Firebase 스토리지에 업로드합니다.
          await firebase.storage().ref().child(`images/${imageName}`).put(blob);
          const imageUrl = await firebase.storage().ref(`images/${imageName}`).getDownloadURL();
  
          newMessage.image = imageUrl;
        }
  
        // 새로운 메시지를 해당 채팅방의 서브컬렉션에 추가합니다.
        await firebase.firestore().collection('messages').doc(selectedRoom).collection('chats').add(newMessage);
  
        setMessage('');
        setImage(null);
      } catch (error) {
        console.log('메시지 전송 에러: ', error);
      }
    }
  };
  
  // 채팅방 삭제를 처리하는 함수입니다.
  const handleDeleteChatRoom = () => {
    Alert.alert(
      '채팅방 삭제',
      '정말로 채팅방을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 해당 채팅방을 Firebase Firestore에서 삭제합니다.
              await firebase.firestore().collection('chatRooms').doc(selectedRoom).delete();
              navigation.goBack();
            } catch (error) {
              console.log('채팅방 삭제 에러: ', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  // 이미지 선택을 처리하는 함수입니다.
  const handleChooseImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        console.log('카메라 롤 접근 권한이 거부되었습니다.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!pickerResult.canceled) {
        const storage = getStorage();
        const childPath = `${Math.random().toString(36) + "dp"}`;
        const fileRef = ref(storage, childPath);
        const response = await fetch(pickerResult.assets[0].uri);
        const blob = await response.blob();
  
        // 선택된 이미지를 Firebase 스토리지에 업로드합니다.
        await uploadBytes(fileRef, blob, {
          contentType: 'image/jpeg',
        });
        const imageUrl = await getDownloadURL(fileRef);
        const newMessage = {
          text: '',
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          sender: width,
          image: imageUrl
        };
  
        // 새로운 메시지를 해당 채팅방의 서브컬렉션에 추가합니다.
        await firebase.firestore().collection('messages').doc(selectedRoom).collection('chats').add(newMessage);
        setMessage('');
      }
    } catch (error) {
      console.log('사진 선택 에러: ', error);
    }
  };
  
  // 채팅 메시지를 렌더링하는 함수입니다.
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender == width;
    const messageTime = item.timestamp ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
    const handleImagePress = () => {
      setSelectedImage(item.image);
      setModalVisible(true);
    };
  
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        {item.image && (
          <TouchableOpacity onPress={handleImagePress}>
            <Image source={{ uri: item.image }} style={styles.messageImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{messageTime}</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>{chatRoom.name}</Text>
        <TouchableOpacity onPress={handleDeleteChatRoom}>
          <Ionicons name="trash" size={24} color="#000" style={styles.deleteButton} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.contentContainer}>
        <FlatList data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id.toString()} />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요."
            value={message}
            onChangeText={(text) => setMessage(text)}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleChooseImage}>
            <Text style={styles.sendButtonText}>사진 전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalContainer} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    height: height * 0.1,
  },
  backButton: {
    top: 13,
    marginRight: 8,
    color: '#000',
  },
  title: {
    top: 13,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    top: 13,
    marginLeft: 'auto',
  },
  contentContainer: {
    top: 10,
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingBottom: height * 0.02,
  },
  messageContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    color: '#fff',
  },
  messageText: {
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
  },
  messageTime: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    bottom: 10,
    marginLeft: 10,
    color: '#000',
    fontSize: 20,
    marginTop: 15,
  },
  sendButton: {
    bottom: 10,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '90%',
  },
});
