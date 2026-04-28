import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useCart } from "../context/CartContext";
import TextComponent from "./TextComponent";

export default function CartIcon() {
  const { localPractices, removedApiIds, setCartModalVisible } = useCart();

  const rawApiPractices =
    useSelector((s: any) => s.dailyPracticeReducer?.data?.active_practices) ||
    [];

  // 1️⃣ API Practics that are still active (not removed)
  const apiPractices = rawApiPractices.filter(
    (p: any) => !removedApiIds.has(p.practice_id ?? p.id)
  );

  // 2️⃣ Local practices that are not from API → recently added
  const recentlyAdded = localPractices.filter(
    (item) =>
      !rawApiPractices.some(
        (x: any) => x.practice_id === item.practice_id
      )
  );

  // 3️⃣ Final Count
  const count = apiPractices.length + recentlyAdded.length;

  return (
    <TouchableOpacity
      onPress={() => setCartModalVisible(true)}
      style={{ position: "relative", width: 32, height: 32 }}
    >
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            backgroundColor: "#1877F2",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
            zIndex: 10,
          }}
        >
          <TextComponent
            type="semiBoldText"
            style={{ color: "#fff", fontSize: 11 }}
          >
            {count}
          </TextComponent>
        </View>
      )}

      <Image
        source={require("../../assets/cart.png")}
        style={{ width: 30, height: 30 }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
