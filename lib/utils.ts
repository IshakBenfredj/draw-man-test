import { Alert } from "react-native";
import { add_test_api, update_test_api } from "./api";
import { rawScoreToMentalAge } from "./test";

export const calculateAge = (birthday: Date, inMonths: boolean): number => {
  const today = new Date();
  let years = today.getFullYear() - birthday.getFullYear();
  let months = today.getMonth() - birthday.getMonth();
  let days = today.getDate() - birthday.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  if (days < 0) {
    const daysInLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    months--;
    days += daysInLastMonth;
  }

  if (inMonths) {
    return Math.round(years * 12 + months + days / 30.44);
  } else {
    return years;
  }
};

export function getLocalizedFullDate(date?: Date): string {
  var dateToFormat;
  if (date) {
    dateToFormat = new Date(date);
  } else {
    dateToFormat = new Date();
  }

  const dateFormat = new Intl.DateTimeFormat("ar-DZ", {
    dateStyle: "full",
    timeZone: "Africa/Algiers",
  }).format(dateToFormat);

  return dateFormat;
}

export const handleInsert = async (formData: FormData) => {
  try {
    const response = await fetch(add_test_api, {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();

    if (data.result == "success") {
      Alert.alert("نجاح", "تم الحفظ بنجاح");
      return true;
    } else {
      Alert.alert("خطأ", "حدث خطأ ما أثناء الحفظ , الرجاء المحاولة مجددا");
      return false;
    }
  } catch (error) {
    Alert.alert("خطأ", "حدث خطأ ما أثناء الحفظ , الرجاء المحاولة مجددا");
    return false;
  }
};

export const handleUpdate = async (formData: FormData) => {
  try {
    const response = await fetch(update_test_api, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.result == "success") {
      Alert.alert("نجاح", "تم الحفظ بنجاح");
      return true;
    } else {
      Alert.alert("خطأ", "حدث خطأ ما أثناء الحفظ , الرجاء المحاولة مجددا");
      return false;
    }
  } catch (error) {
    Alert.alert("خطأ", "حدث خطأ ما أثناء الحفظ , الرجاء المحاولة مجددا");
    return false;
  }
};


export const getClosestMentalAge = (score: number): number => {
  const keys = Object.keys(rawScoreToMentalAge)
    .map(Number)
    .sort((a, b) => a - b); // Sort keys numerically

  const closestKey =
    keys.find((key) => key >= score) ?? keys[keys.length - 1]; // Get closest higher or last element

  return rawScoreToMentalAge[closestKey as keyof typeof rawScoreToMentalAge];
};