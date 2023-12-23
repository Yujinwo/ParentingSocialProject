import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  RefreshControl,
  Modal,
  Keyboard,
  ScrollView,ActivityIndicator
  } from 'react-native';
  import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';
  const { SlideInMenu } = renderers;
  import { renderers } from 'react-native-popup-menu';
  import { useState, useEffect,useRef } from 'react';
  import * as React from 'react';
  import {TextInput,Avatar } from "react-native-paper";
  import { Ionicons } from '@expo/vector-icons';
  import { firebase } from "../../firebase";
  import moment from 'moment';
  import { useFocusEffect } from '@react-navigation/native';
  import { MenuProvider } from 'react-native-popup-menu';
  import { LogBox } from "react-native";
    LogBox.ignoreAllLogs()
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state',
    ]);
    //헤더
    const ModHeader = (props) => {
      return (
        <View style={{ marginTop: 30, backgroundColor: 'white', height: 90, bottom: 30 }}>
          {/* 뒤로 가기 버튼 */}
          <View style={{ flexDirection: 'row', marginTop: 40, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
              <Ionicons name="chevron-back-outline" size={40} style={{ color: 'black' }} />
            </TouchableOpacity>
    
            {/* "게시판" 텍스트 */}
            <Text style={{ fontSize: 20, color: 'black', left: 110 }}>게시판</Text>
    
            {/* 메뉴 버튼 */}
            <Menu renderer={SlideInMenu}>
              <MenuTrigger>
                {/* 로그인한 사용자와 글 작성자가 일치할 때만 메뉴 아이콘 표시 */}
                {props.QpostState?.userId == firebase.auth().currentUser.uid && (
                  <Ionicons name="ellipsis-horizontal-outline" size={40} style={{ color: 'black', left: 200 }} />
                )}
              </MenuTrigger>
    
              <MenuOptions optionsContainerStyle={{ borderWidth: 2, borderColor: 'black', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 30, marginRight: 30 }}>
                {/* "글 수정" 메뉴 옵션 */}
                <MenuOption onSelect={() => props.navigation.navigate('EditQuestionPosting', { allRefresh: props.allRefresh, QpostState: props.QpostState })}>
                  <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', alignItems: 'center', borderWidth: 2, borderRadius: 15, width: 300 }}>
                    <Ionicons name="pencil-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 글 수정
                  </Text>
                </MenuOption>
    
                {/* "글 삭제" 메뉴 옵션 */}
                <MenuOption onSelect={() => props.setVisible(true)}>
                  <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', borderWidth: 2, borderRadius: 15, width: 300 }}>
                    <Ionicons name="trash-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 글 삭제
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </View>
      )
    }
    // 시간 계산 함수
    const Posttimeget = (creation) => {
      const today = moment();
      
      const dayDiff = today.diff(creation, 'days');
      const hourDiff = today.diff(creation, 'hours');
      const minutesDiff = today.diff(creation, 'minutes');
    
      if (dayDiff === 0 && hourDiff === 0) { // 작성한지 1시간도 안지났을 때
        const minutes = Math.ceil(minutesDiff);
        if (minutes == 0) {
          return (
            <Text>{'방금'}</Text>
          )		
        } else {
          return (
            <Text>{minutes + '분 전'}</Text>
          ) // '분'으로 표시
        }
      }
    
      if (dayDiff === 0 && hourDiff <= 24) { // 작성한지 1시간은 넘었지만 하루는 안지났을 때
        const hour = Math.ceil(hourDiff);
        return (
          <Text>{hour + '시간 전'}</Text>
        ) // '시간'으로 표시
      }
    
      return (
        <Text>{dayDiff + '일 전'}</Text>
      ) // '일'로 표시
    };
    


    const Footer = (props) => {
      const [commenttext, setCommenttext] = useState("");
    
      const handleCommentSubmit = async () => {
        // 코멘트를 Firestore에 저장하는 함수
    
        await firebase.firestore().collection("Comments").doc().set({
          commentId: Math.random().toString(36) + "cm",
          userId: firebase.auth().currentUser.uid,
          postBy: firebase.firestore().doc(`/users/${firebase.auth().currentUser.uid}`),
          postId: props.PostId,
          likes: 0,
          comment: commenttext,
          creation: firebase.firestore.FieldValue.serverTimestamp(),
        });
      
        // 키보드 닫기
        Keyboard.dismiss();
    
        // 댓글 입력창 초기화
        setCommenttext("");
    
        // 댓글 목록 새로고침
        props.Commentrefresh();
    
        // 댓글 갯수 업데이트
        props.Commentup();
    
        // 게시글 새로고침을 위한 1초 딜레이
        setTimeout(() => {
          props.Qpostrefresh();
        }, 1000);
      };
      
      return (
        <KeyboardAvoidingView behavior="padding">
          {/* 댓글 입력창과 전송 버튼 */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TextInput
              placeholder='댓글을 남겨주세요'
              style={{ width: '80%', height: 40 }}
              onChangeText={text => setCommenttext(text)}
              value={commenttext}
              mode="outlined"
            />
            <Ionicons
              name="arrow-forward-circle-outline"
              size={30}
              style={{ color: '#9AC4F8', marginRight: 10, marginTop: 10 }}
              onPress={handleCommentSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      );
    }
    


    const Commentlist = (props) => {
      const [likestate,setlikestate] = useState(false);
      const iconName = likestate ? 'thumbs-up' : 'thumbs-up-outline';
    
      // 댓글 좋아요 상태 확인 및 업데이트
      useEffect(() => {
        fetchlike("", (likeState) => {
          setlikestate(likeState ? likeState.includes(props.item.commentId) : false);
        });
      }, [props.item.commentId]);
    
      // 사용자의 좋아요 상태를 가져오는 함수
      const fetchlike = async (userId,callback) => {
        const id = firebase.auth().currentUser.uid;
      
        try {
          const snapshot = await firebase.firestore().collection("users")
            .doc(id)
            .get();
          
          callback(snapshot.data().commentlike);
        } catch (error) {
          callback(null);
        }
      };
    
      // 댓글 좋아요 기능
      const like = async () => {
        const id = firebase.auth().currentUser.uid;
        
        if (likestate === false) {
          setlikestate(true);
        
          try {
            const snapshot = await firebase.firestore().collection("Comments")
              .where('commentId', '==', props.item.commentId)
              .get();
              
            const docid = snapshot.docs[0].id;
        
            await firebase.firestore().collection("Comments")
              .doc(docid)
              .update({
                likes: firebase.firestore.FieldValue.increment(1),
              });
          } catch (error) {
            // 오류 처리
          }
        
          try {
            await firebase.firestore().collection("users")
              .doc(id)
              .update({
                commentlike: firebase.firestore.FieldValue.arrayUnion(props.item.commentId),
              });
          } catch (error) {
            // 오류 처리
          }
          props.Commentrefresh();
        } else {
          setlikestate(false)
          try {
            const snapshot = await firebase.firestore().collection("Comments")
              .where('commentId', '==', props.item.commentId)
              .get();
              
            const docid = snapshot.docs[0].id;
        
            await firebase.firestore().collection("Comments")
              .doc(docid)
              .update({
                likes: firebase.firestore.FieldValue.increment(-1),
              });
          } catch (error) {
            // 오류 처리
          }
        
          try {
            await firebase.firestore().collection("users")
              .doc(id)
              .update({
                commentlike: firebase.firestore.FieldValue.arrayRemove(props.item.commentId),
              });
          } catch (error) {
            // 오류 처리
          }
          props.Commentrefresh();
        }
      }
    
      const [visible2, setVisible2] = useState(false);
    
      const CommentcancelPopup = () => {
        setVisible2(false);
      };
     
      const CommentConfirmPopup = async () => {
        setVisible2(false);
        
        // 댓글 삭제
        const snapshot = await firebase.firestore().collection("Comments")
          .where('commentId', '==', props.item.commentId)
          .get();
        
        const docid = snapshot.docs[0].id;
    
        await firebase.firestore().collection("Comments")
          .doc(docid)
          .delete();
    
        // 게시글의 댓글 수 감소
        const snapshot2 = await firebase.firestore().collection("Qposts")
          .where('qpostId', '==', props.item.postId)
          .get();
        
        const docid2 = snapshot2.docs[0].id;
    
        await firebase.firestore().collection("Qposts")
          .doc(docid2)
          .update({
            comments : firebase.firestore.FieldValue.increment(-1)
          })
          .catch((error) => {
            // 오류 처리
          });
    
        props.Commentrefresh();
        props.Qpostrefresh();
      };
      return (
        <View style={{marginBottom:10}} key={props.item.commentId}>
      
          {/* 댓글 삭제 팝업 */}
          <Modal visible={visible2} animationType="fade" transparent={true}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>댓글을 삭제하시겠습니까?</Text>
                <Text style={styles.modalMessage}>확인을 누르면 댓글은 삭제됩니다</Text>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity style={styles.buttonCancel} onPress={CommentcancelPopup}>
                    <Text style={styles.buttonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonConfirm} onPress={CommentConfirmPopup}>
                    <Text style={styles.buttonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
      
          <View style={{flexDirection:'row',marginBottom:10}}>
            <TouchableOpacity onPress={() => {
              if (props.item.userId == firebase.auth().currentUser.uid) {
                props.navigation.navigate('DrawerProfile');
              } else {
                props.navigation.navigate('OtherUserProfile', props.item.userId);
              }
            }}>
              <Avatar.Image
                size={30}
                style={{}}
                source={
                  props.item.postBy?.profilePicUrl
                  ? { uri: props.item.postBy?.profilePicUrl }
                  : require("../../assets/defaultProfilePic.png")
                }
              />
            </TouchableOpacity>
            <Text style={{marginLeft:10,fontWeight:'bold',top:5}}>{props.item.postBy.userName}</Text>
            <Text style={{marginLeft:10,color:'gray',top:5}}>* {Posttimeget(moment(props.item.creation).format('YYYY-MM-DD HH:mm:ss'))}</Text>
            
            <Menu renderer={SlideInMenu}>
              <MenuTrigger>
                {/* 댓글 작성자 메뉴 */}
                {props.item?.userId == firebase.auth().currentUser.uid && (
                  <Ionicons name="ellipsis-horizontal-outline" size={28} style={{ color: 'black',left:150}}/>
                )}
              </MenuTrigger>
      
              <MenuOptions optionsContainerStyle={{ borderWidth: 2, borderColor: 'black', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 30, marginRight: 30 }}>
                <MenuOption onSelect={() => setVisible2(true)}>
                  {/* 댓글 삭제 옵션 */}
                  <Text style={{ textAlign: 'center', fontSize: 25, color: 'gray', borderWidth: 2, borderRadius: 15, width: 300 }}>
                    <Ionicons name="trash-outline" size={30} style={{ color: 'black', alignItems: 'center' }} /> 댓글 삭제
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          
          <Text style={{fontSize:17,color:'black',textAlign: 'left',marginBottom:10}}>{props.item.comment}</Text>
          
          <View style={{ flexDirection: 'row',marginBottom:10}}>
            <TouchableOpacity onPress={() => like()} >
              {/* 좋아요 버튼 */}
              <Ionicons name={iconName} size={20} style={{ color: '#9AC4F8', marginRight: 5,bottom:5 }}/>
            </TouchableOpacity>
      
            <Text style={{marginRight:10 }}>{props.item.likes}</Text>
          </View>
        </View>
      );
      
  
}      
      
const QuestionPostingUi = ({navigation,route}) => {
  const [Comment, setComment] = useState([]);
  const [QpostState, setQpostState] = useState([]);
  const [showComponent, setShowComponent] = React.useState(false);
  const [likestate,setlikestate] = useState(false)
  const [Commentstate,setCommentstate] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const captureRef = useRef();
 
  const Qposid = route.params.qpostId
  

  useEffect(() => {
    // 댓글 좋아요 상태를 가져와서 설정합니다.
    fetchlike("", (likeState) => {
      setlikestate(likeState ? likeState.includes(Qposid) : false);
    });
    
    // View 업데이트를 수행합니다.
    Viewup();
  }, []);
  // 좋아요 데이터를 가져옵니다.
  const fetchlike = async (userId, callback) => {
    const id = firebase.auth().currentUser.uid;
    
    try {
      const snapshot = await firebase.firestore().collection("users")
        .doc(id)
        .get();
      
      // 콜백 함수를 사용하여 댓글 좋아요 상태를 반환합니다.
      callback(snapshot.data().like);
    } catch (error) {
      callback(null);
    }
  };
  // 좋아요 상태를 관리하는 함수
  const like = async () => {
    const id = firebase.auth().currentUser.uid;
    
    if (likestate === false) {
      // 좋아요 상태가 false인 경우
      
      // QpostState.likes 값을 증가시킵니다.
      QpostState.likes += 1;
      
      setlikestate(true);
    
      try {
        const snapshot = await firebase.firestore().collection("Qposts")
          .where('qpostId', '==', Qposid)
          .get();
          
        const docid = snapshot.docs[0].id;
    
        await firebase.firestore().collection("Qposts")
          .doc(docid)
          .update({
            likes: firebase.firestore.FieldValue.increment(1),
          });
      } catch (error) {
        
      }
    
      try {
        await firebase.firestore().collection("users")
          .doc(id)
          .update({
            like: firebase.firestore.FieldValue.arrayUnion(Qposid),
          });
      } catch (error) {
        
      }
    } else {
      // 좋아요 상태가 true인 경우
      
      // QpostState.likes 값을 감소시킵니다.
      QpostState.likes -= 1;
    
      setlikestate(false);
      try {
        const snapshot = await firebase.firestore().collection("Qposts")
          .where('qpostId', '==', Qposid)
          .get();
          
        const docid = snapshot.docs[0].id;
    
        await firebase.firestore().collection("Qposts")
          .doc(docid)
          .update({
            likes: firebase.firestore.FieldValue.increment(-1),
          });
      } catch (error) {
        
      }
    
      try {
        await firebase.firestore().collection("users")
          .doc(id)
          .update({
            like: firebase.firestore.FieldValue.arrayRemove(Qposid),
          });
      } catch (error) {
        
      }
    }
  }
  
  // 화면 포커스가 변경될 때마다 새로고침을 수행합니다.
  useFocusEffect(
    React.useCallback(() => {
      Qpostrefresh();
      Commentrefresh();
      setTimeout(() => {
        setShowComponent(true);
      }, 1200);
    }, []),
  );


  // 전체 새로고침
  const allRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      Commentrefresh();
      Qpostrefresh();
      setRefreshing(false);
    }, 2500);
  }
  // 조회된 Qpost의 views를 증가시킵니다.
  const Viewup = async () => {
    let docid = 0;
    
    // QpostId와 일치하는 Qpost를 조회합니다.
    await firebase.firestore()
      .collection("Qposts")
      .where('qpostId', '==', Qposid)
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            docid = doc.id;
          })
        )
        .then(() => {
          
          firebase.firestore()
            .collection("Qposts")
            .doc(docid)
            .update({
              views: firebase.firestore.FieldValue.increment(1),
            })
            .catch((error) => {
              // 오류 처리
            });
        })
      });
  }
   // 조회된 Qpost의 comments를 증가시킵니다.
  const Commentup = async () => {
    let docid = 0;
    
    // QpostId와 일치하는 Qpost를 조회합니다.
    await firebase.firestore()
      .collection("Qposts")
      .where('qpostId', '==', Qposid)
      .get()
      .then(async (snapshot) => {
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            docid = doc.id;
          })
        )
        .then(() => {
         
          firebase.firestore()
            .collection("Qposts")
            .doc(docid)
            .update({
              comments: firebase.firestore.FieldValue.increment(1),
            })
            .catch((error) => {
              // 오류 처리
            });
        })
      });
  }
   // 댓글을 다시 가져와서 설정합니다.
  const Commentrefresh = () => {
   
    fetchCommentPost("", (user) => {
      setComment(user);
    });
  }
   // Qpost를 다시 가져와서 설정합니다.
  const Qpostrefresh = () => {
   
    fetchQpostPost("", (user) => {
      setQpostState(...user);
      setCommentstate(user[0].comments);
    });
  }
  // 질문글 데이터를 가져온다
  const fetchQpostPost = async (qpostId, callback) => {
    try {
      const arr = [];
      const snapshot = await firebase.firestore().collection("Qposts")
        .where('qpostId', '==', Qposid)
        .get();
  
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const allDataWithUser = await data.postBy.get();
          data.postBy = allDataWithUser.data();
          data.creation = data.creation.toDate(); // 파이어베이스 타임스탬프를 Date 객체로 변환
          arr.push(data);
        })
      );
      
      callback(arr);
    } catch (error) {
      // 삭제된 게시물인 경우 알림을 표시하고 이전 화면으로 돌아갑니다.
      alert('삭제된 게시물 입니다. 다시 시도해주세요');
      navigation.goBack();
    }
  };
   // 질문글 댓글 데이터를 가져온다
  const fetchCommentPost = async (postId, callback) => {
    try {
      const id = firebase.auth().currentUser.uid;
      const arr = [];
  
      const snapshot = await firebase.firestore().collection("Comments")
        .where('postId', '==', Qposid)
        .orderBy("creation", "desc")
        .get();
  
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const allDataWithUser = await data.postBy.get();
          data.postBy = allDataWithUser.data();
          data.creation = data.creation.toDate(); 
          arr.push(data);
        })
      );
  
      // 댓글을 최신 순으로 정렬합니다.
      arr.sort((a, b) => b.creation - a.creation); 
      callback(arr);
    } catch (error) {
      // 오류 처리
    }
  };
  

  const [visible, setVisible] = useState(false);

  // 팝업 창을 취소하는 함수
  const cancelPopup = () => {
    setVisible(false);
  };
  
  // 팝업 창을 확인하는 함수
  const ConfirmPopup = async () => {
    setVisible(false);
    
    // QpostState의 qpostId와 일치하는 문서를 찾습니다.
    const snapshot = await firebase.firestore().collection("Qposts")
      .where('qpostId', '==', QpostState?.qpostId)
      .get();
    
    const docid = snapshot.docs[0].id;
    
    // 해당 문서를 삭제합니다.
    await firebase.firestore().collection("Qposts")
      .doc(docid)
      .delete();
    
    navigation.goBack();
  };
  
  // 좋아요 상태에 따라 아이콘 이름을 설정합니다.
  const iconName = likestate ? 'thumbs-up' : 'thumbs-up-outline';
  
 
  if (showComponent) {
    return (
      <MenuProvider skipInstanceCheck>
        <View style={{flex:1, backgroundColor:'white'}}>
          {/* 작성 취소 모달 */}
          <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>글을 삭제하시겠습니까?</Text>
                <Text style={styles.modalMessage}>확인을 누르면 글은 삭제 됩니다</Text>
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
        
          <View style={{flex:1, margin:10}}>
            {/* ModHeader 컴포넌트 */}
            <ModHeader navigation={navigation} QpostState={QpostState} allRefresh={allRefresh} setVisible={setVisible}/>
            
            <Text style={{fontSize:20, color:'black', bottom:20, fontWeight:'bold'}}>{QpostState?.caption}</Text>
            
            <View style={{flexDirection:'row', top:10}}>
              <TouchableOpacity onPress={() => {
                if (QpostState?.userId == firebase.auth().currentUser.uid) {
                  navigation.navigate('DrawerProfile');
                } else {
                  navigation.navigate('OtherUserProfile', QpostState?.userId);
                }
              }}>
                {/* 프로필 이미지 */}
                <Avatar.Image
                  size={30}
                  style={{bottom:20}}
                  source={
                    QpostState?.postBy?.profilePicUrl
                    ? { uri: QpostState?.postBy?.profilePicUrl }
                    : require("../../assets/defaultProfilePic.png")
                  }
                />
              </TouchableOpacity>
              
              {/* 작성자 이름 및 작성일 */}
              <Text style={{marginLeft:10, fontWeight:'bold', bottom:10}}>{QpostState?.postBy.userName}</Text>
              <Text style={{marginLeft:10, color:'gray', bottom:10}}>* {moment(QpostState?.creation).format("YYYY-MM-D")}</Text>
            </View>
            
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={allRefresh} />
              }
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.line}></View>
              
              {/* 게시물 내용 */}
              <Text style={{fontSize:17, color:'black', textAlign:'left'}}>{QpostState?.content}</Text>
              
              {/* 게시물 이미지 */}
              {QpostState?.downloadURL && (
                <Image source={{ uri: QpostState?.downloadURL }} style={{marginTop:20, width:350, height:200}} />
              )}
              
              <View style={{flexDirection:'row'}}>
                {/* 좋아요 버튼 */}
                <TouchableOpacity onPress={() => like()}>
                  <Ionicons name={iconName} size={25} style={{color:'#9AC4F8', marginRight:5, top:3}} />
                </TouchableOpacity>
                <Text style={{marginRight:10, top:10}}>{QpostState?.likes}</Text>
                
                {/* 조회수 */}
                <Ionicons name="eye-outline" size={25} style={{color:'#9AC4F8', marginRight:5, top:3}} />
                <Text style={{marginRight:10, top:10}}>{QpostState?.views}</Text>
                
                {/* 댓글 수 */}
                <Ionicons name="chatbubble-outline" size={25} style={{color:'#9AC4F8', marginRight:5, top:3}} />
                <Text style={{top:10}}>{QpostState?.comments}</Text>
                
                <Text style={{left:130, top:10}}>공유하기</Text>
                
                {/* 공유하기 버튼 */}
                <Ionicons name="share-outline" size={25} style={{color:'#9AC4F8', marginRight:5, left:130}} onPress={() => alert('미구현')} />
              </View>
              
              <View style={styles.line}></View>
              
              <View style={{flex:1}}>
                <SafeAreaView>
                  {/* 댓글 목록 */}
                  <FlatList
                    scrollEnabled={false}
                    data={Comment}
                    renderItem={({ item }) => <Commentlist item={item} navigation={navigation} Commentrefresh={Commentrefresh} Qpostrefresh={Qpostrefresh} />}
                  />
                </SafeAreaView>
              </View>
            </ScrollView>
          </View>
          
          {/* Footer 컴포넌트 */}
          <Footer PostId={Qposid} Commentrefresh={Commentrefresh} Commentup={Commentup} Qpostrefresh={Qpostrefresh} />
        </View>
      </MenuProvider>
    )} else {
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
export default QuestionPostingUi