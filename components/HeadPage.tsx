import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { delete_patient_api } from "../lib/api";
import { usePatients } from "../context/PatientsProvider";
import { Patient } from "../types";

export default function HeadPage({
  title,
  patient,
}: {
  title: string;
  patient?: Patient;
}) {
  const [loading, setLoading] = useState(false);
  const { fetchPatients } = usePatients();
  const deletePatient = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id", patient?.id!);
    try {
      const response = await fetch(delete_patient_api, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.result == "success") {
        fetchPatients();
        Alert.alert("نجاح", data.msg);
        return router.replace("/");
      }
      Alert.alert("خطأ", data.msg);
    } catch (error) {
      Alert.alert("خطأ", "فشل الحذف, الرجاء إعادة المحاولة");
    }
  };
  return (
    <View className="flex-row items-center bg-primary-50 justify-between px-4 py-3 pt-14 border-b border-primary-200">
      <View className="flex-row items-center justify-center">
        <Text className="text-textColor text-2xl font-mbold">{title}</Text>
      </View>
      <View className="flex-row gap-4">
        {patient && (
          <>
            <TouchableOpacity onPress={deletePatient}>
              {loading ? (
                <ActivityIndicator color={"red"} size={"small"} />
              ) : (
                <AntDesign name="delete" size={24} color="red" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/edit-patient",
                  params: { item: JSON.stringify(patient) },
                })
              }
            >
              <AntDesign name="edit" size={24} color="green" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
