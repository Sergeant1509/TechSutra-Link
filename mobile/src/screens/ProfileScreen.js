import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';

import { COLORS } from '../theme/colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          Profile
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              AG
            </Text>
          </View>

          <Text style={styles.name}>
            Abhijeet Gautam
          </Text>

          <Text style={styles.role}>
            TechSutra Club Member
          </Text>

          <Text style={styles.university}>
            MUIT, Lucknow
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat value="78%" label="Attendance" />
          <Stat value="12" label="Events" />
          <Stat value="2026" label="Member Since" />
        </View>

        <View style={styles.menu}>
          <MenuItem title="My Attendance" />
          <MenuItem title="My Events" />
          <MenuItem title="Notifications" />
          <MenuItem title="Settings" />
          <MenuItem title="About TechSutra" />
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function MenuItem({ title }) {
  return (
    <Pressable style={styles.menuItem}>
      <Text style={styles.menuTitle}>
        {title}
      </Text>

      <Text style={styles.arrow}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  },

  avatarText: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: '800',
  },

  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 13,
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
    paddingVertical: 20,
    flexDirection: 'row',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
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

  menuTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  arrow: {
    color: COLORS.textLight,
    fontSize: 23,
  },
});