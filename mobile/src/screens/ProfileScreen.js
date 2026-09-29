import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';

import { COLORS } from '../theme/colors';

import { auth, db } from '../services/firebase';

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { signOut } from 'firebase/auth';

import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';

const CLOUDINARY_CLOUD_NAME = 'dckfcqiet';
const CLOUDINARY_UPLOAD_PRESET = 'techsutra_profile';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({
    name: 'Member',
    role: 'member',
    email: '',
    memberId: '',
    photoURL: '',
  });

  const [loggingOut, setLoggingOut] = useState(false);
  const [changingPhoto, setChangingPhoto] =
    useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          return;
        }

        const userRef = doc(
          db,
          'users',
          user.uid
        );

        const userSnapshot =
          await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData =
            userSnapshot.data();

          setUserProfile({
            name:
              userData.name ||
              'Member',

            role:
              userData.role ||
              'member',

            email:
              userData.email ||
              user.email ||
              '',

            memberId:
              userData.memberId ||
              '',

            photoURL:
              userData.photoURL ||
              '',
          });
        }
      } catch (error) {
        console.log(
          'Error loading profile:',
          error
        );
      }
    };

    loadUserProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) {
      return 'M';
    }

    const words =
      name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getRoleText = () => {
    if (
      userProfile.role ===
      'president'
    ) {
      return 'TechSutra Club President';
    }

    return 'TechSutra Club Member';
  };

  const uploadToCloudinary = async (
    image
  ) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        'User is not logged in.'
      );
    }

    if (!image?.uri) {
      throw new Error(
        'Image URI is missing.'
      );
    }

    console.log(
      'Starting Cloudinary upload...'
    );

    console.log(
      'Image URI:',
      image.uri
    );

    const uploadUrl =
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    /*
     * Fetch the local image URI and
     * convert it into a Blob.
     *
     * This avoids the unsupported
     * FormDataPart error.
     */

    const imageResponse =
      await fetch(image.uri);

    if (!imageResponse.ok) {
      throw new Error(
        'Unable to read the selected image.'
      );
    }

    const imageBlob =
      await imageResponse.blob();

    console.log(
      'Image converted to Blob.'
    );

    const formData =
      new FormData();

    formData.append(
      'file',
      imageBlob,
      `profile-${user.uid}.jpg`
    );

    formData.append(
      'upload_preset',
      CLOUDINARY_UPLOAD_PRESET
    );

    formData.append(
      'folder',
      'techsutra/profile_pictures'
    );

    console.log(
      'Uploading image to Cloudinary...'
    );

    const response =
      await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

    const responseText =
      await response.text();

    console.log(
      'Cloudinary response:',
      responseText
    );

    let result;

    try {
      result =
        JSON.parse(responseText);
    } catch (error) {
      throw new Error(
        'Cloudinary returned an invalid response.'
      );
    }

    if (!response.ok) {
      console.log(
        'Cloudinary upload error:',
        result
      );

      throw new Error(
        result?.error?.message ||
          'Cloudinary upload failed.'
      );
    }

    if (!result.secure_url) {
      throw new Error(
        'Cloudinary did not return an image URL.'
      );
    }

    console.log(
      'Cloudinary upload successful.'
    );

    console.log(
      'Secure URL:',
      result.secure_url
    );

    return result.secure_url;
  };

  const handleChangePhoto = async () => {
    if (changingPhoto) {
      return;
    }

    try {
      setChangingPhoto(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error(
          'You are not logged in. Please login again.'
        );
      }

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to choose a profile picture.'
        );

        setChangingPhoto(false);
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
          }
        );

      if (result.canceled) {
        setChangingPhoto(false);
        return;
      }

      const selectedImage =
        result.assets?.[0];

      if (!selectedImage?.uri) {
        throw new Error(
          'Unable to get the selected image.'
        );
      }

      console.log(
        'Selected image:',
        selectedImage
      );

      Alert.alert(
        'Uploading Photo',
        'Your profile picture is being uploaded. Please wait.'
      );

      /*
       * STEP 1
       * Upload image to Cloudinary
       */

      const photoURL =
        await uploadToCloudinary(
          selectedImage
        );

      console.log(
        'Cloudinary photo URL:',
        photoURL
      );

      /*
       * STEP 2
       * Save Cloudinary URL in Firestore
       */

      const userRef = doc(
        db,
        'users',
        user.uid
      );

      await updateDoc(
        userRef,
        {
          photoURL: photoURL,
          photoUpdatedAt:
            serverTimestamp(),
        }
      );

      console.log(
        'Profile photo URL saved to Firestore.'
      );

      /*
       * STEP 3
       * Update UI immediately
       */

      setUserProfile(
        (previous) => ({
          ...previous,
          photoURL: photoURL,
        })
      );

      Alert.alert(
        'Profile Picture Updated',
        'Your profile picture has been uploaded successfully.'
      );
    } catch (error) {
      console.log(
        'Profile picture upload error:',
        error
      );

      Alert.alert(
        'Upload Failed',
        error?.message ||
          'Unable to upload profile picture. Please try again.'
      );
    } finally {
      setChangingPhoto(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout from TechSutra Link?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      setLoggingOut(true);

      /*
       * STEP 1
       * Sign out from Firebase Authentication.
       */

      await signOut(auth);

      /*
       * STEP 2
       * Sign out from Google ONLY during
       * an explicit TechSutra logout.
       *
       * We do NOT call this when opening
       * the app or before Google login.
       *
       * Therefore the Google account chooser
       * appears after logout, but not on every
       * Google authentication attempt.
       */

      try {
        await GoogleSignin.signOut();

        console.log(
          'Google account signed out successfully.'
        );
      } catch (googleError) {
        /*
         * Google sign-out failure should not
         * prevent Firebase logout.
         */

        console.log(
          'Google sign-out error:',
          googleError
        );
      }

      /*
       * STEP 3
       * Return to Login screen.
       *
       * Profile is inside:
       *
       * Main
       *   └── MainTabs
       *        └── Profile
       *
       * Therefore we go up two navigation
       * levels before replacing Login.
       */

      navigation
        .getParent()
        ?.getParent()
        ?.replace('Login');
    } catch (error) {
      console.log(
        'Logout error:',
        error
      );

      Alert.alert(
        'Logout Failed',
        'Unable to logout. Please try again.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.heading}>
          Profile
        </Text>

        <View style={styles.profileCard}>
          <Pressable
            style={styles.avatar}
            onPress={handleChangePhoto}
            disabled={changingPhoto}
          >
            {changingPhoto ? (
              <ActivityIndicator
                size="small"
                color={COLORS.navy}
              />
            ) : userProfile.photoURL ? (
              <Image
                source={{
                  uri: userProfile.photoURL,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <Text
                style={styles.avatarText}
              >
                {getInitials(
                  userProfile.name
                )}
              </Text>
            )}

            {!changingPhoto && (
              <View
                style={styles.cameraBadge}
              >
                <Ionicons
                  name="camera-outline"
                  size={14}
                  color={COLORS.navy}
                />
              </View>
            )}
          </Pressable>

          <Text style={styles.photoHint}>
            Tap photo to change
          </Text>

          <Text style={styles.name}>
            {userProfile.name}
          </Text>

          <Text style={styles.role}>
            {getRoleText()}
          </Text>

          <Text
            style={styles.university}
          >
            MUIT, Lucknow
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat
            value="78%"
            label="Attendance"
            icon="checkmark-circle-outline"
          />

          <Stat
            value="12"
            label="Events"
            icon="calendar-outline"
          />

          <Stat
            value="2026"
            label="Member Since"
            icon="person-outline"
          />
        </View>

        <View style={styles.menu}>
          <MenuItem
            title="My Attendance"
            icon="checkmark-circle-outline"
          />

          <MenuItem
            title="My Events"
            icon="calendar-outline"
          />

          <MenuItem
            title="Notifications"
            icon="notifications-outline"
          />

          <MenuItem
            title="Settings"
            icon="settings-outline"
          />

          <MenuItem
            title="About TechSutra"
            icon="information-circle-outline"
          />
        </View>

        <Pressable
          style={[
            styles.logoutButton,
            loggingOut &&
              styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator
              size="small"
              color={COLORS.danger}
            />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={19}
                color={COLORS.danger}
              />

              <Text
                style={styles.logoutText}
              >
                Logout
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({
  value,
  label,
  icon,
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={18}
        color={COLORS.goldDark}
        style={styles.statIcon}
      />

      <Text
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    </View>
  );
}

function MenuItem({
  title,
  icon,
}) {
  return (
    <Pressable
      style={styles.menuItem}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Ionicons
            name={icon}
            size={19}
            color={COLORS.navy}
          />
        </View>

        <Text
          style={styles.menuTitle}
        >
          {title}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={COLORS.textLight}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },

  heading: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 25,
  },

  profileCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 28,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },

  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 38,
  },

  avatarText: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: '800',
  },

  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.navy,
  },

  photoHint: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 8,
  },

  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },

  role: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },

  university: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 4,
  },

  stats: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 15,
    paddingVertical: 18,
    flexDirection: 'row',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statIcon: {
    marginBottom: 5,
  },

  statValue: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },

  menu: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 15,
    overflow: 'hidden',
  },

  menuItem: {
    minHeight: 55,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  menuTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  logoutButton: {
    height: 55,
    marginTop: 15,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButtonDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});