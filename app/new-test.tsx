import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Patient, Test, TestResults } from "@/types";
import HeadPage from "@/components/HeadPage";
import { criteria, explanations } from "@/lib/test";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { calculateAge, getClosestMentalAge, handleInsert, handleUpdate } from "@/lib/utils";
import { useTests } from "@/context/TestsProvider";

export default function NewTest() {
  const { item }: { item: string } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const [seeResut, setSeeResult] = useState(false);
  const { tests, fetchTests, loading: testLoading } = useTests();
  const [loading, setLoading] = useState<boolean>(false);
  const [test, setTest] = useState<Test | undefined>(undefined);
  const [result, setResult] = useState<TestResults | undefined>(undefined);

  useEffect(() => {
    const patientData = JSON.parse(item);
    setPatient(patientData);
    const testData = tests.find((t) => t.patient === patientData?.id);
    setTest(testData);
  }, [item, tests, testLoading]);

  const handleScoreChange = (index: number, value: number) => {
    setScores((prevScores) => ({ ...prevScores, [index]: value }));
  };

  const calculateScore = () => {
    // if (Object.keys(scores).length = 0) {
    //   return 0
    // }
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSave = async () => {
    if (!patient) return;

    setLoading(true);
    const formData = new FormData();

    try {
      const isNewTest = !test;

      formData.append("id", isNewTest ? new Date().toISOString() : test!.id);
      formData.append("patient", isNewTest ? patient.id : test!.patient);
      formData.append("result", result?.rawScore.toString()!);
      formData.append("date", new Date().toISOString());
      formData.append("image", test?.image || "");
      const fetchResult = isNewTest
        ? await handleInsert(formData)
        : await handleUpdate(formData);
      if (fetchResult) {
        fetchTests();
      }
    } catch (error) {
      console.error("Error saving test:", error);
    } finally {
      setLoading(false);
    }
  };


  const getResult = () => {
    const rawScore = Math.round(calculateScore());
    const mentalAge = getClosestMentalAge(rawScore);
    const chronologicalAge = calculateAge(new Date(patient?.birthday!), true);
    const iq = Math.round((mentalAge / chronologicalAge) * 100);
    const explanation = explanations.find((e) => iq > e.min && iq <= e.max)
      ?.exp!;
    setResult({
      rawScore,
      mentalAge,
      chronologicalAge,
      iq,
      explanation,
    });
    setSeeResult(true);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{ flex: 1, direction: "rtl" }}
    >
      <HeadPage title="إختبار رسم الرجل" />
      {seeResut ? (
        <ScrollView className="flex-1 w-full p-4">
          <Text className="font-mbold text-2xl text-primary-600 text-center">
            نتائج الإختبار لـ : {patient?.lname} {patient?.fname}
          </Text>
          <View className="bg-primary-50 rounded-lg p-4 my-10 justify-center items-center gap-4">
            <Text className="text-4xl font-mbold text-primary-600">
              {" "}
              {result?.iq}
            </Text>
            <Text className="text-2xl font-msemibold text-gray-700">
              {result?.explanation}
            </Text>
          </View>
          <Text className="text-2xl font-mbold text-gray-700 mb-4">
            تفاصيل النتائج :
          </Text>
          <View className="gap-3">
            {/* Raw Score */}
            <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded">
              <View className="flex-row items-center gap-2 w-1/2">
                <MaterialCommunityIcons
                  name="numeric"
                  size={24}
                  color="#4F46E5"
                />
                <Text className="text-textColor-sec text-xl font-mmedium ml-2">
                  الدرجة الخام :
                </Text>
              </View>
              <Text className="text-textColor text-xl font-msemibold w-1/2">
                {result?.rawScore}
              </Text>
            </View>

            {/* Mental Age */}
            <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded">
              <View className="flex-row items-center gap-2 w-1/2">
                <MaterialCommunityIcons
                  name="brain"
                  size={24}
                  color="#E63946"
                />
                <Text className="text-textColor-sec text-xl font-mmedium ml-2">
                  العمر العقلي :
                </Text>
              </View>
              <Text className="text-textColor text-xl font-msemibold w-1/2">
                {result?.mentalAge}
              </Text>
            </View>

            {/* Chronological Age */}
            <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded">
              <View className="flex-row items-center gap-2 w-1/2">
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color="#1D3557"
                />
                <Text className="text-textColor-sec text-xl font-mmedium ml-2">
                  العمر الزمني :
                </Text>
              </View>
              <Text className="text-textColor text-xl font-msemibold w-1/2">
                {result?.chronologicalAge} شهر
              </Text>
            </View>

            {/* IQ Score */}
            <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded">
              <View className="flex-row items-center gap-2 w-1/2">
                <MaterialCommunityIcons
                  name="calculator"
                  size={24}
                  color="#F4A261"
                />
                <Text className="text-textColor-sec text-xl font-mmedium ml-2">
                  حاصل الذكاء :
                </Text>
              </View>
              <Text className="text-textColor text-xl font-msemibold w-1/2">
                {`(${result?.mentalAge} ÷ ${result?.chronologicalAge}) × 100 = ${result?.iq}`}
              </Text>
            </View>

            {/* Interpretation */}
            <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded">
              <View className="flex-row items-center gap-2 w-1/2">
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color="#F77F00"
                />
                <Text className="text-textColor-sec text-xl font-mmedium ml-2">
                  التفسير :
                </Text>
              </View>
              <Text className="text-textColor text-xl font-msemibold w-1/2">
                {result?.explanation}
              </Text>
            </View>
            <View className="mt-10 gap-3">
              <TouchableOpacity
                className="bg-primary-400 p-4 w-full rounded-lg flex-row items-center gap-4 justify-center"
                onPress={handleSave}
              >
                {loading ? (
                  <ActivityIndicator color={"white"} />
                ) : (
                  <>
                    <AntDesign name="check" size={24} color="white" />
                    <Text className="text-white font-msemibold text-2xl">
                      حفظ النتيجة
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-200 p-4 w-full rounded-lg flex-row items-center gap-4 justify-center"
                onPress={() => setSeeResult(false)}
              >
                <AntDesign name="back" size={24} color="#666" />
                <Text className="text-textColor-sec font-msemibold text-2xl">
                  العودة للإختبار
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={criteria}
          keyExtractor={(_, index) => index.toString()}
          className="px-4"
          ListHeaderComponent={() => (
            <View className="p-4">
              <Text className="font-mbold text-2xl text-primary-600 text-center">
                إختبار المريض : {patient?.fname}
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <View className="flex-row justify-between items-center my-2 p-2 border-b border-gray-300">
              <Text className="text-lg flex-1 font-msemibold ml-2">
                {index + 1} - {item}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => handleScoreChange(index, 1)}
                  className={`px-4 py-2 mx-1 rounded ${
                    scores[index] === 1 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white font-bold">1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleScoreChange(index, 0)}
                  className={`px-4 py-2 mx-1 rounded ${
                    scores[index] === 0 ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white font-bold">0</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity
              className="my-6 p-4 bg-primary rounded-lg"
              onPress={getResult}
            >
              <Text className="text-center font-msemibold text-2xl text-white">
                عرض النتيجة النهائية
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
