import { View,Image,Text } from "react-native";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs()
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
export default function Notification( {navigation,props} ) { 



    return (
        // 알림사항 컴포넌트
        <View style={{flex:1,backgroundColor:'white'}}>

            <View style={{flexDirection:'row',marginTop:10,marginLeft:10}}>
            {/* 알림사항 이미지 */ }
            <Image source={require("../../assets/Notification.png")}/>

            <View style={{marginLeft:20,justifyContent:'space-between'}}>
            {/* 알림사항 제목 */ }
            <Text style={{fontWeight:'bold',fontSize:18}}>공지</Text>
            {/* 알림사항 내용 */ }
            <Text style={{fontWeight:'bold',color:'gray'}}>가입을 환영합니다!</Text>
            {/* 알림사항 날짜 */ }
            <Text style={{fontWeight:'bold',color:'gray'}}>2023-04-09</Text>
            </View>
            
            </View>
        </View>


    )


}

