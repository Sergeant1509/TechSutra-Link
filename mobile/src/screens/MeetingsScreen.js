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

export default function MeetingsScreen({ navigation }) {
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
            <Text style={styles.heading}>
              Meetings
            </Text>

            <Text style={styles.subtitle}>
              Stay connected with TechSutra
            </Text>
          </View>

          <View style={styles.calendarIcon}>
            <Text style={styles.calendarText}>
              📅
            </Text>
          </View>
        </View>


        {/* Active Meeting */}
        <Text style={styles.sectionTitle}>
          Active Meeting
        </Text>

        <View style={styles.activeCard}>

          <View style={styles.activeHeader}>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeBadgeText}>
                UPCOMING
              </Text>
            </View>

            <Text style={styles.todayText}>
              TODAY
            </Text>

          </View>

          <Text style={styles.meetingTitle}>
            TechSutra Weekly Meeting
          </Text>

          <Text style={styles.description}>
            Weekly discussion, planning and
            technical activities of the club.
          </Text>

          <View style={styles.detailsRow}>

            <View style={styles.detail}>
              <Text style={styles.detailIcon}>
                🕐
              </Text>

              <View>
                <Text style={styles.detailLabel}>
                  TIME
                </Text>

                <Text style={styles.detailValue}>
                  5:00 PM
                </Text>
              </View>
            </View>

            <View style={styles.detail}>
              <Text style={styles.detailIcon}>
                📍
              </Text>

              <View>
                <Text style={styles.detailLabel}>
                  LOCATION
                </Text>

                <Text style={styles.detailValue}>
                  MUIT Campus
                </Text>
              </View>
            </View>

          </View>

          <Pressable
            style={styles.attendanceButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.attendanceText}>
              Join Attendance
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

        </View>


        {/* Upcoming */}
        <Text style={styles.sectionTitle}>
          Upcoming Meetings
        </Text>

        <MeetingCard
          title="Core Team Meeting"
          date="28 Sep 2026"
          time="4:00 PM"
          location="MUIT Campus"
        />

        <MeetingCard
          title="Technical Team Discussion"
          date="02 Oct 2026"
          time="3:30 PM"
          location="Innovation Lab"
        />


        {/* Previous */}
        <Text style={styles.sectionTitle}>
          Previous Meetings
        </Text>

        <PreviousMeeting
          title="Byte Bash Preparation"
          date="20 Sep 2026"
          status="Present"
        />

        <PreviousMeeting
          title="Club Planning Meeting"
          date="16 Sep 2026"
          status="Present"
        />

        <PreviousMeeting
          title="Technical Team Meeting"
          date="12 Sep 2026"
          status="Absent"
          absent
        />

      </ScrollView>

    </View>
  );
}


/* Upcoming Meeting Card */

function MeetingCard({
  title,
  date,
  time,
  location,
}) {
  return (
    <Pressable style={styles.meetingCard}>

      <View style={styles.dateBox}>

        <Text style={styles.dateDay}>
          {date.split(' ')[0]}
        </Text>

        <Text style={styles.dateMonth}>
          {date.split(' ')[1]}
        </Text>

      </View>

      <View style={styles.meetingCardInfo}>

        <Text style={styles.meetingCardTitle}>
          {title}
        </Text>

        <Text style={styles.meetingCardDetails}>
          🕐 {time}
        </Text>

        <Text style={styles.meetingCardDetails}>
          📍 {location}
        </Text>

      </View>

      <Text style={styles.cardArrow}>
        ›
      </Text>

    </Pressable>
  );
}


/* Previous Meeting */

function PreviousMeeting({
  title,
  date,
  status,
  absent,
}) {
  return (
    <View style={styles.previousCard}>

      <View style={styles.previousIcon}>
        <Text>
          📋
        </Text>
      </View>

      <View style={styles.previousInfo}>

        <Text style={styles.previousTitle}>
          {title}
        </Text>

        <Text style={styles.previousDate}>
          {date}
        </Text>

      </View>

      <View
        style={[
          styles.statusBadge,
          absent && styles.absentBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            absent && styles.absentText,
          ]}
        >
          {status}
        </Text>
      </View>

    </View>
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
    paddingBottom: 35,
  },


  /* Header */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heading: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
  },

  calendarIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarText: {
    fontSize: 21,
  },


  /* Section */

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 13,
  },


  /* Active Meeting */

  activeCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 21,
    padding: 22,
  },

  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,198,41,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginRight: 6,
  },

  activeBadgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  todayText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },

  meetingTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 18,
  },

  description: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },


  /* Meeting Details */

  detailsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },

  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  detailIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  detailLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  detailValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },


  /* Attendance */

  attendanceButton: {
    height: 49,
    backgroundColor: COLORS.gold,
    borderRadius: 11,
    marginTop: 22,
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
    marginLeft: 9,
  },


  /* Upcoming */

  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateBox: {
    width: 52,
    height: 57,
    borderRadius: 13,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateDay: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
  },

  dateMonth: {
    color: COLORS.goldDark,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  meetingCardInfo: {
    flex: 1,
    marginLeft: 13,
  },

  meetingCardTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  meetingCardDetails: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },

  cardArrow: {
    color: COLORS.textLight,
    fontSize: 27,
    marginLeft: 7,
  },


  /* Previous */

  previousCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  previousIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previousInfo: {
    flex: 1,
    marginLeft: 12,
  },

  previousTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  previousDate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
  },

  absentBadge: {
    backgroundColor: '#FEE2E2',
  },

  absentText: {
    color: COLORS.danger,
  },

});