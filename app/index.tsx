import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { calculateAge } from "@/lib/utils";
import { usePatients } from "@/context/PatientsProvider";
import { useTests } from "@/context/TestsProvider";

export default function PatientList() {
  const { patients, loading, fetchPatients } = usePatients();
  const { tests } = useTests();
  const [refresh, setRefresh] = useState<boolean>(false);
  const onRefresh = async () => {
    setRefresh(true);
    await fetchPatients();
    setRefresh(false);
  };
  return (
    <SafeAreaView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center bg-primary-50 justify-between px-4 py-3 pt-14 border-b border-primary-200">
        <View className="flex-row items-center justify-center">
          <Image
            source={require("../assets/images/icon.png")}
            className="w-8 h-8 rounded-full ml-2 bg-white"
          />
          <Text className="text-textColor text-2xl font-mbold">
            اختبار رسم الرجل
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Feather name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Show ActivityIndicator when loading */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          className="flex-1"
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
                    العمر: {" "}
                    {calculateAge(new Date(item.birthday), false) ??
                      "غير معروف"}{" "}
                    سنة
                  </Text>
                </View>
              </View>
              {tests.find((t) => t.patient == item.id)?.result && (
                <FontAwesome6 name="check-double" size={16} color="#2A9D8F" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={() =>
            !loading && patients.length === 0 ? (
              <View className="px-4 flex items-center">
                <Image
                  source={require("@/assets/images/no-data.png")}
                  className="w-2/3 mx-auto"
                  resizeMode="contain"
                />
                <Text className="text-3xl font-mbold -mt-24">
                  لا يوجد مرضى حاليا
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={onRefresh}
              colors={["grey"]}
              progressBackgroundColor={"black"}
            />
          }
        />
      )}

      {/* Add Patient Button */}
      <Link href="/new-patient" asChild>
        <TouchableOpacity className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg">
          <AntDesign name="plus" size={30} color="black" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
