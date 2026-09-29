import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';

import { auth, db } from '../services/firebase';

import { doc, getDoc } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('Member');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          if (userData.name) {
            setUserName(userData.name);
          }
        }
      } catch (error) {
        console.log('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

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

            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {userName}!
              </Text>

            </View>
          </View>

          <Pressable style={styles.notification}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.navy}
            />

            <View style={styles.notificationDot} />
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

          <View style={styles.meetingInfoRow}>
            <Ionicons
              name="time-outline"
              size={17}
              color="#CBD5E1"
            />

            <Text style={styles.meetingInfo}>
              5:00 PM
            </Text>
          </View>

          <View style={styles.meetingInfoRow}>
            <Ionicons
              name="location-outline"
              size={17}
              color="#CBD5E1"
            />

            <Text style={styles.meetingInfo}>
              MUIT Campus
            </Text>
          </View>

          <Pressable
            style={styles.attendanceButton}
            onPress={() => navigation.navigate('Attendance')}
          >

            <Text style={styles.attendanceText}>
              Mark Attendance
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color={COLORS.navy}
              style={styles.attendanceArrow}
            />
          </Pressable>
        </View>

        {/* Quick Access */}

        <Text style={styles.sectionTitle}>
          Quick Access
        </Text>

        <View style={styles.grid}>
          <QuickCard
            icon="calendar-outline"
            title="Meetings"
            subtitle="View meetings"
            onPress={() => navigation.navigate('Meetings')}
          />

          <QuickCard
            icon="sparkles-outline"
            title="Events"
            subtitle="Upcoming events"
            onPress={() => navigation.navigate('Events')}
          />

          <QuickCard
            icon="people-outline"
            title="Members"
            subtitle="Club members"
          />

          <QuickCard
            icon="folder-outline"
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
            <View style={styles.statIconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={COLORS.goldDark}
              />
            </View>

            <Text style={styles.statNumber}>
              78%
            </Text>

            <Text style={styles.statLabel}>
              Attendance
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <View style={styles.statIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.goldDark}
              />
            </View>

            <Text style={styles.statNumber}>
              12
            </Text>

            <Text style={styles.statLabel}>
              Events
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <View style={styles.statIconContainer}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.goldDark}
              />
            </View>

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
            <Ionicons
              name="bulb-outline"
              size={25}
              color={COLORS.goldDark}
            />
          </View>

          <View style={styles.clubInfo}>
            <Text style={styles.clubTitle}>
              TechSutra Club
            </Text>

            <Text style={styles.clubSubtitle}>
              Organizing technical events & inspiring students
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textLight}
          />
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
        <Ionicons
          name={icon}
          size={23}
          color={COLORS.navy}
        />
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

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 2,
  },

  greetingIcon: {
    marginLeft: 7,
    marginTop: 4,
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

  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.goldDark,
    borderWidth: 1.5,
    borderColor: COLORS.white,
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
    marginBottom: 2,
  },

  meetingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  meetingInfo: {
    color: '#CBD5E1',
    fontSize: 13,
    marginLeft: 8,
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
    marginLeft: 7,
  },

  attendanceArrow: {
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

  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
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
    height: 50,
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

  clubInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
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