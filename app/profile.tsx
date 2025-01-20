import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import HeadPage from "@/components/HeadPage";
import type { Patient, Test } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { add_test_api } from "@/lib/api";
import { useTests } from "@/context/TestsProvider";

export default function PatientDetails() {
  const { item }: { item: string } = useLocalSearchParams();
  const { tests, fetchTests, loading: testLoading } = useTests();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [test, setTest] = useState<Test | undefined>(undefined);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const patient = JSON.parse(item);
    setPatient(patient);
    const test = tests.find((t) => t.patient == patient?.id);
    setTest(test);
  }, [item, test]);

  const handleCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      // allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setCapturedImage(result.assets[0].base64);
    }
  };

  const handleSave = async () => {
    if (!patient || !capturedImage) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("id", new Date().toString());
    formData.append("patient", patient.id);
    formData.append("image", capturedImage);

    try {
      const response = await fetch(add_test_api, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        Alert.alert("نجاح", "تم حفظ الصورة بنجاح");
        setCapturedImage("");
        fetchTests();
      } else {
        console.error("Failed to save images");
      }
    } catch (error) {
      console.error("Error saving images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <HeadPage title={`${patient?.fname} ${patient?.lname}`} />
      <ImageBackground
        source={require("@/assets/images/chat.png")}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.2 }}
      >
        {/* <ScrollView className="flex-1 bg-primary-50/20"> */}
        {
          testLoading && <View className="flex-1"><ActivityIndicator /></View>
        }
        {!test && (
          <View className="flex-1 items-center justify-center gap-4 w-[260px] mx-auto bg-primary-50/20 py-8">
            <Text className="text-3xl font-mbold text-center">
              لم يقم بإجتياز الإختبار بعد
            </Text>
            <Actions
              onCameraPress={handleCapture}
              hideCamera={!!capturedImage}
            />
            {capturedImage && (
              <View className="w-full flex items-center justify-center gap-4">
                <Text className="text-xl font-msemibold mb-2">
                  الصورة الملتقطة:
                </Text>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
                  resizeMode="contain"
                  className="w-[228px] h-[500px] border-primary border-4 rounded-lg"
                />
                <TouchableOpacity
                  className="bg-primary p-3 rounded-lg"
                  onPress={handleSave}
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-xl font-mmedium text-white text-center">
                      حفظ الصورة
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {test && (
          <View className="flex-1 items-center justify-center gap-4 px-4 mx-auto bg-primary-50/20 py-8">
            {!test.result && (
              <Text className="text-3xl font-mbold text-center">
                لم يقم بإجتياز الإختبار بعد
              </Text>
            )}
            <View className=" w-[260px]">
              <Actions
                onCameraPress={handleCapture}
                hideCamera={!!test.image}
              />
            </View>
            {test.image && (
              <View className="w-full flex gap-4">
                <Text className="text-xl font-msemibold mb-2">
                  الصورة الملتقطة:
                </Text>
                <View className="flex-row gap-4">
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${test.image}` }}
                    resizeMode="contain"
                    className="w-[228px] h-[500px] border-primary border-4 rounded-lg"
                  />
                  <View></View>
                </View>
              </View>
            )}
          </View>
        )}
        {/* </ScrollView> */}
      </ImageBackground>
    </SafeAreaView>
  );
}

const Actions = ({
  onCameraPress,
  hideCamera,
}: {
  onCameraPress: () => void;
  hideCamera: boolean;
}) => {
  return (
    <View className="flex-row gap-1 items-center">
      <TouchableOpacity className="bg-primary p-3 flex-1 rounded-lg">
        <Text className="text-2xl font-mmedium text-white text-center">
          إجتياز الإختبار
        </Text>
      </TouchableOpacity>
      {!hideCamera && (
        <TouchableOpacity
          className="bg-primary p-3 rounded-lg"
          onPress={onCameraPress}
        >
          <AntDesign name="camera" size={27} color={"white"} />
        </TouchableOpacity>
      )}
    </View>
  );
};
