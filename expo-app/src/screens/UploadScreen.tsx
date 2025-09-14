import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, TextInput, Switch, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const UploadScreen = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [description, setDescription] = useState('');
  const [isSentimental, setIsSentimental] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('Please select at least one image.');
      return;
    }
    setLoading(true);

    // 1. Create the item record first
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 60); // Default 60 day expiry

    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .insert({
        created_by: user!.id,
        description,
        is_sentimental,
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single();

    if (itemError || !itemData) {
      console.error('Error creating item:', itemError);
      alert('Failed to create item.');
      setLoading(false);
      return;
    }

    const itemId = itemData.id;

    // 2. Upload images and run AI tagging
    // In a real app, you might want to show progress for each image.
    try {
      const uploadedImagePaths: { path: string }[] = [];

      for (const image of images) {
        // Compress image
        const manipResult = await ImageManipulator.manipulateAsync(
          image.uri,
          [{ resize: { width: 1200 } }], // Resize to max 1200px width
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Get signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabase.functions.invoke('get_signed_upload_url', {
          body: { filename: manipResult.uri.split('/').pop() }
        });
        if (signedUrlError) throw signedUrlError;

        // Upload to storage
        const fileBody = await (await fetch(manipResult.uri)).blob();
        const { error: uploadError } = await supabase.storage
          .from('item-raw')
          .upload(signedUrlData.path, fileBody, {
            contentType: 'image/jpeg',
            upsert: false,
          });
        if (uploadError) throw uploadError;

        uploadedImagePaths.push({ path: signedUrlData.path });

        // Create image record in DB
        await supabase.from('images').insert({
          item_id: itemId,
          created_by: user!.id,
          storage_path_raw: signedUrlData.path,
        });
      }

      // 3. Trigger AI tagging
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai_tag_items', {
        body: { item_id: itemId, images: uploadedImagePaths }
      });
      if (aiError) console.error("AI tagging failed, but item was created.", aiError);

      alert('Item uploaded successfully! AI is processing the images.');
      // TODO: Navigate away or clear form

    } catch (error) {
      console.error('Upload process failed:', error);
      alert(`Upload failed: ${error.message}`);
      // TODO: Add cleanup logic here, e.g., delete the created item if uploads fail.
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Upload New Item</Text>

      <Button title="Pick Images from Gallery" onPress={pickImage} color="#FFD700" />

      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image.uri }} style={styles.thumbnail} />
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#8892B0"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Is this item sentimental?</Text>
        <Switch
          value={isSentimental}
          onValueChange={setIsSentimental}
          trackColor={{ false: "#767577", true: "#FFD700" }}
          thumbColor={isSentimental ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>

      {/* TODO: Add tag display and editing */}

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Publish Item" onPress={handleUpload} color="#FFD700" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#1D2D44',
    borderRadius: 5,
    padding: 15,
    color: '#FFFFFF',
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default UploadScreen;
