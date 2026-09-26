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
} from 'react-native';

import { COLORS } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    navigation.replace('Admin');
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
            />

            <Pressable
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.forgotButton}
            onPress={() => {}}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </Pressable>

          <Pressable
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>
              Login
            </Text>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>
              OR
            </Text>

            <View style={styles.divider} />
          </View>

          <Pressable
            style={styles.googleButton}
            onPress={() => {}}
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

          <Pressable onPress={() => {}}>
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