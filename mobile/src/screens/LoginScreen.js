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
import { auth } from '../services/firebase';

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '307314343238-klp92mbh23nm69q3e3he23op7m34abom.apps.googleusercontent.com',
});

export default function LoginScreen({ navigation }) {
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!memberId.trim() || !password) {
      Alert.alert(
        'Missing Details',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        memberId.trim(),
        password
      );

      navigation.replace('Main');
    } catch (error) {
      console.log('Email login error:', error);

      let message = 'Unable to login. Please try again.';

      switch (error.code) {
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;

        case 'auth/user-not-found':
          message = 'No account exists with this email.';
          break;

        case 'auth/wrong-password':
          message = 'Incorrect password.';
          break;

        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;

        case 'auth/too-many-requests':
          message =
            'Too many login attempts. Please try again later.';
          break;

        default:
          message = error.message || message;
      }

      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      const idToken = response?.data?.idToken;

      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }

      const googleCredential =
        GoogleAuthProvider.credential(idToken);

      await signInWithCredential(auth, googleCredential);

      navigation.replace('Main');
    } catch (error) {
      console.log('Google login error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      if (error.code === statusCodes.IN_PROGRESS) {
        return;
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Google Play Services',
          'Google Play Services is unavailable or needs to be updated.'
        );
        return;
      }

      Alert.alert(
        'Google Login Failed',
        error.message || 'Unable to sign in with Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>
            TechSutra <Text style={styles.logoGold}>Link</Text>
          </Text>

          <Text style={styles.welcome}>
            Welcome Back
          </Text>

          <Text style={styles.subtitle}>
            Login to continue to TechSutra Link
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            Member ID / Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your member ID or email"
            placeholderTextColor={COLORS.textLight}
            value={memberId}
            onChangeText={setMemberId}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={[styles.label, styles.passwordLabel]}>
            Password
          </Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />

            <Pressable
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.forgotButton}
            onPress={() => {
              Alert.alert(
                'Forgot Password',
                'Password reset will be available after Firebase account setup.'
              );
            }}
            disabled={loading}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginText}>
                Login
              </Text>
            )}
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>
              OR
            </Text>

            <View style={styles.divider} />
          </View>

          <Pressable
            style={[
              styles.googleButton,
              loading && styles.disabledGoogleButton,
            ]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>
              G
            </Text>

            <Text style={styles.googleText}>
              Continue with Google
            </Text>
          </Pressable>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            New here?
          </Text>

          <Pressable
            onPress={() => {
              Alert.alert(
                'Create Account',
                'Account registration will be added next.'
              );
            }}
            disabled={loading}
          >
            <Text style={styles.signupLink}>
              Create Account
            </Text>
          </Pressable>
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
    paddingTop: 65,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 42,
  },

  logoText: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 42,
  },

  logoGold: {
    color: COLORS.goldDark,
  },

  welcome: {
    color: COLORS.text,
    fontSize: 30,
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

  passwordLabel: {
    marginTop: 22,
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

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },

  forgotText: {
    color: COLORS.navyLight,
    fontSize: 13,
    fontWeight: '600',
  },

  loginButton: {
    height: 54,
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
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

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },

  signupText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  signupLink: {
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