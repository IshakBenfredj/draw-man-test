import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function HeadPage({ title }: { title: string }) {
  return (
    <View className="flex-row items-center bg-primary-50 justify-between px-4 py-3 pt-14 border-b border-primary-200">
      <View className="flex-row items-center justify-center">
        <Text className="text-textColor text-2xl font-mbold">{title}</Text>
      </View>
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}
