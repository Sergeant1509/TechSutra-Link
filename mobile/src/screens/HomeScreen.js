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

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello,
            </Text>

            <Text style={styles.name}>
              Abhijeet 👋
            </Text>
          </View>

          <Pressable style={styles.notification}>
            <Text style={styles.notificationIcon}>
              🔔
            </Text>
          </Pressable>
        </View>

        <Text style={styles.intro}>
          Let's build something amazing!
        </Text>

        <View style={styles.meetingCard}>

          <Text style={styles.meetingLabel}>
            NEXT MEETING
          </Text>

          <Text style={styles.meetingTitle}>
            TechSutra Weekly Meeting
          </Text>

          <Text style={styles.meetingInfo}>
            Today • 5:00 PM
          </Text>

          <Pressable style={styles.attendanceButton}>
            <Text style={styles.attendanceText}>
              Mark Attendance
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

        </View>

        <Text style={styles.sectionTitle}>
          Quick Access
        </Text>

        <View style={styles.grid}>

          <QuickCard
            icon="📅"
            title="Meetings"
            subtitle="View meetings"
          />

          <QuickCard
            icon="🎯"
            title="Events"
            subtitle="Upcoming events"
          />

          <QuickCard
            icon="👥"
            title="Members"
            subtitle="Club members"
          />

          <QuickCard
            icon="📁"
            title="Resources"
            subtitle="Club resources"
          />

        </View>

        <Text style={styles.sectionTitle}>
          Your Activity
        </Text>

        <View style={styles.activityCard}>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              78%
            </Text>

            <Text style={styles.statLabel}>
              Attendance
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              12
            </Text>

            <Text style={styles.statLabel}>
              Events
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              Member
            </Text>

            <Text style={styles.statLabel}>
              Role
            </Text>
          </View>

        </View>

      </ScrollView>

      <View style={styles.bottomNav}>

        <NavItem
          icon="⌂"
          label="Home"
          active
        />

        <NavItem
          icon="▣"
          label="Meetings"
        />

        <NavItem
          icon="★"
          label="Events"
        />

        <NavItem
          icon="●"
          label="Profile"
        />

      </View>

    </View>
  );
}

function QuickCard({ icon, title, subtitle }) {
  return (
    <Pressable style={styles.quickCard}>

      <Text style={styles.quickIcon}>
        {icon}
      </Text>

      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Text style={styles.quickSubtitle}>
        {subtitle}
      </Text>

    </Pressable>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <Pressable style={styles.navItem}>

      <Text
        style={[
          styles.navIcon,
          active && styles.navActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          active && styles.navActive,
        ]}
      >
        {label}
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
    paddingTop: 55,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greeting: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  name: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 2,
  },

  notification: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: {
    fontSize: 19,
  },

  intro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 25,
  },

  meetingCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    padding: 22,
  },

  meetingLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  meetingTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },

  meetingInfo: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 7,
  },

  attendanceButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 11,
    height: 48,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  attendanceText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '800',
  },

  arrow: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 13,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
  },

  quickIcon: {
    fontSize: 25,
    marginBottom: 10,
  },

  quickTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  quickSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  stat: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '800',
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.border,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: COLORS.textLight,
    fontSize: 21,
  },

  navLabel: {
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 4,
  },

  navActive: {
    color: COLORS.goldDark,
    fontWeight: '700',
  },
});