import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import type { Patient } from "../types";
import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import HeadPage from "@/components/HeadPage";
import { usePatients } from "@/context/PatientsProvider";
import { add_patient_api } from "@/lib/api";
import { calculateAge } from "@/lib/utils";

export default function NewPatient() {
  const [patient, setPatient] = useState<Partial<Patient>>({
    fname: "",
    lname: "",
    birthday: undefined,
    gender: undefined,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { patients, fetchPatients } = usePatients();

  const addPatient = async () => {
    if (
      !patient.fname ||
      !patient.lname ||
      !patient.birthday ||
      !patient.gender
    ) {
      return Alert.alert("انتبه", "جميع الخانات مطلوبة !");
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("id", new Date().toString());
    formData.append("fname", patient.fname);
    formData.append("lname", patient.lname);
    formData.append("birthday", patient.birthday.toString());
    formData.append("gender", patient.gender);
    try {
      const response = await fetch(add_patient_api, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        Alert.alert("فشل", "فشل إضافة المستخدم");
      }
      const data = await response.json();
      Alert.alert("نجاح", data.msg);
      setPatient({
        fname: "",
        lname: "",
        birthday: undefined,
        gender: undefined,
      });
      fetchPatients();
    } catch (error) {
      Alert.alert("فشل", "فشل إضافة المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || patient.birthday;
    setShowDatePicker(false);
    setPatient((prev) => ({ ...prev, birthday: currentDate }));
  };

  return (
    <ScrollView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <HeadPage title="إضافة مريض جديد" />

      <View className="bg-white p-4 py-24">
        <View className="gap-4">
          <View>
            <Text className="text-xl font-mmedium text-textColor mb-1">
              الاسم
            </Text>
            <TextInput
              value={patient.fname}
              onChangeText={(text) =>
                setPatient((prev: Partial<Patient>) => ({
                  ...prev,
                  fname: text,
                }))
              }
              placeholder="ما إسم المريض ؟"
              className="bg-primary-50/20 p-4 rounded-lg text-lg border border-primary-200 text-textColor font-mregular"
              placeholderTextColor="#64748b"
            />
          </View>

          <View>
            <Text className="text-xl font-mmedium text-textColor mb-1">
              اللقب
            </Text>
            <TextInput
              value={patient.lname}
              onChangeText={(text) =>
                setPatient((prev: Partial<Patient>) => ({
                  ...prev,
                  lname: text,
                }))
              }
              placeholder="ما لقب المريض ؟"
              className="bg-primary-50/20 p-4 rounded-lg text-lg border border-primary-200 text-textColor font-mregular"
              placeholderTextColor="#64748b"
            />
          </View>

          <View>
            <Text className="text-xl font-mmedium text-textColor mb-1">
              تاريخ الميلاد
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-primary-50/20 p-4 rounded-lg text-lg border border-primary-200"
            >
              <Text className="text-textColor font-mregular text-lg">
                {patient.birthday?.toLocaleDateString("ar-DZ") ||
                  "اختر التاريخ"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={patient.birthday || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            {patient.birthday && (
              <Text className="font-mmedium mt-2">
                عمر المريض هو {calculateAge(patient.birthday, true)} شهرا ||{" "}
                {calculateAge(patient.birthday, false)} سنة
              </Text>
            )}
          </View>

          <View>
            <Text className="text-xl font-mmedium text-textColor mb-2">
              الجنس
            </Text>
            <View className="flex-row justify-around">
              <TouchableOpacity
                onPress={() =>
                  setPatient((prev: Partial<Patient>) => ({
                    ...prev,
                    gender: "M",
                  }))
                }
                className={`py-3 px-8 rounded-lg ${
                  patient.gender === "M" ? "bg-primary-500" : "bg-primary-100"
                }`}
              >
                <Text
                  className={`font-msemibold text-lg ${
                    patient.gender === "M" ? "text-white" : "text-textColor"
                  }`}
                >
                  ذكر
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setPatient((prev: Partial<Patient>) => ({
                    ...prev,
                    gender: "F",
                  }))
                }
                className={`py-3 px-8 rounded-lg ${
                  patient.gender === "F" ? "bg-primary-500" : "bg-primary-100"
                }`}
              >
                <Text
                  className={`font-msemibold text-lg ${
                    patient.gender === "F" ? "text-white" : "text-textColor"
                  }`}
                >
                  أنثى
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={addPatient}
          className="bg-primary-500 py-4 px-6 rounded-lg mt-8"
        >
          {loading ? (
            <ActivityIndicator size={28} color={"white"} />
          ) : (
            <Text className="text-white font-mbold text-center text-2xl">
              إضافة المريض
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
