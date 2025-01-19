import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import HeadPage from "@/components/HeadPage";
import { Patient } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
export default function patient() {
  const { item }: { item: string } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    setPatient(JSON.parse(item));
  }, [item]);

  const exist = true;

  return (
    // <StatusBar style="dark" />
    <SafeAreaView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <HeadPage title={`${patient?.fname} ${patient?.lname}`} />
      <ImageBackground
        source={require("../assets/images/chat.png")}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.2 }}
      >
        <View className="flex-1 bg-primary-50/20">
          {exist && (
            <View className="flex-1 items-center justify-center gap-4 w-[260px] mx-auto">
              <Text className="text-3xl font-mbold">
                لم يقم بإجتياز الإختبار بعد
              </Text>
              <Acions />
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const Acions = () => {
  return (
    <View className="flex-row gap-1 items-center">
      <TouchableOpacity className="bg-primary p-3 flex-1 rounded-lg">
        <Text className="text-2xl font-mmedium text-white text-center">إجتياز الإختبار</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-primary p-3 rounded-lg">
        <AntDesign name="camera" size={27} color={"white"} />
      </TouchableOpacity>
    </View>
  );
};
