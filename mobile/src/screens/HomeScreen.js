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

export default function HomeScreen({ navigation }) {
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

        {/* Header */}
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


        {/* Next Meeting */}
        <View style={styles.meetingCard}>

          <View style={styles.meetingHeader}>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                NEXT MEETING
              </Text>
            </View>

            <Text style={styles.meetingDate}>
              TODAY
            </Text>

          </View>

          <Text style={styles.meetingTitle}>
            TechSutra Weekly Meeting
          </Text>

          <Text style={styles.meetingInfo}>
            🕐 5:00 PM
          </Text>

          <Text style={styles.meetingInfo}>
            📍 MUIT Campus
          </Text>

          <Pressable
            style={styles.attendanceButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.attendanceText}>
              Mark Attendance
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

        </View>


        {/* Quick Access */}
        <Text style={styles.sectionTitle}>
          Quick Access
        </Text>

        <View style={styles.grid}>

          <QuickCard
            icon="📅"
            title="Meetings"
            subtitle="View meetings"
            onPress={() => navigation.navigate('Meetings')}
          />

          <QuickCard
            icon="🎯"
            title="Events"
            subtitle="Upcoming events"
            onPress={() => navigation.navigate('Events')}
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


        {/* Your Activity */}
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


        {/* Club Information */}
        <View style={styles.clubCard}>

          <View style={styles.clubIcon}>
            <Text style={styles.clubIconText}>
              💡
            </Text>
          </View>

          <View style={styles.clubInfo}>

            <Text style={styles.clubTitle}>
              TechSutra Club
            </Text>

            <Text style={styles.clubSubtitle}>
              Organizing technical events & inspiring students
            </Text>

          </View>

        </View>

      </ScrollView>

    </View>
  );
}


/* Quick Access Card */

function QuickCard({
  icon,
  title,
  subtitle,
  onPress,
}) {
  return (
    <Pressable
      style={styles.quickCard}
      onPress={onPress}
    >

      <View style={styles.quickIconContainer}>

        <Text style={styles.quickIcon}>
          {icon}
        </Text>

      </View>

      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Text style={styles.quickSubtitle}>
        {subtitle}
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
    paddingBottom: 40,
  },


  /* Header */

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

    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
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


  /* Meeting Card */

  meetingCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    padding: 22,
  },

  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 198, 41, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginRight: 6,
  },

  liveText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  meetingDate: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },

  meetingTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
  },

  meetingInfo: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 8,
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


  /* Sections */

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 13,
  },


  /* Quick Access */

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

    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  quickIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  quickIcon: {
    fontSize: 22,
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


  /* Activity */

  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
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


  /* Club Information */

  clubCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clubIconText: {
    fontSize: 23,
  },

  clubInfo: {
    flex: 1,
    marginLeft: 13,
  },

  clubTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  clubSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

});