"use client"

import { useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, Dimensions } from "react-native"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { COLORS } from "@/constants/theme"

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const cameraRef = useRef<CameraView>(null)
  const router = useRouter()

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>We need access to your camera to take food photos</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      })

      if (photo) {
        setCapturedImage(photo.uri)
      }
    } catch (error) {
      console.error("Error taking picture:", error)
      Alert.alert("Error", "Failed to take picture")
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setAnalyzing(true)

    try {
      // Convert image to base64 if needed
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const reader = new FileReader()

      reader.onloadend = async () => {
        const base64data = reader.result as string

        try {
          const aiResponse = await fetch(`${API_URL}/api/analyze-food`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64data,
            }),
          })

          if (!aiResponse.ok) {
            throw new Error("Failed to analyze image")
          }

          const result = await aiResponse.json()

          setAnalyzing(false)

          // Navigate to log meal with AI results
          router.push({
            pathname: "./(tabs)/log-meal",
            params: {
              food: result.food,
              calories: result.calories.toString(),
              confidence: result.confidence.toString(),
              photoUrl: capturedImage,
            },
          })
        } catch (error) {
          setAnalyzing(false)
          console.error("Error analyzing image:", error)
          Alert.alert("Analysis Failed", "Could not analyze the food. Would you like to log it manually?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Log Manually",
              onPress: () => router.push("./(tabs)/log-meal"),
            },
          ])
        }
      }

      reader.readAsDataURL(blob)
    } catch (error) {
      setAnalyzing(false)
      console.error("Error processing image:", error)
      Alert.alert("Error", "Failed to process image")
    }
  }

  const retake = () => {
    setCapturedImage(null)
  }

  const toggleCameraFacing = () => {
    setFacing((current: CameraType) => (current === "back" ? "front" : "back"))
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={retake}>
            <Text style={styles.backButton}>← Retake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Photo</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} resizeMode="contain" />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
            onPress={analyzeImage}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.manualButton} onPress={() => router.push("./(tabs)/log-meal")}>
            <Text style={styles.manualButtonText}>Log Manually Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Photo</Text>
        <TouchableOpacity onPress={toggleCameraFacing}>
          <Text style={styles.flipButton}>Flip</Text>
        </TouchableOpacity>
      </View>

      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.frameGuide} />
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Text style={styles.galleryButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#000",
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  flipButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frameGuide: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 3,
    borderColor: "rgba(16, 185, 129, 0.6)",
    borderRadius: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: "#000",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
  },
  galleryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  galleryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholder: {
    width: 80,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  actions: {
    padding: 20,
    gap: 12,
    backgroundColor: "#000",
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  manualButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  manualButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
