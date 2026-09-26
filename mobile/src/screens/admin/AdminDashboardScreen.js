import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';

export default function AdminDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>TechSutra Club</Text>
          <Text style={styles.headerTitle}>President Dashboard</Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>P</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Welcome, President 👋
            </Text>

            <Text style={styles.welcomeText}>
              Manage meetings, attendance and TechSutra activities
              from one place.
            </Text>
          </View>

          <View style={styles.clubBadge}>
            <Text style={styles.clubBadgeText}>TS</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        {/* Active Meeting */}
        <Text style={styles.sectionTitle}>Meeting Control</Text>

        <View style={styles.meetingCard}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>NO ACTIVE SESSION</Text>
          </View>

          <Text style={styles.meetingTitle}>
            TechSutra Weekly Meeting
          </Text>

          <Text style={styles.meetingDetails}>
            Today • 4:00 PM • TechSutra Club Room
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CreateMeeting')}
          >
            <Text style={styles.startButtonText}>
              + Create Meeting
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateMeeting')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>＋</Text>
            </View>

            <Text style={styles.actionTitle}>
              Create Meeting
            </Text>

            <Text style={styles.actionSubtitle}>
              Schedule a new meeting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LiveAttendance')}
          >
            <View
              style={[
                styles.actionIcon,
                styles.attendanceIcon,
              ]}
            >
              <Text style={styles.actionIconText}>✓</Text>
            </View>

            <Text style={styles.actionTitle}>
              Live Attendance
            </Text>

            <Text style={styles.actionSubtitle}>
              Monitor members
            </Text>
          </TouchableOpacity>

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
              <Text style={styles.actionIconText}>▤</Text>
            </View>

            <Text style={styles.actionTitle}>
              Reports
            </Text>

            <Text style={styles.actionSubtitle}>
              View attendance reports
            </Text>
          </TouchableOpacity>

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
              <Text style={styles.actionIconText}>●</Text>
            </View>

            <Text style={styles.actionTitle}>
              Members
            </Text>

            <Text style={styles.actionSubtitle}>
              Manage club members
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityCard}>
          <ActivityItem
            icon="✓"
            title="Attendance session completed"
            subtitle="TechSutra Weekly Meeting"
            time="Yesterday"
          />

          <ActivityItem
            icon="+"
            title="New member registered"
            subtitle="Member ID: TS024"
            time="2 days ago"
          />

          <ActivityItem
            icon="▤"
            title="Attendance report generated"
            subtitle="September Weekly Report"
            time="3 days ago"
          />
        </View>

        {/* Footer */}
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

function ActivityItem({ icon, title, subtitle, time }) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>{icon}</Text>
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

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '900',
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
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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

  meetingDetails: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },

  startButton: {
    height: 48,
    backgroundColor: COLORS.navy,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  startButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

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

  actionIconText: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: '900',
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

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  activityIconText: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '900',
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
  },

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