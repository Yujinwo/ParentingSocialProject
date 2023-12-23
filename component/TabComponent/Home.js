import * as React from 'react';
import { useState,useEffect  } from "react";
import { LogBox } from "react-native";
import {
  Text, 
  View,
  SafeAreaView,TouchableOpacity,ActivityIndicator,ScrollView,RefreshControl, useWindowDimensions, Dimensions} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-snap-carousel';
import {Card,Avatar } from 'react-native-paper';
import { firebase } from "../../firebase";
import moment from 'moment';
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// 글 시간 계산 함수
const Posttimeget = (creation) => {
  const today = moment();
  const dayDiff = today.diff(creation, 'days');
  const hourDiff = today.diff(creation, 'hours');
  const minutesDiff = today.diff(creation, 'minutes');

  if (dayDiff === 0 && hourDiff === 0) {
    // 작성한지 1시간도 안지났을때
    const minutes = Math.ceil(minutesDiff);
    if (minutes === 0) {
      return <Text>{'방금'}</Text>;
    } else {
      return <Text>{minutes + '분 전'}</Text>; // '분'으로 표시
    }
  }

  if (dayDiff === 0 && hourDiff <= 24) {
    // 작성한지 1시간은 넘었지만 하루는 안지났을때
    const hour = Math.ceil(hourDiff);
    return <Text>{hour + '시간 전'}</Text>; // '시간'으로 표시
  }

  return <Text>{dayDiff + '일 전'}</Text>; // '일'로 표시
};

// 질문이 없을 때 표시되는 Card 컴포넌트
const Qcardfirst = () => {
  return (
    
    <Card
      style={{
        width: Dimensions.get('window').width * 0.90,
        height: Dimensions.get('window').height * 0.3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2
      }}
    >
      <Card.Content  >
        <Text>글이 존재하지 않습니다!</Text>
      </Card.Content>
    </Card>
  )
}
// 글이 없을 때 표시되는 Card 컴포넌트
const Scardfirst = () => {
  return (
    
    <Card
      style={{
        width: Dimensions.get('window').width * 0.90,
        height: Dimensions.get('window').height * 0.33,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2
      }}
    >
      <Card.Content  >
        <Text>글이 존재하지 않습니다!</Text>
      </Card.Content>
    </Card>
  )
}

const QCard = (props) => {
  const [likestate, setlikestate] = useState(false);

  // useEffect를 사용하여 컴포넌트가 마운트되거나 props가 변경될 때마다 fetchlike 함수를 호출합니다.
  useEffect(() => {
    fetchlike((likeState2) => {
      setlikestate(likeState2 ? likeState2.includes(props.item.qpostId) : false);
    });
  }, [props]);

  // 사용자의 좋아요 상태를 가져오는 함수
  const fetchlike = async (userId, callback) => {
    const id = firebase.auth().currentUser.uid;

    try {
      const snapshot = await firebase.firestore().collection('users').doc(id).get();
      callback(snapshot.data().like);
    } catch (error) {
      // 오류 처리
    }
  };

  const like = async () => {
    const id = firebase.auth().currentUser.uid;
  
    if (likestate == false) {
      // 좋아요 버튼이 눌리지 않은 경우
      props.item.likes += 1;
      setlikestate(true);
  
      try {
        // Qposts 컬렉션에서 해당 qpostId와 일치하는 문서를 가져옴
        const snapshot = await firebase.firestore().collection('Qposts').where('qpostId', '==', props.item.qpostId).get();
        const docid = snapshot.docs[0].id;
  
        // 해당 문서의 likes 필드를 1 증가시킴
        await firebase.firestore().collection('Qposts').doc(docid).update({
          likes: firebase.firestore.FieldValue.increment(1),
        });
      } catch (error) {
        // 오류 처리
      }
  
      try {
        // 현재 사용자의 like 필드에 해당 qpostId를 추가
        await firebase.firestore().collection('users').doc(id).update({
          like: firebase.firestore.FieldValue.arrayUnion(props.item.qpostId),
        });
      } catch (error) {
        // 오류 처리
      }
    } else {
      // 좋아요 버튼이 이미 눌린 경우
      props.item.likes -= 1;
      setlikestate(false);
  
      try {
        // Qposts 컬렉션에서 해당 qpostId와 일치하는 문서를 가져옴
        const snapshot = await firebase.firestore().collection('Qposts').where('qpostId', '==', props.item.qpostId).get();
        const docid = snapshot.docs[0].id;
  
        // 해당 문서의 likes 필드를 1 감소시킴
        await firebase.firestore().collection('Qposts').doc(docid).update({
          likes: firebase.firestore.FieldValue.increment(-1),
        });
      } catch (error) {
        // 오류 처리
      }
  
      try {
        // 현재 사용자의 like 필드에서 해당 qpostId를 제거
        await firebase.firestore().collection('users').doc(id).update({
          like: firebase.firestore.FieldValue.arrayRemove(props.item.qpostId),
        });
      } catch (error) {
        // 오류 처리
      }
    }
  }
  
  const iconName = likestate ? 'thumbs-up' : 'thumbs-up-outline';
  return (
    <Card style={{
      width: Dimensions.get('window').width * 0.90,
      height: Dimensions.get('window').height * 0.30,
      marginBottom: 2
    }} key={props.item.qpostId}>
      {/* 제목 */}
      <Card.Content>
        <Text numberOfLines={1} ellipsizeMode="tail" style={{
          fontWeight: 'bold',
          fontSize: 21,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height * 0.05
        }} variant="titleLarge">
          {props.item.caption}
        </Text>
      </Card.Content>
  
      <TouchableOpacity onPress={() => props.navigation.navigate('QuestionPostingUi', { qpostId: props.item.qpostId })}>
        <Card.Content style={{ flexDirection: 'row' }}>
          {/* 내용 */}
          <View>
            <Text numberOfLines={4} ellipsizeMode="tail" variant="bodyMedium" style={{
              width: Dimensions.get('window').width * 0.40,
              height: Dimensions.get('window').height * 0.11,
              fontSize: 18
            }}>
              {props.item.content}
            </Text>
          </View>
  
          {/* 이미지 */}
          <View>
            <Card.Cover style={{
              bottom: 30,
              width: Dimensions.get('window').width * 0.40,
              height: Dimensions.get('window').height * 0.12
            }} source={props.item.downloadURL ? { uri: props.item.downloadURL } : require("../../assets/black.png")} />
          </View>
        </Card.Content>
    
  
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          {/* 좋아요 */}
          <TouchableOpacity onPress={like}>
            <Ionicons name={iconName} size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          </TouchableOpacity>
          <Text style={{ marginRight: 10 }} variant="bodyMedium">
            {props.item.likes}
          </Text>
        </View>
  
        {/* 공유 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <Ionicons name="share-outline" size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          <Text variant="bodyMedium">
            {props.item.shares}
          </Text>
        </View>
  
        {/* 노출수 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <Ionicons name="eye-outline" size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          <Text variant="bodyMedium">
            {props.item.views}
          </Text>
        </View>
  
        {/* 댓글 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <Ionicons name="chatbubble-outline" size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          <Text variant="bodyMedium">
            {props.item.comments}
          </Text>
        </View>
      </Card.Content>
      </TouchableOpacity>
      
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={() => {
          if (props.item.userId == firebase.auth().currentUser.uid) {
            props.navigation.navigate('DrawerProfile')
          } else {
            props.navigation.navigate('OtherUserProfile', props.item.userId)
          }
        }}>
          <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.07, bottom: 4, left: 10 }}>
            {/* 프로필 이미지 */}
            <Avatar.Image
              size={30}
              source={
                props.item.postBy?.profilePicUrl
                  ? { uri: props.item.postBy?.profilePicUrl }
                  : require("../../assets/defaultProfilePic.png")
              }
            />
            <Text variant="bodyMedium" style={{ marginRight: 37, fontSize: 16,top:5 }}>
              {props.item.postBy?.userName}
            </Text>
          </View>
        </TouchableOpacity>
  
        <View style={{ height: Dimensions.get('window').height * 0.07 }}>
          {/* 작성 시간 */}
          <Text variant="bodyMedium" style={{ marginRight: 37, fontSize: 16, color: "gray" }}>
            * {Posttimeget(moment(props.item.creation).format('YYYY-MM-DD HH:mm:ss'))}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
  
}
const SCard = (props) => {
  // 좋아요 상태와 스크랩 상태를 관리하는 state
  const [likestate, setlikestate] = useState(false);
  const [Scrapstate, setScrapstate] = useState(false);

  useEffect(() => {
    // 스크랩 상태를 가져오는 함수 호출
    fetchScrap((ScrapState) => {
      // 가져온 스크랩 상태를 state에 설정
      setScrapstate(ScrapState?.includes(props.item.folderpostId) || false);
    });

    // 좋아요 상태를 가져오는 함수 호출
    fetchlike((likestate) => {
      // 가져온 좋아요 상태를 state에 설정
      setlikestate(likestate?.includes(props.item.folderpostId) || false);
    });
  }, [props.item.folderpostId]);

  // 좋아요 기능을 수행하는 함수
  const like = async () => {
    const id = firebase.auth().currentUser.uid;

    if (likestate === false) {
      // 좋아요 상태가 false일 때
      // 좋아요 수 증가 및 상태 변경
      props.item.likes += 1;
      setlikestate(true);

      try {
        // 해당 폴더 게시물을 찾아 업데이트
        const snapshot = await firebase.firestore().collection("FolderPosts")
          .where('folderpostId', '==', props.item.folderpostId)
          .get();
        const docid = snapshot.docs[0].id;

        await firebase.firestore().collection("FolderPosts")
          .doc(docid)
          .update({
            likes: firebase.firestore.FieldValue.increment(1),
          });
      } catch (error) {
        // 업데이트 중 오류 발생 시 처리
      }

      try {
        // 사용자 문서 업데이트
        await firebase.firestore().collection("users")
          .doc(id)
          .update({
            like: firebase.firestore.FieldValue.arrayUnion(props.item.folderpostId),
          });
      } catch (error) {
        // 업데이트 중 오류 발생 시 처리
      }
    } else {
      // 좋아요 상태가 true일 때
      // 좋아요 수 감소 및 상태 변경
      props.item.likes -= 1;
      setlikestate(false);

      try {
        // 해당 폴더 게시물을 찾아 업데이트
        const snapshot = await firebase.firestore().collection("FolderPosts")
          .where('folderpostId', '==', props.item.folderpostId)
          .get();
        const docid = snapshot.docs[0].id;

        await firebase.firestore().collection("FolderPosts")
          .doc(docid)
          .update({
            likes: firebase.firestore.FieldValue.increment(-1),
          });
      } catch (error) {
        // 업데이트 중 오류 발생 시 처리
      }

      try {
        // 사용자 문서 업데이트
        await firebase.firestore().collection("users")
          .doc(id)
          .update({
            like: firebase.firestore.FieldValue.arrayRemove(props.item.folderpostId),
          });
      } catch (error) {
        // 업데이트 중 오류 발생 시 처리
      }
    }

  }
// 사용자의 좋아요 목록을 가져오는 함수
const fetchlike = async (callback) => {
  const id = firebase.auth().currentUser.uid;

  try {
    // 현재 사용자의 문서를 가져옴
    const snapshot = await firebase.firestore().collection("users")
      .doc(id)
      .get();

    // 가져온 문서에서 좋아요 목록을 callback 함수로 전달
    callback(snapshot.data().like);
  } catch (error) {
    // 오류가 발생한 경우 null을 callback 함수로 전달
    callback(null);
  }
};

// 사용자의 스크랩 목록을 가져오는 함수
const fetchScrap = async (callback) => {
  const id = firebase.auth().currentUser.uid;

  try {
    // 현재 사용자의 문서를 가져옴
    const snapshot = await firebase.firestore().collection("users")
      .doc(id)
      .get();

    // 가져온 문서에서 스크랩 목록을 callback 함수로 전달
    callback(snapshot.data().Scrap);
  } catch (error) {
    console.log(error);
    // 오류가 발생한 경우 null을 callback 함수로 전달
    callback(null);
  }
};

// 스크랩 기능을 수행하는 함수
const Scrap = async () => {
  const id = firebase.auth().currentUser.uid;

  try {
    if (Scrapstate == false) {
      // 스크랩 상태가 false인 경우
      setScrapstate(true); // 스크랩 상태를 true로 설정

      // 현재 사용자의 문서를 업데이트하여 스크랩 목록에 추가
      await firebase.firestore()
        .collection("users")
        .doc(id)
        .update({
          Scrap: firebase.firestore.FieldValue.arrayUnion(props.item.folderpostId),
        });
    } else {
      // 스크랩 상태가 true인 경우
      setScrapstate(false); // 스크랩 상태를 false로 설정

      // 현재 사용자의 문서를 업데이트하여 스크랩 목록에서 제거
      await firebase.firestore()
        .collection("users")
        .doc(id)
        .update({
          Scrap: firebase.firestore.FieldValue.arrayRemove(props.item.folderpostId),
        });
    }
  } catch (error) {
    // 오류 처리
  }
};

  const iconName = likestate ? 'thumbs-up' : 'thumbs-up-outline';
  const iconName2 = Scrapstate ? 'bookmark' : 'bookmark-outline';
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  return (
    <Card
      style={{
        width: Dimensions.get('window').width * 0.90,
        height: Dimensions.get('window').height * 0.33,
        marginBottom: 2,
      }}
      key={props.item.folderpostId}
    >
      {/* 제목 */}
      {/* <Card.Title
        title="구독"
        style={{
          color: '#9AC4F8',
          backgroundColor: '#9AC4F8',
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
        }}
        titleStyle={{
          color: 'white',
          fontSize: 25,
          marginTop: 15,
          fontWeight: 'bold',
        }}
      /> */}
      <TouchableOpacity onPress={() => props.navigation.navigate('FollwingPostingUi', props.item.folderpostId)}>
        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', marginTop: 10, fontSize: 21 }} variant="titleLarge">
            {props.item.caption}
          </Text>
        </Card.Content>
        <Card.Content style={{ flexDirection: 'row' }}>
          {/* 내용 */}
          <View>
            <Text variant="bodyMedium" style={{ width: Dimensions.get('window').width * 0.4, fontSize: 18 }}>
              {props.item.content}
            </Text>
          </View>
          {/* 이미지 */}
          <View>
            <Card.Cover
              style={{ bottom: 25, width: Dimensions.get('window').width * 0.4, height: Dimensions.get('window').height * 0.15 }}
              source={props.item.downloadURL ? { uri: props.item.downloadURL } : require("../../assets/black.png")}
            />
          </View>
        </Card.Content>
      </TouchableOpacity>
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', margintop: 5, marginBottom: 5 }}>
        {/* 좋아요 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <TouchableOpacity onPress={like}>
            <Ionicons name={iconName} size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          </TouchableOpacity>
          <Text style={{ marginRight: 10 }} variant="bodyMedium">
            {props.item.likes}
          </Text>
        </View>
        {/* 공유 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <Ionicons name="share-outline" size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          <Text variant="bodyMedium">{props.item.shares}</Text>
        </View>
        {/* 노출수 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <Ionicons name="eye-outline" size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          <Text variant="bodyMedium">{props.item.views}</Text>
        </View>
        {/* 댓글 수 */}
        <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.06 }}>
          <TouchableOpacity onPress={() => Scrap()}>
            <Ionicons name={iconName2} size={20} style={{ color: '#9AC4F8', marginRight: 10 }} />
          </TouchableOpacity>
        </View>
      </Card.Content>
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => {
            if (props.item.userId == firebase.auth().currentUser.uid) {
              props.navigation.navigate('DrawerProfile');
            } else {
              props.navigation.navigate('OtherUserProfile', props.item.userId);
            }
          }}
        >
          <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.07, bottom: 10 }}>
            {/* 프로필 이미지 */}
            <Avatar.Image
              size={30}
              source={
                props.item.postBy?.profilePicUrl
                  ? { uri: props.item.postBy?.profilePicUrl }
                  : require("../../assets/defaultProfilePic.png")
              }
            />
            <Text variant="bodyMedium" style={{ marginRight: 37, fontSize: 16,top:5}}>
              {props.item.postBy?.userName}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ height: Dimensions.get('window').height * 0.07, bottom: 5 }}>
          {/* 글 작성 시간 */}
          <Text variant="bodyMedium" style={{ marginRight: 37, fontSize: 16, color: "gray" }}>
            * {Posttimeget(moment(props.item.creation).format('YYYY-MM-DD HH:mm:ss'))}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
  
 }

export default function Home({props,navigation}) { 
  const [Qlastvisible, setQlastvisible] = useState(null);
  const [Slastvisible, setSlastvisible] = useState(null);
  const [QUserPost, setQUserPost] = useState([]);
  const [SUserPost, setSUserPost] = useState([]);
  const [Qrefreshing, setQRefreshing] = useState(false);
  const [Srefreshing, setSRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const onQRefresh = React.useCallback(() => {
    // 질문 게시물을 새로고침하는 콜백 함수입니다.
    setQRefreshing(true); // 새로고침 중임을 나타내기 위해 QRefreshing 상태를 true로 설정합니다.
    setTimeout(() => {
      fetchQPost((user) => {
        setQUserPost(user); 
      });
      setQRefreshing(false); 
    }, 500); 
  }, []);
  
  const onSRefresh = React.useCallback(() => {
    // 표준 게시물을 새로고침하는 콜백 함수입니다.
    setSRefreshing(true); // 새로고침 중임을 나타내기 위해 SRefreshing 상태를 true로 설정합니다.
    setTimeout(() => {
      fetchSPost((user) => {
        setSUserPost(user);
      });
      setSRefreshing(false);
    }, 500); 
  }, []);
  
  useEffect(() => {
    // 컴포넌트가 마운트될 때 처음 질문 게시물과 표준 게시물을 가져오는 부분입니다.
    fetchQPost((user) => {
      setQUserPost(user); 
    });
    fetchSPost((user) => {
      setSUserPost(user); 
    });
  }, []);
  // 전체 새로 고침
  const allRefresh = () => {
    setTimeout(() => {
      fetchQPost((user) => {
        setQUserPost(user); 
      });
      fetchSPost((user) => {
        setSUserPost(user); 
      });
    }, 2000);
  };
  // 질문글 데이터 가져온다
  const fetchQPost = async (callback) => {
    const id = firebase.auth().currentUser.uid; // 현재 사용자의 uid 가져오기
    const arr = []; // 결과를 저장할 배열 초기화
    try {
      const snapshot = await firebase.firestore().collection("Qposts")
        .orderBy('creation', 'desc') 
        .limit(5) // 최대 5개의 문서 가져오기
        .get(); 
  
      // 가져온 문서들에 대해 비동기적으로 처리
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data(); // 문서 데이터 가져오기
          const allDataWithUser = await data.postBy.get(); // postBy 필드의 사용자 정보 가져오기
          data.postBy = allDataWithUser.data();
          data.creation = data.creation.toDate(); 
          arr.push(data); // 결과 배열에 데이터 추가
        })
      );
  
      arr.sort((a, b) => b.creation - a.creation); // creation을 기준으로 배열 정렬
  
      const lastIndex = snapshot.docs.length - 1;
      setQlastvisible(lastIndex === -1 ? -1 : snapshot.docs[lastIndex]);
      // 마지막 문서의 위치 정보를 저장하여 다음에 가져올 때 사용
  
      callback(arr); // 결과 배열을 콜백 함수로 전달
    } catch (error) {
      // 오류 처리
    }
  };
  // 다음 질문글 이어서 불러오기
  const fetchNextQPost = async (callback) => {
    const id = firebase.auth().currentUser.uid;
    const arr = [];
  
    try {
      if (Qlastvisible) {
        // 마지막으로 가져온 문서가 있는 경우에만 실행
        const snapshot = await firebase.firestore()
          .collection("Qposts")
          .orderBy("creation", "desc")
          .startAfter(Qlastvisible) // 마지막으로 가져온 문서의 위치를 기준으로 다음 문서들 가져오기
          .limit(5)
          .get();
  
        if (snapshot.docs.length === 0) {
          // 가져온 문서가 없는 경우
          setQlastvisible(-1); // 마지막 문서 위치 정보를 -1로 설정하여 더 이상 가져올 문서가 없음을 표시
          callback(arr); // 빈 배열을 콜백 함수로 전달
          return;
        }
  
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const allDataWithUser = await data.postBy.get();
            data.postBy = allDataWithUser.data();
            data.creation = data.creation.toDate();
            arr.push(data);
          })
        );
  
        setQlastvisible(snapshot.docs[snapshot.docs.length - 1]);
        // 마지막으로 가져온 문서의 위치 정보 업데이트
  
        arr.sort((a, b) => b.creation - a.creation);
        callback(arr); // 결과 배열을 콜백 함수로 전달
      }
  
    } catch (error) {
      // 오류 처리
    }
  };
  

  // 팔로우글 데이터를 가져온다
  const fetchSPost = async (callback) => {
    const id = firebase.auth().currentUser.uid; 
    const arr = []; 
  
    try {
      const doc = await firebase.firestore().collection('users').doc(id).get();
      const followingUsers = doc.data()?.following ?? []; // 현재 사용자가 팔로우하는 사용자 목록 가져오기
      const placeholderstate = ['friend','all']
      if (followingUsers.length === 0) {
        callback([]);
        return;
      }
  
      const snapshot = await firebase.firestore().collection('FolderPosts')
        .where('userId', 'in', followingUsers) // userId가 팔로우하는 사용자들 중 하나인 문서들을 가져옴
        .orderBy('creation', 'desc') 
        .limit(5) // 최대 5개의 문서 가져오기
        .get(); 
  
      await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data(); // 문서 데이터 가져오기
        const allDataWithUser = await data.postBy.get(); // postBy 필드의 사용자 정보 가져오기
        data.postBy = allDataWithUser.data(); 
        data.creation = data.creation.toDate(); 
        if(data.placeholder == 'all' || data.placeholder == 'friend')
        {
          arr.push(data); // 결과 배열에 데이터 추가
        }
      }));
  
      if (snapshot.docs.length === 0) {
        setSlastvisible(-1); // 가져온 문서가 없는 경우 마지막 문서 위치 정보를 -1로 설정
      } else {
        setSlastvisible(snapshot.docs[snapshot.docs.length - 1]); // 마지막으로 가져온 문서의 위치 정보 업데이트
      }
  
      arr.sort((a, b) => b.creation - a.creation); // creation을 기준으로 배열 정렬
      callback(arr); 
    } catch (error) {
      // 오류 처리
    }
  };
    // 다음 팔로우글 이어서 가져온다
  const fetchNextSPost = async (callback) => {
    const id = firebase.auth().currentUser.uid; 
    const arr = []; 
  
    try {
      const doc = await firebase.firestore().collection('users').doc(id).get();
  
      if (doc.exists) {
        const followingUsers = doc.data().following; // 현재 사용자가 팔로우하는 사용자 목록 가져오기
  
        if (Slastvisible) {
          const snapshot = await firebase.firestore().collection('FolderPosts')
            .where('userId', 'in', followingUsers) // userId가 팔로우하는 사용자들 중 하나인 문서들을 가져옴
            .orderBy('creation', 'desc') 
            .startAfter(Slastvisible) // 마지막으로 가져온 문서 위치 다음부터 가져옴
            .limit(5) // 최대 5개의 문서 가져오기
            .get(); 
  
          await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data(); 
            const allDataWithUser = await data.postBy.get(); // postBy 필드의 사용자 정보 가져오기
            data.postBy = allDataWithUser.data(); 
            data.creation = data.creation.toDate(); 
            arr.push(data); // 결과 배열에 데이터 추가
          }));
  
          if (snapshot.docs.length === 0) {
            setSlastvisible(-1); // 가져온 문서가 없는 경우 마지막 문서 위치 정보를 -1로 설정
          } else {
            setSlastvisible(snapshot.docs[snapshot.docs.length - 1]); // 마지막으로 가져온 문서의 위치 정보 업데이트
          }
  
          arr.sort((a, b) => b.creation - a.creation); 
          callback(arr); 
        } else {
          setSlastvisible(-1); // 마지막 문서 위치 정보가 없는 경우 -1로 설정
          callback([]); 
        }
      } else {
        callback([]); 
      }
    } catch (error) {
      callback([]); 
    }
  };
  
  const Qloading = () => {
    // 다음 글을 가져와서 로딩 중인 상태로 표시한다.
    fetchNextQPost((Qlist) => {
      if (Qlist.length !== 0) {
        setLoading(true); // 로딩 상태를 true로 설정하여 로딩 중임을 표시
        setQUserPost((prevList) => [...prevList, ...Qlist]); // 가져온 글을 이전 리스트에 추가
  
        setTimeout(() => {
          setLoading(false); 
        }, 2000);
      }
    });
  };
  
  const Sloading = () => {
    // 다음 글을 가져와서 로딩 중인 상태로 표시한다.
    fetchNextSPost((Slist) => {
      if (Slist.length !== 0) {
        setLoading2(true); // 로딩 상태를 true로 설정하여 로딩 중임을 표시
        setSUserPost((prevList) => [...prevList, ...Slist]); // 가져온 글을 이전 리스트에 추가
  
        setTimeout(() => {
          setLoading2(false); 
        }, 2000);
      }
    });
  }
  
let Qcardfirst2 = [{"first":"first"}] 
let Scardfirst2 = [{"first":"first"}] 
const width = useWindowDimensions().width;
const height = useWindowDimensions().height;
return (
  <View style={{ backgroundColor:'white'}}>
    {/* 질문 버튼 안내 메시지 */}
    <View style={{ alignItems:'flex-start', justifyContent: 'center', height: Dimensions.get('window').height * 0.055 }}>
      <Text style={{ marginLeft: 30, fontSize: 21, marginTop: 5, fontWeight: 'bold'}}> 질문버튼을 통해 물어보세요! </Text>
    </View>
    
    <SafeAreaView style={{ alignItems:'center', paddingTop:10}}>
      {/* 질문 카드 Carousel */}
      <Carousel
        refreshControl={
          <RefreshControl refreshing={Qrefreshing} onRefresh={onQRefresh} />
        }
        layout={'default'}
        alwaysBounceHorizontal={true}
        data={
          QUserPost.length != 0
          ? QUserPost
          : Qcardfirst2
        }
        sliderWidth={Dimensions.get('window').width}
        itemWidth={Dimensions.get('window').width * 0.9}
        renderItem={({item,index}) => 
          QUserPost.length != 0
          ? <QCard item={item} navigation={navigation} index={index} allRefresh={allRefresh}></QCard>
          : Qcardfirst()
        }
        onEndReached={() => Qloading()} // Carousel 끝에 도달하면 추가로 글을 로딩하는 함수 호출
        onEndReachedThreshold={0}
        ListFooterComponent={loading && <ActivityIndicator style={{height:230,marginLeft:10}} size="small" color="#000000"/>} // 로딩 중인 경우 로딩 아이콘 표시
      />
    </SafeAreaView>
                  
    <View style={{paddingBottom:5}}></View>

    {/* 팔로워 카드 안내 메시지 */}
    <View style={{  alignItems:'flex-start', justifyContent: 'center', height: Dimensions.get('window').height * 0.055}}>
      <Text style={{ marginLeft: 30, marginBottom: 10, fontSize: 21, marginBottom: 10, fontWeight: 'bold' }}> 팔로워 </Text>
    </View>
          
    <SafeAreaView style={{  alignItems:'center'}}>
      {/* 팔로워 카드 Carousel */}
      <Carousel
        refreshControl={
          <RefreshControl refreshing={Srefreshing} onRefresh={onSRefresh} />
        }
        layout={'default'}
        alwaysBounceHorizontal={true}
        data={
          SUserPost.length != 0
          ? SUserPost
          : Scardfirst2
        }
        sliderWidth={Dimensions.get('window').width}
        itemWidth={Dimensions.get('window').width * 0.9}
        renderItem={({item}) => 
          SUserPost.length != 0
          ? <SCard item={item} navigation={navigation}></SCard>
          : Scardfirst()
        }
        onEndReached={() => Sloading()} // Carousel 끝에 도달하면 추가로 글을 로딩하는 함수 호출
        onEndReachedThreshold={0}
        ListFooterComponent={loading2 && <ActivityIndicator style={{height:270,marginLeft:10}} size="small" color="#000000"/>} // 로딩 중인 경우 로딩 아이콘 표시
      />
    </SafeAreaView>
    
    <View style={{ height: Dimensions.get('window').height * 0.02 }}></View>
    
    {/* 질문 글쓰기 버튼 */}
    <View style={{
      borderStyle: 'solid',
      width: Dimensions.get('window').width * 0.2,
      alignSelf: 'flex-end',
      marginRight:10,
    }}>
      <TouchableOpacity onPress={() => navigation.navigate('QuestionPost',onQRefresh)} style={{
        bottom: 10,
        right:0,
        zIndex: 100,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style = {{ height: Dimensions.get('window').height * 0.1,flexDirection:'row',marginRight:10 }}>
        <Ionicons name="help-circle-outline" size={35} style={{color:'#ffa7a7',bottom:5}}/>
        <Text style={{fontWeight: "bold",color:'black'}}>질문 글쓰기</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
)

     
     
}
            