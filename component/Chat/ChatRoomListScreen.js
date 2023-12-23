import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { firebase } from '../../firebase';

const ChatRoomListScreen = ({ navigation, route }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    // ChatRooms를 구독(subscribe)하기 위해 unsubscribe 함수를 생성합니다.
    const unsubscribe = subscribeToChatRooms();
    
    // 컴포넌트가 언마운트될 때 unsubscribe 함수를 호출하여 구독을 취소합니다.
    return () => unsubscribe();
  }, []);
  
  // ChatRooms를 구독하는 함수입니다.
  const subscribeToChatRooms = () => {
    // Firestore의 'chatRooms' 컬렉션을 쿼리합니다. 타임스탬프를 기준으로 정렬합니다.
    const q = query(collection(getFirestore(), 'chatRooms'), orderBy('timestamp'));
  
    return onSnapshot(
      q,
      (snapshot) => {
        // 스냅샷을 이용하여 업데이트된 ChatRooms를 가져옵니다.
        const updatedChatRooms = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((chatRoom) => hasConversation(chatRoom)); // 대화가 있는 채팅방만 필터링합니다.
  
        // 가져온 ChatRooms를 설정합니다.
        setChatRooms(updatedChatRooms);
      },
      (error) => {
        console.error('채팅방 가져오기 에러:', error);
      }
    );
  };
  
  const hasConversation = async (chatRoom) => {
    // 'messages/{chatRoom.id}/chats' 경로에 대한 Firestore 쿼리를 생성합니다.
    const q = query(
      collection(getFirestore(), 'messages', chatRoom.id, 'chats'),
      orderBy('timestamp', 'desc'),
      
    );
  
    // 쿼리를 실행하여 가장 최근의 채팅 메시지를 가져옵니다.
    const querySnapshot = await getDocs(q);
  
    // 채팅 메시지가 존재하는지 여부를 반환합니다.
    return !querySnapshot.empty;
  };
  
  const createChatRoom = async (roomName) => {
    // 입력된 방 이름이 공백이면 함수를 종료합니다.
    if (roomName.trim() === '') {
      return;
    }
  
    try {
      // 'chatRooms' 컬렉션에 새로운 문서를 추가합니다.
      const docRef = await addDoc(collection(getFirestore(), 'chatRooms'), {
        name: roomName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  
      // 생성된 채팅방의 정보를 객체로 저장합니다.
      const newChatRoom = {
        id: docRef.id,
        name: roomName,
      };
  
    } catch (error) {
      console.error('채팅방 생성 에러:', error);
    }
  };
  
  const handleChatRoomPress = (chatRoom) => {
    // 'ChatScreen' 화면으로 이동하고 선택된 채팅방 정보를 전달합니다.
    navigation.navigate('ChatScreen', { chatRoom });
  };
  
  useEffect(() => {
    // 라우트 매개변수(route.params)와 userName이 존재할 경우에만 실행됩니다.
    if (route.params && route.params.userName) {
      // 채팅방을 생성하는 함수를 호출합니다.
      createChatRoom(route.params.userName);
    }
  }, [route.params]);
  
  const renderChatRoom = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.chatRoomCard}
      onPress={() => handleChatRoomPress(item)}
    >
      <Text style={styles.chatRoomName}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderChatRoom}
        contentContainerStyle={styles.chatRoomList}
      />
    </View>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    height: 80,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  headerText: {
    fontSize: 20,
    top: 20,
    fontWeight: 'bold',
  },
  chatRoomList: {
    padding: 16,
  },
  chatRoomCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatRoomName: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 16,
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
  },
});

export default ChatRoomListScreen;
