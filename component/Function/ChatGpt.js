import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-url-polyfill/auto';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// 채팅 입력 영역을 렌더링하는 컴포넌트
const Footer = (props) => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.footer}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="댓글을 남겨주세요"
          style={styles.input}
          onChangeText={text => props.setCommenttext(text)}
          value={props.commenttext}
          mode="outlined"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            // 사용자가 입력한 채팅 메시지를 데이터에 추가
            props.data.push({
              key: props.nextId.current += 1,
              content: props.commenttext,
              user: 'me',
              color: '#E1E7EC',
            });
            // 데이터 업데이트
            props.setdata([...props.data]);
            // Gpt 함수 호출하여 응답 생성
            props.Gpt(props.commenttext);
          }}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const ChatGpt = ({ navigation }) => {
  useEffect(() => {
    const configuration = new Configuration({
      organization: 'org-LKMKDdcWg2l5APiCZDggO0ba',
      apiKey: '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',
    });
    const openai = new OpenAIApi(configuration);
    openai.listEngines();
    // 초기 GPT 프롬프트 설정
    Gpt('안녕하세요');
  }, []);

  const [loading, setLoading] = useState(false);
  const [commenttext, setCommenttext] = useState('');
  const nextId = useRef(0);
  const [data, setdata] = useState([
    {
      key: nextId.current += 1,
      content: '안녕하세요',
      user: 'me',
      color: '#E1E7EC',
    },
  ]);

  // 채팅 메시지를 렌더링하는 컴포넌트
  const ChatMessage = ({ content, isMe }) => {
    return (
      <View style={[styles.messageContainer, isMe && styles.currentUserMessage]}>
        <Text style={styles.messageText}>{content}</Text>
      </View>
    );
  };

  const renderChatMessage = ({ item }) => {
    const isMe = item.user === 'me';
    return <ChatMessage content={item.content} isMe={isMe} />;
  };

  const Gpt = commenttext => {
    setLoading(true);
    
    axios
      .post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: commenttext }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer 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',
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
          },
        }
      )
      .then(function (response) {
       
        // 생성된 GPT 응답을 데이터에 추가
        data.push({
          key: nextId.current += 1,
          content: response.data.choices[0].message.content,
          user: 'chatGPT',
          color: '#E1E7EC',
        });
        

        // 데이터 업데이트
        setdata([...data]);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error)
      });
  };

  return (
    <View style={styles.container}>
      {/* 화면을 구성하는 최상위 View 컴포넌트입니다. */}
      
      <SafeAreaView style={styles.headerContainer}>
        {/* 헤더 컴포넌트를 감싸는 SafeAreaView 입니다. */}
        
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {/* 뒤로 가기 버튼을 누르면 navigation.goBack() 함수를 호출합니다. */}
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.headerText}>뒤로가기</Text>
        {/* 헤더 텍스트를 보여줍니다. */}
      </SafeAreaView>
      
      <FlatList
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContentContainer}
        data={data}
        renderItem={renderChatMessage}
        keyExtractor={item => item.key.toString()}
        ListFooterComponent={loading && <ActivityIndicator color="#000000" />}
        ListFooterComponentStyle={styles.loadingIndicator}
        keyboardShouldPersistTaps="handled"
      />
      
      <Footer
        setCommenttext={setCommenttext}
        Gpt={Gpt}
        nextId={nextId}
        commenttext={commenttext}
        data={data}
        setdata={setdata}
      />
      {/* 입력 창과 전송 버튼이 있는 Footer 컴포넌트입니다. */}
    </View>
  );
  }  

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // 헤더 컨테이너 스타일입니다.
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 0, // 안드로이드에서 SafeAreaView에 대한 조정
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  
  // 헤더 텍스트 스타일입니다.
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  
  // 채팅 컨테이너 스타일입니다.
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  // 채팅 컨테이너 내부 컨텐츠 컨테이너 스타일입니다.
  chatContentContainer: {
    paddingTop: 12,
    paddingBottom: 80,
  },
  
  // 채팅 메시지 컨테이너 스타일입니다.
  messageContainer: {
    alignSelf: 'flex-start',
    maxWidth: '75%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#E1E7EC',
  },
  
  // 현재 사용자의 채팅 메시지 컨테이너 스타일입니다.
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  
  // 채팅 메시지 텍스트 스타일입니다.
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  
  // Footer 컨테이너 스타일입니다.
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  
  // 입력창 컨테이너 스타일입니다.
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  // 입력창 스타일입니다.
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginRight: 8,
  },
  
  // 전송 버튼 스타일입니다.
  sendButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  
  // 로딩 인디케이터 스타일입니다.
  loadingIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default ChatGpt;