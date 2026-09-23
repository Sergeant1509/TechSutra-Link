import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { COLORS } from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
      />

      <View style={styles.content}>

        <Image
          source={require('../../assets/logo/techsutra-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          TechSutra <Text style={styles.titleGold}>Link</Text>
        </Text>

        <Text style={styles.tagline}>
          Connect. Participate. Belong.
        </Text>

        <View style={styles.line} />

      </View>

      <View style={styles.footer}>

        <Text style={styles.muit}>
          MUIT
        </Text>

        <Text style={styles.university}>
          Maharishi University of Information & Technology
        </Text>

        <Text style={styles.location}>
          Lucknow
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 45,
  },

  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 210,
    height: 210,
    marginBottom: 30,
  },

  title: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  titleGold: {
    color: COLORS.gold,
  },

  tagline: {
    color: COLORS.white,
    opacity: 0.75,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 9,
    letterSpacing: 0.5,
  },

  line: {
    width: 55,
    height: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    marginTop: 22,
  },

  footer: {
    alignItems: 'center',
    width: '100%',
  },

  muit: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 6,
  },

  university: {
    color: COLORS.white,
    opacity: 0.65,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },

  location: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },

});