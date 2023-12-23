//share기능은 동작하지 않음
import React, { useState } from "react";
import { View, Button, Modal, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // 라이브러리에서 원하는 아이콘 세트를 가져옵니다.

export default function Share() {
  const [popupVisible, setPopupVisible] = useState(false);

  const openPopup = () => {
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="공유 팝업 열기" onPress={openPopup} />

      {/* 팝업이 보이는 경우에만 렌더링됩니다. */}
      {popupVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View style={{ backgroundColor: "white", padding: 20 }}>
            {/* 팝업 내용 */}
            <Text style={{ fontSize: 18, marginBottom: 10 }}>공유 팝업 내용</Text>
            <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={closePopup}>
              <Text style={{ color: "blue" }}>닫기</Text>
            </TouchableOpacity>
            <Icon name="rocket" size={30} color="#900" />
          </View>
        </View>
      )}
    </View>
  );
}
