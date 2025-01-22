import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import HeadPage from "@/components/HeadPage";
import { usePatients } from "@/context/PatientsProvider";
import { router } from "expo-router";
import { calculateAge } from "@/lib/utils";
import { useTests } from "@/context/TestsProvider";

export default function Search() {
  const { patients } = usePatients();
  const { tests } = useTests();

  const [searchQuery, setSearchQuery] = useState("");

  // تصفية المرضى بناءً على البحث
  const filteredPatients = patients.filter((patient) =>
    `${patient.fname} ${patient.lname}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <HeadPage title="البحث" />

      {/* حقل البحث */}
      <View className="p-4 flex-row items-center gap-1">
        <TextInput
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          placeholder="البحث عن مريض"
          className="bg-primary-50/20 flex-1 p-4 rounded-lg text-lg border border-primary-200 text-textColor font-mregular"
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity className="bg-primary rounded-lg p-3">
          <Feather name="search" size={33} color="white" />
        </TouchableOpacity>
      </View>

      {/* إذا لم يبدأ البحث بعد، عرض صورة مع نص "ابحث عن مريض" */}
      {!searchQuery && (
        <View className="px-4 flex items-center mt-10">
          <Image
            source={require("@/assets/images/no-data.png")}
            className="w-2/3 mx-auto"
            resizeMode="contain"
          />
          <Text className="text-2xl font-mbold mt-4">ابحث عن مريض</Text>
        </View>
      )}

      {/* عرض نتائج البحث */}
      {searchQuery && (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b border-primary-200"
              onPress={() =>
                router.push({
                  pathname: "/profile",
                  params: { item: JSON.stringify(item) },
                })
              }
            >
              <View className="flex-1 flex-row items-center gap-2">
                <View className="border border-primary-200 p-1 w-14 h-14 rounded-full">
                  <Image
                    source={
                      item.gender === "M"
                        ? require("../assets/images/boy.png")
                        : require("../assets/images/girl.png")
                    }
                    className="w-full h-full rounded-full ml-3"
                  />
                </View>
                <View>
                  <Text className="text-textColor text-lg font-msemibold mb-1">{`${item.fname} ${item.lname}`}</Text>
                  <Text className="text-textColor-sec font-mregular">
                    {`العمر: ${
                      calculateAge(new Date(item.birthday), false) ??
                      "غير معروف"
                    } سنة`}
                  </Text>
                </View>
              </View>
              {tests.find((t) => t.patient == item.id)?.result && (
                <FontAwesome6 name="check-double" size={16} color="#2A9D8F" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="px-4 flex items-center mt-10">
              <Image
                source={require("@/assets/images/no-data.png")}
                className="w-2/3 mx-auto"
                resizeMode="contain"
              />
              <Text className="text-2xl font-mbold mt-4">
                لا يوجد مرضى مطابقون
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
