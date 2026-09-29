import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../../theme/colors';
import { auth, db } from '../../services/firebase';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

export default function AdminDashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  /* =========================================
     LOAD PRESIDENT PROFILE
  ========================================= */

  const loadProfile = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const profileRef = doc(db, 'users', user.uid);
      const profileSnapshot = await getDoc(profileRef);

      if (profileSnapshot.exists()) {
        setProfile(profileSnapshot.data());
      } else {
        setProfile({
          name: user.displayName || 'President',
          email: user.email || '',
          photoURL: user.photoURL || '',
        });
      }
    } catch (error) {
      console.log(
        'Admin dashboard profile loading error:',
        error
      );

      Alert.alert(
        'Unable to Load Profile',
        'Your profile information could not be loaded.'
      );
    }
  }, []);

  /* =========================================
     REFRESH PROFILE WHEN DASHBOARD OPENS
  ========================================= */

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  /* =========================================
     PROFILE DATA
  ========================================= */

  const profilePhoto =
    profile?.photoURL ||
    auth.currentUser?.photoURL ||
    '';

  const presidentName =
    profile?.name ||
    auth.currentUser?.displayName ||
    'President';

  /* =========================================
     UI
  ========================================= */

  return (
    <View style={styles.container}>

      {/* =========================================
          HEADER
      ========================================= */}

      <View style={styles.header}>

        <View>
          <Text style={styles.smallText}>
            TechSutra Club
          </Text>

          <Text style={styles.headerTitle}>
            President Dashboard
          </Text>
        </View>

        {/* =====================================
            PRESIDENT PROFILE BUTTON
        ===================================== */}

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}
        >
          {profilePhoto ? (
            <Image
              source={{ uri: profilePhoto }}
              style={styles.profileImage}
            />
          ) : (
            <Ionicons
              name="person"
              size={21}
              color={COLORS.navy}
            />
          )}
        </TouchableOpacity>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =========================================
            WELCOME
        ========================================= */}

        <View style={styles.welcomeCard}>

          <View style={styles.welcomeContent}>

            <Text style={styles.welcomeTitle}>
              Welcome, {presidentName}
            </Text>

            <Text style={styles.welcomeText}>
              Manage meetings, attendance and
              TechSutra activities from one place.
            </Text>

          </View>

          <View style={styles.clubBadge}>
            <Text style={styles.clubBadgeText}>
              TS
            </Text>
          </View>

        </View>

        {/* =========================================
            STATS
        ========================================= */}

        <Text style={styles.sectionTitle}>
          Today's Overview
        </Text>

        <View style={styles.statsRow}>

          {/* MEMBERS */}

          <View style={styles.statCard}>

            <View style={styles.statIcon}>
              <Ionicons
                name="people-outline"
                size={19}
                color={COLORS.navy}
              />
            </View>

            <Text style={styles.statNumber}>
              24
            </Text>

            <Text style={styles.statLabel}>
              Members
            </Text>

          </View>

          {/* PRESENT */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                styles.presentIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color={COLORS.success}
              />
            </View>

            <Text style={styles.statNumber}>
              18
            </Text>

            <Text style={styles.statLabel}>
              Present
            </Text>

          </View>

          {/* ABSENT */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                styles.absentIcon,
              ]}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color={COLORS.danger}
              />
            </View>

            <Text style={styles.statNumber}>
              6
            </Text>

            <Text style={styles.statLabel}>
              Absent
            </Text>

          </View>

        </View>

        {/* =========================================
            MEETING CONTROL
        ========================================= */}

        <Text style={styles.sectionTitle}>
          Meeting Control
        </Text>

        <View style={styles.meetingCard}>

          <View style={styles.liveIndicator}>

            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              NO ACTIVE SESSION
            </Text>

          </View>

          <Text style={styles.meetingTitle}>
            Meeting Control Center
          </Text>

          <Text style={styles.meetingControlText}>
            Create a new meeting or manage attendance
            for an active meeting.
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('CreateMeeting')
            }
          >

            <Ionicons
              name="add-circle-outline"
              size={19}
              color={COLORS.white}
            />

            <Text style={styles.startButtonText}>
              Create Meeting
            </Text>

          </TouchableOpacity>

        </View>

        {/* =========================================
            QUICK ACTIONS
        ========================================= */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionsGrid}>

          {/* CREATE MEETING */}

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('CreateMeeting')
            }
          >

            <View style={styles.actionIcon}>

              <Ionicons
                name="add-outline"
                size={25}
                color={COLORS.navy}
              />

            </View>

            <Text style={styles.actionTitle}>
              Create Meeting
            </Text>

            <Text style={styles.actionSubtitle}>
              Schedule a new meeting
            </Text>

          </TouchableOpacity>

          {/* LIVE ATTENDANCE */}

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('LiveAttendance')
            }
          >

            <View
              style={[
                styles.actionIcon,
                styles.attendanceIcon,
              ]}
            >

              <Ionicons
                name="people-outline"
                size={23}
                color={COLORS.success}
              />

            </View>

            <Text style={styles.actionTitle}>
              Live Attendance
            </Text>

            <Text style={styles.actionSubtitle}>
              Monitor members
            </Text>

          </TouchableOpacity>

          {/* REPORTS */}

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
          >

            <View
              style={[
                styles.actionIcon,
                styles.reportIcon,
              ]}
            >

              <Ionicons
                name="bar-chart-outline"
                size={23}
                color="#4F46E5"
              />

            </View>

            <Text style={styles.actionTitle}>
              Reports
            </Text>

            <Text style={styles.actionSubtitle}>
              View attendance reports
            </Text>

          </TouchableOpacity>

          {/* MEMBERS */}

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
          >

            <View
              style={[
                styles.actionIcon,
                styles.memberIcon,
              ]}
            >

              <Ionicons
                name="person-outline"
                size={23}
                color="#0284C7"
              />

            </View>

            <Text style={styles.actionTitle}>
              Members
            </Text>

            <Text style={styles.actionSubtitle}>
              Manage club members
            </Text>

          </TouchableOpacity>

        </View>

        {/* =========================================
            RECENT ACTIVITY
        ========================================= */}

        <Text style={styles.sectionTitle}>
          Recent Activity
        </Text>

        <View style={styles.activityCard}>

          <ActivityItem
            icon="checkmark-circle-outline"
            iconColor={COLORS.success}
            title="Attendance session completed"
            subtitle="TechSutra Weekly Meeting"
            time="Yesterday"
          />

          <ActivityItem
            icon="person-add-outline"
            iconColor={COLORS.navy}
            title="New member registered"
            subtitle="Member ID: TS024"
            time="2 days ago"
          />

          <ActivityItem
            icon="document-text-outline"
            iconColor="#4F46E5"
            title="Attendance report generated"
            subtitle="September Weekly Report"
            time="3 days ago"
            last
          />

        </View>

        {/* =========================================
            FOOTER
        ========================================= */}

        <View style={styles.footer}>

          <Text style={styles.footerTitle}>
            TechSutra Link
          </Text>

          <Text style={styles.footerText}>
            Connect. Participate. Belong.
          </Text>

        </View>

      </ScrollView>
    </View>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({
  icon,
  iconColor,
  title,
  subtitle,
  time,
  last,
}) {
  return (
    <View
      style={[
        styles.activityItem,
        last && styles.activityItemLast,
      ]}
    >

      <View style={styles.activityIcon}>

        <Ionicons
          name={icon}
          size={18}
          color={iconColor || COLORS.navy}
        />

      </View>

      <View style={styles.activityContent}>

        <Text style={styles.activityTitle}>
          {title}
        </Text>

        <Text style={styles.activitySubtitle}>
          {subtitle}
        </Text>

      </View>

      <Text style={styles.activityTime}>
        {time}
      </Text>

    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.navy,
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  smallText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },

  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  welcomeCard: {
    backgroundColor: COLORS.navyLight,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  welcomeContent: {
    flex: 1,
    paddingRight: 12,
  },

  welcomeTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },

  welcomeText: {
    color: '#D6E0EF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  clubBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clubBadgeText: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '900',
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  presentIcon: {
    backgroundColor: '#DCFCE7',
  },

  absentIcon: {
    backgroundColor: '#FEE2E2',
  },

  statNumber: {
    color: COLORS.navy,
    fontSize: 23,
    fontWeight: '900',
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
    marginRight: 7,
  },

  liveText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  meetingTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },

  meetingControlText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  startButton: {
    height: 48,
    backgroundColor: COLORS.navy,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    flexDirection: 'row',
  },

  startButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 7,
  },

  /* =========================================
     QUICK ACTIONS
  ========================================= */

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF5CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  attendanceIcon: {
    backgroundColor: '#DCFCE7',
  },

  reportIcon: {
    backgroundColor: '#E0E7FF',
  },

  memberIcon: {
    backgroundColor: '#E0F2FE',
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  actionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  /* =========================================
     RECENT ACTIVITY
  ========================================= */

  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activityItem: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  activityItemLast: {
    borderBottomWidth: 0,
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  activitySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  activityTime: {
    color: COLORS.textLight,
    fontSize: 9,
    marginLeft: 8,
  },

  /* =========================================
     FOOTER
  ========================================= */

  footer: {
    alignItems: 'center',
    paddingTop: 28,
  },

  footerTitle: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '900',
  },

  footerText: {
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 4,
  },
});