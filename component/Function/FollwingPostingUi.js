import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  RefreshControl,ActivityIndicator,
  ScrollView
  } from 'react-native';
  import { useState,useEffect } from 'react';
  import * as React from 'react';
  import {Avatar } from "react-native-paper";
  import { Ionicons } from '@expo/vector-icons';
  import { firebase } from "../../firebase";
  import moment from 'moment';
  import { useFocusEffect } from '@react-navigation/native';
  import { LogBox } from "react-native";
  LogBox.ignoreAllLogs()
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);

  const ModHeader = (props) => {
    return (
      <View style={{ marginTop: 30, backgroundColor: 'white', height: 90, bottom: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, alignItems: 'center' }}>
          {/* 뒤로 가기 버튼 */}
          <TouchableOpacity onPress={() => {
            props.navigation.goBack();
          }}>
            <Ionicons name="chevron-back-outline" size={40} style={{ color: 'black' }} />
          </TouchableOpacity>
          {/* 게시판 제목 */}
          <Text style={{ fontSize: 20, color: 'black',right:20 }}>게시판</Text>
          <TouchableOpacity onPress={() => {
           
          }}>
    
           </TouchableOpacity>
        </View>
      </View>
    );
  };
  

const FollwingPostingUi = ({navigation,route}) => {

const [SpostState, setSpostState] = useState([]);
const [showComponent, setShowComponent] = React.useState(false);
const [likestate,setlikestate] = useState(false)
const [Scrapstate,setScrapstate] = useState(false)
const [refreshing, setRefreshing] = useState(false);
const [loading, setLoading] = useState(false);
const Sposid = route.params
const myid = firebase.auth().currentUser.uid
useEffect(() => {
  // 현재 사용자의 특정 게시물에 대한 좋아요 상태를 가져옵니다.
  fetchlike("", (likeState) => {
    setlikestate(likeState ? likeState.includes(Sposid) : false);
  });
  // 현재 사용자의 특정 게시물에 대한 스크랩 상태를 가져옵니다.
  fetchScrap("", (ScrapState) => {
    setScrapstate(ScrapState ? ScrapState.includes(Sposid) : false);
  });
}, []);

// 사용자의 스크랩 상태를 가져오는 함수
const fetchScrap = async (userId, callback) => {
  const id = myid;
  try {
    const snapshot = await firebase.firestore().collection("users")
      .doc(id)
      .get();
    callback(snapshot.data().Scrap);
  } catch (error) {
    // 에러 처리
  }
};

// 사용자의 좋아요 상태를 가져오는 함수
const fetchlike = async (userId, callback) => {
  const id = myid;
  try {
    const snapshot = await firebase.firestore().collection("users")
      .doc(id)
      .get();
    callback(snapshot.data().like);
  } catch (error) {
    callback(null);
  }
};


// 스크랩 버튼을 처리하는 함수
const Scrap = async () => {
  const id = myid;
  
  if (Scrapstate == false) {
    // 스크랩 상태가 false인 경우
    setScrapstate(true); // 스크랩 상태를 true로 변경
    await firebase.firestore().collection("users")
      .doc(id)
      .update({
        Scrap: firebase.firestore.FieldValue.arrayUnion(Sposid), // Sposid를 Scrap 배열에 추가
      })
      .catch((error) => {
        // 에러 처리
      });
  } else {
    // 스크랩 상태가 true인 경우
    setScrapstate(false); // 스크랩 상태를 false로 변경
    await firebase.firestore().collection("users")
      .doc(id)
      .update({
        Scrap: firebase.firestore.FieldValue.arrayRemove(Sposid), // Sposid를 Scrap 배열에서 제거
      })
      .catch((error) => {
        // 에러 처리
      });
  }
};
// 좋아요 버튼을 처리하는 함수
const like = async () => {
  const id = myid;
  
  if (likestate === false) {
    // 좋아요 상태가 false인 경우
    SpostState.likes += 1; // SpostState의 좋아요 수를 1 증가
    setlikestate(true); // 좋아요 상태를 true로 변경
  
    try {
      const snapshot = await firebase.firestore().collection("FolderPosts")
        .where('folderpostId', '==', Sposid)
        .get();
        
      const docid = snapshot.docs[0].id;
  
      await firebase.firestore().collection("FolderPosts")
        .doc(docid)
        .update({
          likes: firebase.firestore.FieldValue.increment(1), // 해당 포스트의 좋아요 수를 1 증가
        });
    } catch (error) {
      // 에러 처리
    }
  
    try {
      await firebase.firestore().collection("users")
        .doc(id)
        .update({
          like: firebase.firestore.FieldValue.arrayUnion(Sposid), // 사용자의 좋아요 배열에 Sposid를 추가
        });
    } catch (error) {
      // 에러 처리
    }
  } else {
    // 좋아요 상태가 true인 경우
    SpostState.likes -= 1; // SpostState의 좋아요 수를 1 감소
  
    setlikestate(false); // 좋아요 상태를 false로 변경
    try {
      const snapshot = await firebase.firestore().collection("FolderPosts")
        .where('folderpostId', '==', Sposid)
        .get();
        
      const docid = snapshot.docs[0].id;
  
      await firebase.firestore().collection("FolderPosts")
        .doc(docid)
        .update({
          likes: firebase.firestore.FieldValue.increment(-1), // 해당 포스트의 좋아요 수를 1 감소
        });
    } catch (error) {
      // 에러 처리
    }
  
    try {
      await firebase.firestore().collection("users")
        .doc(id)
        .update({
          like: firebase.firestore.FieldValue.arrayRemove(Sposid), // 사용자의 좋아요 배열에서 Sposid를 제거
        });
    } catch (error) {
      // 에러 처리
    }
  }
};

// 포커스 이벤트를 처리하는 useEffect
useFocusEffect(                   
  React.useCallback(() => {
    Spostrefresh(); // Spost 데이터를 새로고침
    setTimeout(() => {
      setShowComponent(true); // 1.2초 후에 컴포넌트를 보여줌
    }, 1200);
  }, [])
);

// 컴포넌트가 마운트될 때 한 번 실행되는 useEffect
useEffect(() => {
  Viewup(); // Viewup 함수를 호출하여 포스트의 조회수를 업데이트
}, []);

// 모든 새로고침을 처리하는 함수
const allRefresh = () => {
  setRefreshing(true);
  setTimeout(() => {
    Spostrefresh(); // Spost 데이터를 새로고침
    setRefreshing(false);
  }, 2500);
}

// 포스트 조회수를 업데이트하는 함수
const Viewup = async () => {
  let docid = 0;
  await firebase.firestore()
    .collection("FolderPosts")
    .where('folderpostId', '==', Sposid)
    .get()
    .then(async (snapshot) => {
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          docid = doc.id;
        })
      )
      .then(() => {
        firebase.firestore()
          .collection("FolderPosts")
          .doc(docid)
          .update({
            views: firebase.firestore.FieldValue.increment(1), // 조회수를 1 증가
          })
          .catch((error) => {
            // 에러 처리
          });
      })
    });
}

// 팔로우글 데이터를 새로고침하는 함수
const Spostrefresh = () => {
  fetchSpostPost("", (user) => {
    setSpostState(...user); // Spost 데이터를 업데이트
  });
}

// 팔로우글 데이터를 가져오는 함수
const fetchSpostPost = async (qpostId, callback) => {
  try {
    const arr = [];
    const snapshot = await firebase.firestore().collection("FolderPosts")
      .where('folderpostId', '==', Sposid)
      .get();

    if (snapshot.docs.length == 0) {
      alert('삭제된 게시물 입니다. 다시 시도해주세요');
      navigation.goBack(); // 게시물이 삭제된 경우 뒤로 이동
    } else {
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const allDataWithUser = await data.postBy.get();
          data.postBy = allDataWithUser.data();
          data.creation = data.creation.toDate(); // 파이어베이스 타임스탬프를 Date 객체로 변환
          arr.push(data);
        })
      );
      callback(arr); // 데이터를 콜백으로 전달
    }
  } catch (error) {
    alert('삭제된 게시물 입니다. 다시 시도해주세요');
    navigation.goBack(); // 게시물이 삭제된 경우 뒤로 이동
  }
};

const [visible, setVisible] = useState(false);

// 팝업을 취소하는 함수
const cancelPopup = () => {
  setVisible(false);
};

// 팝업 확인을 처리하는 함수
const ConfirmPopup = () => {
  setVisible(false);
  navigation.navigate('Home'); // 홈 화면으로 이동
};

const iconName = likestate ? 'thumbs-up' : 'thumbs-up-outline';
const iconName2 = Scrapstate ? 'bookmark' : 'bookmark-outline';
if (showComponent) {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* 작성 취소 모달 */}
      <Modal visible={visible} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>작성을 취소하시겠습니까?</Text>
            <Text style={styles.modalMessage}>작성한 내용은 유지되지 않습니다.</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={cancelPopup}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonConfirm} onPress={ConfirmPopup}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ flex: 1, margin: 10 }}>
        <ModHeader navigation={navigation} />
        <Text style={{ fontSize: 20, color: 'black', bottom: 20, fontWeight: 'bold' }}>
          {SpostState?.caption}
        </Text>
        <View style={{ flexDirection: 'row', top: 10 }}>
          <Avatar.Image
            size={30}
            style={{ bottom: 20 }}
            source={
              SpostState?.postBy?.profilePicUrl
                ? { uri: SpostState?.postBy?.profilePicUrl }
                : require("../../assets/defaultProfilePic.png")
            }
          />
          <Text style={{ marginLeft: 10, fontWeight: 'bold', bottom: 10 }}>
            {SpostState?.postBy.userName}
          </Text>
          <Text style={{ marginLeft: 10, color: 'gray', bottom: 10 }}>
            * {moment(SpostState?.creation).format("YYYY-MM-D")}
          </Text>
        </View>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={allRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.line}></View>
          <Text style={{ fontSize: 17, color: 'black', textAlign: 'left' }}>{SpostState?.content}</Text>
          {/* 포스트 이미지 */}
          {SpostState?.downloadURL && (
            <Image source={{ uri: SpostState?.downloadURL }} style={{ marginTop: 20, width: 350, height: 200 }}></Image>
          )}
          <View style={{ flexDirection: 'row' }}>
            {/* 좋아요 버튼 */}
            <TouchableOpacity onPress={() => like()}>
              <Ionicons name={iconName} size={25} style={{ color: '#9AC4F8', marginRight: 5, top: 3 }} />
            </TouchableOpacity>
            <Text style={{ marginRight: 10, top: 10 }}>{SpostState?.likes}</Text>
            {/* 조회수 아이콘 */}
            <Ionicons name="eye-outline" size={25} style={{ color: '#9AC4F8', marginRight: 5, top: 3 }} />
            <Text style={{ marginRight: 10, top: 10 }}>{SpostState?.views}</Text>
            {/* 스크랩 버튼 */}
            {SpostState?.userId != firebase.auth().currentUser.uid && (
              <TouchableOpacity onPress={() => Scrap()}>
                <Ionicons name={iconName2} size={25} style={{ color: '#9AC4F8', marginRight: 5, top: 3 }} />
              </TouchableOpacity>
            )}
            {/* 공유하기 버튼 */}
            <Text style={{ left: 130, top: 10 }}>공유하기</Text>
            <Ionicons name="share-outline" size={25} style={{ color: '#9AC4F8', marginRight: 5, left: 130 }} />
          </View>
          <View style={styles.line}></View>
        </ScrollView>
      </View>
    </View>
  );
} else {
  return (
    <View>
      {/* 로딩 중인 경우 */}
      {true && <ActivityIndicator style={{ height: 230, marginLeft: 10 }} size="large" color="#000000" />}
    </View>
  );
}
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
      marginTop:10,
    borderBottomColor: '#BDBDBD',
    borderBottomWidth: 1,
    width: '100%',
    marginBottom:10
  },
});
export default FollwingPostingUi