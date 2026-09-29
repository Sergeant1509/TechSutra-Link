import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { COLORS } from '../theme/colors';
import { auth, db } from '../services/firebase';

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '307314343238-klp92mbh23nm69q3e3he23op7m34abom.apps.googleusercontent.com',
});

export default function SignupScreen({
  navigation,
  route,
}) {
  const initialGoogleUser =
    route?.params?.googleUser || null;

  const [googleUser, setGoogleUser] =
    useState(initialGoogleUser);

  const isGoogleSignup = !!googleUser;

  const [name, setName] = useState(
    initialGoogleUser?.displayName || ''
  );

  const [email, setEmail] = useState(
    initialGoogleUser?.email || ''
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  const createMemberProfile = async ({
    user,
    profileName,
    profileEmail,
    photoURL,
    provider,
  }) => {
    const userRef = doc(db, 'users', user.uid);

    const year = new Date().getFullYear();

    /*
     * Separate counter for every year.
     *
     * Example:
     * counters/members_2026
     *
     * This generates:
     * TS-2026-0001
     * TS-2026-0002
     * TS-2026-0003
     */
    const counterRef = doc(
      db,
      'counters',
      `members_${year}`
    );

    let generatedMemberId = '';

    await runTransaction(
      db,
      async (transaction) => {
        const counterSnapshot =
          await transaction.get(counterRef);

        const existingUserSnapshot =
          await transaction.get(userRef);

        /*
         * Prevent accidentally overwriting an existing
         * TechSutra profile.
         */
        if (existingUserSnapshot.exists()) {
          throw new Error(
            'TECHSUTRA_PROFILE_ALREADY_EXISTS'
          );
        }

        const counterData =
          counterSnapshot.exists()
            ? counterSnapshot.data()
            : {};

        const storedNextId = Number(
          counterData.nextId
        );

        const nextId =
          Number.isInteger(storedNextId) &&
          storedNextId > 0
            ? storedNextId
            : 1;

        generatedMemberId =
          `TS-${year}-${String(nextId).padStart(
            4,
            '0'
          )}`;

        transaction.set(
          counterRef,
          {
            nextId: nextId + 1,
            updatedAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        transaction.set(userRef, {
          name: profileName.trim(),
          email: profileEmail.trim(),
          memberId: generatedMemberId,
          role: 'member',
          photoURL: photoURL || '',
          authProvider: provider,
          createdAt: serverTimestamp(),
        });
      }
    );

    return generatedMemberId;
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(
        'Missing Name',
        'Please enter your full name.'
      );
      return false;
    }

    if (!email.trim()) {
      Alert.alert(
        'Missing Email',
        'Please enter your email address.'
      );
      return false;
    }

    if (!isGoogleSignup) {
      if (!password) {
        Alert.alert(
          'Missing Password',
          'Please enter a password.'
        );
        return false;
      }

      if (password.length < 6) {
        Alert.alert(
          'Weak Password',
          'Password must contain at least 6 characters.'
        );
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert(
          'Password Mismatch',
          'Password and confirm password do not match.'
        );
        return false;
      }
    }

    return true;
  };

  const handleGoogleSignup = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response =
        await GoogleSignin.signIn();

      const idToken =
        response?.data?.idToken;

      if (!idToken) {
        throw new Error(
          'Google did not return an ID token.'
        );
      }

      const googleCredential =
        GoogleAuthProvider.credential(
          idToken
        );

      const userCredential =
        await signInWithCredential(
          auth,
          googleCredential
        );

      const user =
        userCredential.user;

      /*
       * Check whether this Google account already
       * has a TechSutra profile.
       */
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

        if (userData.role === 'president') {
          navigation.replace('Admin');
          return;
        }

        if (userData.role === 'member') {
          navigation.replace('Main');
          return;
        }

        throw new Error(
          'Your TechSutra profile has an invalid role. Please contact the administrator.'
        );
      }

      /*
       * No TechSutra profile exists.
       * Stay on Signup and let the user complete
       * their profile.
       */
      const profile = {
        uid: user.uid,
        email: user.email || '',
        displayName:
          user.displayName || '',
        photoURL:
          user.photoURL || '',
      };

      setGoogleUser(profile);

      setName(
        user.displayName || ''
      );

      setEmail(
        user.email || ''
      );

      Alert.alert(
        'Google Account Connected',
        'Complete your profile to create your TechSutra account.'
      );
    } catch (error) {
      console.log(
        'Google signup error:',
        error
      );

      if (
        error.code ===
        statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      if (
        error.code ===
        statusCodes.IN_PROGRESS
      ) {
        return;
      }

      if (
        error.code ===
        statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        Alert.alert(
          'Google Play Services',
          'Google Play Services is unavailable or needs to be updated.'
        );
        return;
      }

      Alert.alert(
        'Google Signup Failed',
        error.message ||
          'Unable to continue with Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (loading) return;

    if (!validateForm()) return;

    try {
      setLoading(true);

      let user;
      let provider;

      if (isGoogleSignup) {
        /*
         * Google user is already authenticated.
         */
        user = auth.currentUser;

        if (!user) {
          throw new Error(
            'Google authentication session was not found. Please continue with Google again.'
          );
        }

        provider = 'google';

        /*
         * Update display name if the user changed it.
         */
        if (
          name.trim() &&
          user.displayName !==
            name.trim()
        ) {
          await updateProfile(user, {
            displayName: name.trim(),
          });
        }
      } else {
        /*
         * Normal email/password signup.
         */
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        user = userCredential.user;

        provider = 'email';

        await updateProfile(user, {
          displayName: name.trim(),
        });
      }

      const memberId =
        await createMemberProfile({
          user,
          profileName: name,
          profileEmail:
            user.email || email,
          photoURL:
            user.photoURL || '',
          provider,
        });

      Alert.alert(
        'Account Created',
        `Welcome to TechSutra Link, ${name.trim()}!\n\nYour Member ID is:\n${memberId}`,
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.replace('Main');
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        'Signup error:',
        error
      );

      if (
        error.message ===
        'TECHSUTRA_PROFILE_ALREADY_EXISTS'
      ) {
        Alert.alert(
          'Profile Already Exists',
          'This account already has a TechSutra profile. Please login instead.',
          [
            {
              text: 'Login',
              onPress: () => {
                navigation.replace('Login');
              },
            },
          ]
        );

        return;
      }

      let message =
        'Unable to create your account. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message =
            'An account with this email already exists. Please login instead.';
          break;

        case 'auth/invalid-email':
          message =
            'Please enter a valid email address.';
          break;

        case 'auth/weak-password':
          message =
            'Password is too weak. Please use at least 6 characters.';
          break;

        case 'permission-denied':
          message =
            'Unable to save your TechSutra profile. Please try again.';
          break;

        default:
          message =
            error.message || message;
      }

      Alert.alert(
        'Account Creation Failed',
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>
            TechSutra{' '}
            <Text
              style={styles.logoGold}
            >
              Link
            </Text>
          </Text>

          <Text style={styles.welcome}>
            {isGoogleSignup
              ? 'Complete Your Profile'
              : 'Create Account'}
          </Text>

          <Text style={styles.subtitle}>
            {isGoogleSignup
              ? 'Just a few details to join TechSutra'
              : 'Join the TechSutra community'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={
              COLORS.textLight
            }
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text
            style={[
              styles.label,
              styles.fieldSpacing,
            ]}
          >
            Email Address
          </Text>

          <TextInput
            style={[
              styles.input,
              isGoogleSignup &&
                styles.disabledInput,
            ]}
            placeholder="Enter your email"
            placeholderTextColor={
              COLORS.textLight
            }
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={
              !loading &&
              !isGoogleSignup
            }
          />

          {isGoogleSignup && (
            <Text
              style={styles.helperText}
            >
              Email verified through Google
            </Text>
          )}

          {!isGoogleSignup && (
            <>
              <Text
                style={[
                  styles.label,
                  styles.fieldSpacing,
                ]}
              >
                Password
              </Text>

              <View
                style={
                  styles.passwordContainer
                }
              >
                <TextInput
                  style={
                    styles.passwordInput
                  }
                  placeholder="Create a password"
                  placeholderTextColor={
                    COLORS.textLight
                  }
                  value={password}
                  onChangeText={
                    setPassword
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  editable={!loading}
                />

                <Pressable
                  style={
                    styles.showButton
                  }
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  <Text
                    style={
                      styles.showText
                    }
                  >
                    {showPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>
                </Pressable>
              </View>

              <Text
                style={[
                  styles.label,
                  styles.fieldSpacing,
                ]}
              >
                Confirm Password
              </Text>

              <View
                style={
                  styles.passwordContainer
                }
              >
                <TextInput
                  style={
                    styles.passwordInput
                  }
                  placeholder="Confirm your password"
                  placeholderTextColor={
                    COLORS.textLight
                  }
                  value={
                    confirmPassword
                  }
                  onChangeText={
                    setConfirmPassword
                  }
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  editable={!loading}
                />

                <Pressable
                  style={
                    styles.showButton
                  }
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                >
                  <Text
                    style={
                      styles.showText
                    }
                  >
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {!isGoogleSignup && (
            <>
              <View
                style={styles.dividerContainer}
              >
                <View
                  style={styles.divider}
                />

                <Text
                  style={styles.orText}
                >
                  OR
                </Text>

                <View
                  style={styles.divider}
                />
              </View>

              <Pressable
                style={[
                  styles.googleButton,
                  loading &&
                    styles.disabledGoogleButton,
                ]}
                onPress={
                  handleGoogleSignup
                }
                disabled={loading}
              >
                <Text
                  style={styles.googleIcon}
                >
                  G
                </Text>

                <Text
                  style={styles.googleText}
                >
                  Continue with Google
                </Text>
              </Pressable>
            </>
          )}

          <View
            style={styles.memberIdInfo}
          >
            <View
              style={styles.memberIdIcon}
            >
              <Text
                style={
                  styles.memberIdIconText
                }
              >
                #
              </Text>
            </View>

            <View
              style={styles.memberIdContent}
            >
              <Text
                style={styles.memberIdTitle}
              >
                Member ID
              </Text>

              <Text
                style={styles.memberIdText}
              >
                Your Member ID will be generated
                automatically after registration.
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.signupButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={COLORS.white}
              />
            ) : (
              <Text
                style={
                  styles.signupButtonText
                }
              >
                {isGoogleSignup
                  ? 'Complete Profile'
                  : 'Create Account'}
              </Text>
            )}
          </Pressable>

          <View
            style={styles.loginContainer}
          >
            <Text
              style={styles.loginText}
            >
              Already have an account?
            </Text>

            <Pressable
              onPress={() =>
                navigation.replace(
                  'Login'
                )
              }
              disabled={loading}
            >
              <Text
                style={styles.loginLink}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          TechSutra Club • MUIT Lucknow
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 35,
  },

  logoText: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 38,
  },

  logoGold: {
    color: COLORS.goldDark,
  },

  welcome: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: '800',
    marginBottom: 8,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  form: {
    width: '100%',
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },

  fieldSpacing: {
    marginTop: 20,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.text,
  },

  disabledInput: {
    backgroundColor: '#EEF2F7',
    color: COLORS.textSecondary,
  },

  helperText: {
    color: COLORS.success,
    fontSize: 11,
    marginTop: 6,
  },

  passwordContainer: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.text,
  },

  showButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  showText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  orText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 14,
  },

  googleButton: {
    height: 54,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  disabledGoogleButton: {
    opacity: 0.7,
  },

  googleIcon: {
    color: '#4285F4',
    fontSize: 19,
    fontWeight: '800',
    marginRight: 10,
  },

  googleText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  memberIdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#F5DF8A',
    borderRadius: 14,
    padding: 14,
    marginTop: 22,
  },

  memberIdIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberIdIconText: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: '800',
  },

  memberIdContent: {
    flex: 1,
    marginLeft: 11,
  },

  memberIdTitle: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
  },

  memberIdText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  signupButton: {
    height: 54,
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  disabledButton: {
    opacity: 0.7,
  },

  signupButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  loginText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  loginLink: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },

  footer: {
    color: COLORS.textLight,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 30,
  },
});