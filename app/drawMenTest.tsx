import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import HeadPage from "@/components/HeadPage";
import type { Patient, Test, TestResults } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { useTests } from "@/context/TestsProvider";
import {
  calculateAge,
  getClosestMentalAge,
  getLocalizedFullDate,
  handleInsert,
  handleUpdate,
} from "@/lib/utils";
import ImageViewer from "react-native-image-zoom-viewer";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { explanations } from "@/lib/test";

const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Replace with your Cloudinary preset
const CLOUDINARY_CLOUD_NAME = "dbticypnb";

export default function drawMenTest() {
  const { item }: { item: string } = useLocalSearchParams();
  const { tests, fetchTests, loading: testLoading } = useTests();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSaveImg, setLoadingSaveImg] = useState<boolean>(false);
  const [loadingDR, setLoadingDR] = useState<boolean>(false);
  const [test, setTest] = useState<Test | undefined>(undefined);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [result, setResult] = useState<TestResults | undefined>(undefined);

  const handleImagePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };
  const getResult = () => {
    const rawScore = test?.result!;
    const birthday = new Date(patient?.birthday!);

    const mentalAge = getClosestMentalAge(rawScore);
    const chronologicalAge = calculateAge(birthday, true); // Ensured valid date
    const iq = Math.round((mentalAge / chronologicalAge) * 100);

    const explanation =
      explanations.find((e) => iq > e.min && iq <= e.max)?.exp ||
      "No explanation available";

    setResult({
      rawScore,
      mentalAge,
      chronologicalAge,
      iq,
      explanation,
    });
  };

  useEffect(() => {
    getResult();
  }, [item, patient, test]);

  useEffect(() => {
    const patientData = JSON.parse(item);
    setPatient(patientData);
    const testData = tests.find((t) => t.patient === patientData?.id);
    setTest(testData);
  }, [item, tests, testLoading]);

  const handleCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("الإذن مرفوض", "يجب منح إذن الوصول إلى الكاميرا.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCapturedImage(`data:image/jpg;base64,${result.assets[0].base64!}`);
    } else {
      console.log("No image captured");
    }
  };

  const ageInYears = calculateAge(new Date(patient?.birthday!), false);
  const ageInMonths = calculateAge(new Date(patient?.birthday!), true);

  const handleSave = async (deleteImage: boolean = false) => {
    if (!patient) return;

    setLoading(true);
    const formData = new FormData();

    try {
      const isNewTest = !test;

      formData.append("id", isNewTest ? new Date().toString() : test!.id);
      formData.append("patient", isNewTest ? patient.id : test!.patient);
      formData.append("result", isNewTest ? "" : test!.result.toString());
      formData.append("date", new Date().toString());

      if (!deleteImage && capturedImage) {
        let apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        let data = new FormData();
        data.append("file", {
          uri: capturedImage,
          type: "image/jpeg",
          name: "upload.jpg",
        } as any);
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            body: data,
          });

          const dataImg = await response.json();

          if (dataImg.secure_url) {
            formData.append("image", dataImg.secure_url);
          } else {
            throw new Error("Image upload failed");
          }
        } catch (err) {
          Alert.alert("فشل التحميل", "تعذر تحميل الصورة إلى Cloudinary.");
          return;
        }
      } else {
        formData.append("image", "");
      }

      // ✅ Now we save the test after ensuring the image is uploaded
      const result = isNewTest
        ? await handleInsert(formData)
        : await handleUpdate(formData);

      if (result) {
        fetchTests();
        setCapturedImage("");
      }
    } catch (error) {
      console.error("Error saving test:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async () => {
    if (!patient) return;

    setLoadingDR(true);
    const formData = new FormData();

    try {
      formData.append("id", test!.id);
      formData.append("patient", test!.patient);
      formData.append("result", "");
      formData.append("date", new Date().toString());
      formData.append("image", test?.image!);

      // ✅ Now we save the test after ensuring the image is uploaded
      const result = await handleUpdate(formData);
      if (result) {
        fetchTests();
        Alert.alert("نجاح", "تم حذف النتائج بنجاح");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
    } finally {
      setLoadingDR(false);
    }
  };

  const saveImageToGallery = async (imageUrl: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("الإذن مرفوض", "يجب منح إذن الوصول إلى المعرض.");
      return;
    }
    setLoadingSaveImg(true);
    try {
      // 1️⃣ Define local file path
      const fileUri = FileSystem.documentDirectory + "downloaded_image.jpg";

      // 2️⃣ Download the image from Cloudinary
      const downloadObject = await FileSystem.downloadAsync(imageUrl, fileUri);
      if (downloadObject.status !== 200) {
        throw new Error("فشل تحميل الصورة");
      }

      // 3️⃣ Save downloaded image to gallery
      await MediaLibrary.saveToLibraryAsync(downloadObject.uri);
      Alert.alert("تم الحفظ", "تم حفظ الصورة في المعرض بنجاح.");
    } catch (error) {
      console.error("Error saving image to gallery:", error);
      Alert.alert("خطأ", "تعذر حفظ الصورة في المعرض.");
    } finally {
      setLoadingSaveImg(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ direction: "rtl" }}>
      <HeadPage
        title={`إختبار رسم الرجل`}
      />
      <ImageBackground
        source={require("@/assets/images/chat.png")}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.2 }}
      >
        <ScrollView>
        <View className="bg-primary-50/70 rounded-lg p-6 mb-6 m-4">
          <View className="flex items-center justify-center gap-2 flex-row mb-4">
            <FontAwesome5 name="user-circle" size={24} color="#2A9D8F" />
            <Text className="text-3xl font-mbold text-center">
              المعلومات الشخصية
            </Text>
          </View>
          <View className="gap-2">
            <InfoItem
              label="الاسم"
              value={`${patient?.fname} ${patient?.lname}`}
              icon="user"
            />
            <InfoItem
              label="تاريخ الميلاد"
              value={getLocalizedFullDate(patient?.birthday!)}
              icon="calendar-alt"
            />
            <InfoItem
              label="الجنس"
              value={patient?.gender === "M" ? "ذكر" : "أنثى"}
              icon={patient?.gender === "M" ? "male" : "female"}
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
        </View>
          {testLoading && (
            <View className="flex-1 justify-center items-center pt-24">
              <ActivityIndicator size={"large"} color={"#195E55"} />
            </View>
          )}
          {!testLoading && (
            <>
              {test && (
                <Text className="mx-auto text-center mt-4 mb-2 font-mmedium text-xl text-textColor">
                  آخر تحديث : {getLocalizedFullDate(test.date)}
                </Text>
              )}
              <View className="flex-1 w-full px-4 items-center justify-center gap-4 mx-auto bg-primary-50/20 py-8">
                {!test?.result ? (
                  <Text className="text-3xl font-mbold text-center">
                    لم يقم بإجتياز الإختبار بعد
                  </Text>
                ) : (
                  <View className="w-full gap-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-2xl font-msemibold mb-2">
                        نتائج الإختبار:
                      </Text>
                      <TouchableOpacity
                        className="bg-red-100 p-2 rounded-full"
                        onPress={() => {
                          Alert.alert(
                            "تأكيد الحذف",
                            "هل أنت متأكد أنك تريد حذف هذه النتائج؟",
                            [
                              { text: "إلغاء", style: "cancel" },
                              {
                                text: "حذف",
                                onPress: async () => {
                                  await handleDeleteResult();
                                },
                              },
                            ]
                          );
                        }}
                      >
                        {loadingDR ? (
                          <ActivityIndicator color={"red"} size={"small"} />
                        ) : (
                          <AntDesign name="delete" size={28} color="red" />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View className="bg-primary-50/70">
                      {/* Raw Score */}
                      <View className="flex-row justify-between items-center p-3 rounded">
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
                          {result!?.rawScore}
                        </Text>
                      </View>

                      {/* Mental Age */}
                      <View className="flex-row justify-between items-center p-3 rounded">
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
                          {result!?.mentalAge}
                        </Text>
                      </View>

                      {/* Chronological Age */}
                      <View className="flex-row justify-between items-center p-3 rounded">
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
                          {result!?.chronologicalAge} شهر
                        </Text>
                      </View>

                      {/* IQ Score */}
                      <View className="flex-row justify-between items-center p-3 rounded">
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
                          {`(${result!?.mentalAge} ÷ ${
                            result!?.chronologicalAge
                          }) × 100 = ${result!?.iq}`}
                        </Text>
                      </View>

                      {/* Interpretation */}
                      <View className="flex-row justify-between items-center p-3 rounded">
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
                          {result!?.explanation}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                <View className=" w-[260px]">
                  <Actions
                    onCameraPress={handleCapture}
                    hideCamera={!!test?.image}
                    patient={patient!}
                    hideBtn={!!test?.result}
                  />
                </View>
                {capturedImage && !test?.image && (
                  <View className="w-full flex items-center justify-center gap-4">
                    <Text className="text-xl font-msemibold mb-2">
                      الصورة الملتقطة:
                    </Text>
                    <Image
                      source={{
                        uri: capturedImage,
                      }}
                      resizeMode="contain"
                      className="w-[228px] h-[500px] border-primary border-4 rounded-lg"
                    />
                    <TouchableOpacity
                      className="bg-primary p-3 rounded-lg w-1/2"
                      onPress={async () => await handleSave()}
                    >
                      {loading ? (
                        <ActivityIndicator color={"white"} />
                      ) : (
                        <Text className="text-xl font-mmedium text-white text-center">
                          حفظ الصورة
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                {test && test?.image && (
                  <View className="w-full gap-4">
                    <Text className="text-2xl font-msemibold mb-2">
                      الصورة الملتقطة:
                    </Text>
                    <View className="flex-row gap-4">
                      <TouchableOpacity onPress={handleImagePress}>
                        <Image
                          source={{ uri: test.image }}
                          resizeMode="contain"
                          className="w-[228px] h-[500px] border-primary border-4 rounded-lg"
                        />
                      </TouchableOpacity>
                      <View className="gap-4 items-center">
                        <TouchableOpacity
                          className="bg-primary-100 p-2 rounded-full"
                          onPress={() => {
                            if (test?.image) {
                              saveImageToGallery(test.image);
                            } else {
                              Alert.alert("خطأ", "لا توجد صورة متاحة للحفظ.");
                            }
                          }}
                        >
                          {loadingSaveImg ? (
                            <ActivityIndicator
                              color={"#195E55"}
                              size={"small"}
                            />
                          ) : (
                            <AntDesign
                              name="download"
                              size={28}
                              color="#195E55"
                            />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-red-100 p-2 rounded-full"
                          onPress={() => {
                            Alert.alert(
                              "تأكيد الحذف",
                              "هل أنت متأكد أنك تريد حذف هذه الصورة؟",
                              [
                                { text: "إلغاء", style: "cancel" },
                                {
                                  text: "حذف",
                                  onPress: async () => {
                                    await handleSave(true);
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          {loading ? (
                            <ActivityIndicator color={"red"} size={"small"} />
                          ) : (
                            <AntDesign name="delete" size={28} color="red" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </ImageBackground>
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 30,
            right: 30,
            zIndex: 1,
          }}
          onPress={handleCloseModal}
        >
          <AntDesign name="closecircle" size={40} color="white" />
        </TouchableOpacity>

        <ImageViewer
          imageUrls={[
            {
              url: test?.image!,
              props: {
                resizeMode: "contain",
              },
            },
          ]}
          enableSwipeDown={true}
          onSwipeDown={handleCloseModal}
          // renderIndicator={() => null}
        />
      </Modal>
    </SafeAreaView>
  );
}

const Actions = ({
  onCameraPress,
  hideCamera,
  hideBtn,
  patient,
}: {
  onCameraPress: () => void;
  hideCamera: boolean;
  hideBtn: boolean;
  patient: Patient;
}) => {
  return (
    <View className="flex-row gap-1 items-center">
      {!hideBtn && (
        <TouchableOpacity
          className="bg-primary p-3 flex-1 rounded-lg"
          onPress={() =>
            router.push({
              pathname: "/new-test",
              params: { item: JSON.stringify(patient) },
            })
          }
        >
          <Text className="text-2xl font-mmedium text-white text-center">
            إجتياز الإختبار
          </Text>
        </TouchableOpacity>
      )}
      {!hideCamera && (
        <TouchableOpacity
          className="bg-primary p-3 rounded-lg flex-row items-center gap-3"
          onPress={onCameraPress}
        >
          <AntDesign name="camera" size={27} color={"white"} />
          {hideBtn && (
            <Text className="text-2xl text-white font-msemibold">
              إلتقاط صورة
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};


const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) => (
  <View className="flex-row justify-between items-center">
    <View className="flex-row items-center gap-2">
      <FontAwesome5 name={icon} size={16} color="#2A9D8F" />
      <Text className="text-xl font-mmedium">{label}:</Text>
    </View>
    <Text className="text-lg font-msemibold text-primary-800">{value}</Text>
  </View>
);
