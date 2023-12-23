import React from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, } from 'react-native';
import styles from '../Function/styles';
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
// 샘플 트렌드 데이터 
const TREND_DATA = [
  {
    id: '1',
    name: 'React Native',
    postCount: '10.2K',
  },
  {
    id: '2',
    name: 'JavaScript',
    postCount: '15.6K',
  },
  {
    id: '3',
    name: 'Node.js',
    postCount: '8.7K',
  },
];
// 샘플 글 데이터 
const POST_DATA = [
  {
    id: '1',
    name: 'John Doe',
    username: '@johndoe',
    post_content: 'Hello sunmoon!',
  },
  {
    id: '2',
    name: 'Jane Doe',
    username: '@janedoe',
    post_content: 'Hello React Native!',
  },
  {
    id: '3',
    name: 'Bob Smith',
    username: '@bobsmith',
    post_content: 'Hello World!',
  },
];
// 검색 컴포넌트
const Search = () => {
  const [selectedTrend, setSelectedTrend] = React.useState(null);

  const trendPress = (trend) => {
    setSelectedTrend(trend);
  };

  const trendBack = () => {
    setSelectedTrend(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.trend} onPress={() => trendPress(item)}>
      {/* 트렌드 이름 */}
      <Text style={styles.trendName}>{item.name}</Text>
      {/* 게시글 수 */}
      <Text style={styles.trendPostCount}>{item.postCount} 게시글 수</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      {/* 작성자 이름 */}
      <Text style={styles.postName}>{item.name}</Text>
      {/* 작성자 아이디 */}
      <Text style={styles.postUsername}>{item.username}</Text>
      {/* 게시글 내용 */}
      <Text style={styles.postText}>{item.post}</Text>
    </View>
  );

  if (selectedTrend) {
    return (
      <View style={styles.trendpage}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity style={styles.backButton} onPress={trendBack}>
          <Text style={styles.backButtonText}>{"< 뒤로가기"}</Text>
        </TouchableOpacity>
        {/* 선택된 트렌드 제목 */}
        <Text style={styles.trendtitle}>{selectedTrend.name}</Text>
        {/* 게시글 목록 */}
        <FlatList
          data={POST_DATA}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }

  return (
    <View style={styles.trendpage}>
      {/* 트렌드 페이지 제목 */}
      <Text style={styles.trendtitle}>무엇이 궁금하신가요?</Text>
      <View style={styles.searchBar}>
        {/* 검색 입력창 */}
        <TextInput
          style={styles.searchinput}
          placeholder="지금 당장 검색하기"
          placeholderTextColor="#555"
        />
        {/* 검색 버튼 */}
        <TouchableOpacity style={styles.SearchButton}>
          <Text style={styles.buttonText}>검색</Text>
        </TouchableOpacity>
      </View>
      {/* 트렌드 목록 */}
      <FlatList
        data={TREND_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Search;

