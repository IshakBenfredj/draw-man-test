import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import HeadPage from "../components/HeadPage";
import type { Patient } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Profile() {
  const router = useRouter();
  const { item }: { item: string } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const patientData = JSON.parse(item);
    setPatient(patientData);
  }, [item]);

  if (!patient) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg justify-center items-center"
        style={{ direction: "rtl" }}
      >
        <Text className="text-xl font-mbold text-white">جاري التحميل...</Text>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <HeadPage title={`${patient.fname} ${patient.lname}`} patient={patient} />
      <ScrollView className="flex-1 p-4">
        {/* <View className="bg-primary-50/70 rounded-lg p-6 mb-6">
          <View className="flex items-center justify-center gap-2 flex-row mb-4">
            <FontAwesome5 name="user-circle" size={24} color="#2A9D8F" />
            <Text className="text-3xl font-mbold text-center">
              المعلومات الشخصية
            </Text>
          </View>
          <View className="gap-2">
            <InfoItem
              label="الاسم"
              value={`${patient.fname} ${patient.lname}`}
              icon="user"
            />
            <InfoItem
              label="تاريخ الميلاد"
              value={getLocalizedFullDate(new Date(patient.birthday))}
              icon="calendar-alt"
            />
            <InfoItem
              label="الجنس"
              value={patient.gender === "M" ? "ذكر" : "أنثى"}
              icon={patient.gender === "M" ? "male" : "female"}
            />
            <InfoItem
              label="العمر بالسنوات"
              value={ageInYears.toString()}
              icon="birthday-cake"
            />
            <InfoItem
              label="العمر بالأشهر"
              value={ageInMonths.toString()}
              icon="calendar-check"
            />
          </View>
        </View> */}

        <View className="flex items-center justify-center gap-2 flex-row mb-4">
          <MaterialCommunityIcons
            name="clipboard-text"
            size={24}
            color="#2A9D8F"
          />
          <Text className="text-2xl font-mbold text-center">
            الإختبارات والمقاييس
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-between">
          <TestButton
            title="اختبار رسم الرجل"
            icon="draw"
            onPress={() =>
              router.push({
                pathname: "/drawMenTest",
                params: { item: JSON.stringify(patient) },
              })
            }
            enabled={true}
          />
          <TestButton title="مقياس جيليام" icon="chart-bar" enabled={false} />
          <TestButton title="مقیاس کارز" icon="chart-line" enabled={false} />
          <TestButton title="مقياس بيك" icon="clipboard-list" enabled={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const TestButton = ({
  title,
  icon,
  onPress,
  enabled,
}: {
  title: string;
  icon: "draw" | "chart-bar" | "chart-line" | "clipboard-list";
  onPress?: () => void;
  enabled: boolean;
}) => (
  <TouchableOpacity
    className={`p-4 rounded-lg mb-4 w-[48%] ${
      enabled ? "bg-primary" : "bg-primary-300"
    }`}
    onPress={enabled ? onPress : undefined}
    disabled={!enabled}
  >
    <View className="flex-row items-center justify-center gap-2">
      <MaterialCommunityIcons name={icon} size={20} color="white" />
      <Text className={`text-center font-mmedium text-white text-xl`}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);
