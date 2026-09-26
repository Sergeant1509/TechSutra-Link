import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../theme/colors';

import {
  getActiveMeeting,
  getAutomaticAttendanceRemainingSeconds,
  isAutomaticAttendanceOpen,
  closeAutomaticAttendance,
  markMemberManually,
  endMeeting,
} from '../../services/meetingStore';

/*
|--------------------------------------------------------------------------
| Demo Members
|--------------------------------------------------------------------------
|
| Later this will come from FastAPI/PostgreSQL.
|--------------------------------------------------------------------------
*/

const DEMO_MEMBERS = [
  {
    id: 'TS001',
    name: 'Rahul Sharma',
  },
  {
    id: 'TS002',
    name: 'Priya Singh',
  },
  {
    id: 'TS003',
    name: 'Aman Verma',
  },
  {
    id: 'TS004',
    name: 'Neha Gupta',
  },
];

/*
|--------------------------------------------------------------------------
| Format Countdown
|--------------------------------------------------------------------------
*/

const formatTime = (seconds) => {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const minutes = Math.floor(
    safeSeconds / 60
  );

  const remainingSeconds =
    safeSeconds % 60;

  return `${String(minutes).padStart(
    2,
    '0'
  )}:${String(remainingSeconds).padStart(
    2,
    '0'
  )}`;
};

/*
|--------------------------------------------------------------------------
| Live Attendance Screen
|--------------------------------------------------------------------------
*/

export default function LiveAttendanceScreen({
  navigation,
}) {
  const [meeting, setMeeting] = useState(
    () => getActiveMeeting()
  );

  const [remaining, setRemaining] = useState(
    () =>
      getAutomaticAttendanceRemainingSeconds()
  );

  const [automaticOpen, setAutomaticOpen] =
    useState(() =>
      isAutomaticAttendanceOpen()
    );

  /*
  |--------------------------------------------------------------------------
  | Countdown
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      const activeMeeting =
        getActiveMeeting();

      /*
       * Meeting no longer exists.
       */
      if (!activeMeeting) {
        setMeeting(null);
        setRemaining(0);
        setAutomaticOpen(false);

        return;
      }

      /*
       * Refresh meeting state.
       */
      setMeeting(activeMeeting);

      /*
       * Check whether automatic attendance
       * is still available.
       */
      const open =
        isAutomaticAttendanceOpen();

      setAutomaticOpen(open);

      /*
       * Get remaining seconds.
       */
      const seconds =
        getAutomaticAttendanceRemainingSeconds();

      setRemaining(seconds);

      /*
       * If the timer reaches zero,
       * automatically close the proximity window.
       */
      if (seconds <= 0 && open) {
        const updatedMeeting =
          closeAutomaticAttendance();

        if (updatedMeeting) {
          setMeeting(updatedMeeting);
        }

        setAutomaticOpen(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Manual Attendance
  |--------------------------------------------------------------------------
  */

  const setManual = (
    member,
    status
  ) => {
    const updatedMeeting =
      markMemberManually(
        member.id,
        status
      );

    if (!updatedMeeting) {
      return;
    }

    setMeeting(updatedMeeting);

    Alert.alert(
      'Attendance Updated',
      `${member.name} has been marked ${status}.`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | End Meeting
  |--------------------------------------------------------------------------
  */

  const finish = () => {
    Alert.alert(
      'End Meeting?',
      'This will end the attendance session and save the attendance in local history.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Meeting',
          style: 'destructive',
          onPress: () => {
            const completedMeeting =
              endMeeting();

            if (!completedMeeting) {
              return;
            }

            setMeeting(null);
            setRemaining(0);
            setAutomaticOpen(false);

            Alert.alert(
              'Meeting Completed',
              'The attendance session has been successfully closed.',
              [
                {
                  text: 'Back to Dashboard',
                  onPress: () => {
                    navigation.navigate(
                      'AdminDashboard'
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | No Active Meeting
  |--------------------------------------------------------------------------
  */

  if (!meeting) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          'top',
          'left',
          'right',
        ]}
      >
        <View style={styles.emptyPage}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={58}
              color={COLORS.success}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No Active Meeting
          </Text>

          <Text style={styles.emptySubtitle}>
            There is currently no active attendance
            session.
          </Text>

          <Pressable
            style={styles.dashboardButton}
            onPress={() =>
              navigation.navigate(
                'AdminDashboard'
              )
            }
          >
            <Text style={styles.dashboardButtonText}>
              Back to Dashboard
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Attendance Records
  |--------------------------------------------------------------------------
  */

  const attendanceRecords =
    Array.isArray(meeting.attendance)
      ? meeting.attendance
      : [];

  const getMemberRecord = (
    memberId
  ) => {
    return attendanceRecords.find(
      (record) =>
        record.memberId === memberId
    );
  };

  const presentCount =
    attendanceRecords.filter(
      (record) =>
        record.status === 'present'
    ).length;

  const absentCount =
    attendanceRecords.filter(
      (record) =>
        record.status === 'absent'
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Progress
  |--------------------------------------------------------------------------
  */

  const totalSeconds = 5 * 60;

  const progress =
    Math.max(
      0,
      Math.min(
        1,
        remaining / totalSeconds
      )
    );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}
    >
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.navy}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.heading}>
              Live Attendance
            </Text>

            <Text style={styles.subtitle}>
              {meeting.title}
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        {/* MEETING INFORMATION */}

        <View style={styles.meetingCard}>
          <View style={styles.meetingTop}>
            <View style={styles.meetingIcon}>
              <Ionicons
                name="people-outline"
                size={25}
                color={COLORS.navy}
              />
            </View>

            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>
                {meeting.title}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.locationText}>
                  {meeting.location}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                Date
              </Text>

              <Text style={styles.detailValue}>
                {meeting.date}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                Time
              </Text>

              <Text style={styles.detailValue}>
                {meeting.time}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                Duration
              </Text>

              <Text style={styles.detailValue}>
                {meeting.duration} min
              </Text>
            </View>
          </View>
        </View>

        {/* AUTOMATIC ATTENDANCE */}

        <View
          style={[
            styles.timerCard,
            !automaticOpen &&
              styles.timerCardClosed,
          ]}
        >
          <View style={styles.timerHeader}>
            <View style={styles.timerHeaderText}>
              <Text
                style={[
                  styles.cardLabel,
                  !automaticOpen &&
                    styles.cardLabelClosed,
                ]}
              >
                {automaticOpen
                  ? 'AUTOMATIC ATTENDANCE OPEN'
                  : 'AUTOMATIC ATTENDANCE CLOSED'}
              </Text>

              <Text
                style={[
                  styles.timerSubtitle,
                  !automaticOpen &&
                    styles.timerSubtitleClosed,
                ]}
              >
                {automaticOpen
                  ? 'Proximity verification is available'
                  : 'Manual attendance remains available'}
              </Text>
            </View>

            <View
              style={[
                styles.timerIcon,
                !automaticOpen &&
                  styles.timerIconClosed,
              ]}
            >
              <Ionicons
                name={
                  automaticOpen
                    ? 'radio-outline'
                    : 'lock-closed-outline'
                }
                size={22}
                color={
                  automaticOpen
                    ? COLORS.navy
                    : COLORS.textSecondary
                }
              />
            </View>
          </View>

          <Text
            style={[
              styles.timer,
              !automaticOpen &&
                styles.timerClosed,
            ]}
          >
            {formatTime(remaining)}
          </Text>

          {/* PROGRESS BAR */}

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    progress * 100
                  }%`,
                },
                !automaticOpen &&
                  styles.progressFillClosed,
              ]}
            />
          </View>

          <View style={styles.timerStatus}>
            <Ionicons
              name={
                automaticOpen
                  ? 'bluetooth-outline'
                  : 'hand-left-outline'
              }
              size={17}
              color={
                automaticOpen
                  ? COLORS.navy
                  : COLORS.textSecondary
              }
            />

            <Text
              style={[
                styles.timerStatusText,
                !automaticOpen &&
                  styles.timerStatusTextClosed,
              ]}
            >
              {automaticOpen
                ? 'Automatic proximity attendance is active for the first 5 minutes.'
                : 'The 5-minute automatic attendance window has ended.'}
            </Text>
          </View>

          {automaticOpen && (
            <Pressable
              onPress={() => {
                const updatedMeeting =
                  closeAutomaticAttendance();

                if (updatedMeeting) {
                  setMeeting(
                    updatedMeeting
                  );
                }

                setAutomaticOpen(false);
                setRemaining(0);
              }}
            >
              <Text style={styles.closeLink}>
                Close automatic attendance early
              </Text>
            </Pressable>
          )}
        </View>

        {/* STATS */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {presentCount}
            </Text>

            <Text style={styles.statLabel}>
              Present
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {DEMO_MEMBERS.length}
            </Text>

            <Text style={styles.statLabel}>
              Members
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {absentCount}
            </Text>

            <Text style={styles.statLabel}>
              Absent
            </Text>
          </View>
        </View>

        {/* MEMBER SECTION */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Member Attendance
            </Text>

            <Text style={styles.sectionSubtitle}>
              Manual marking remains available
            </Text>
          </View>

          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>
              {meeting.sessionId}
            </Text>
          </View>
        </View>

        {/* MEMBERS */}

        {DEMO_MEMBERS.map((member) => {
          const record =
            getMemberRecord(
              member.id
            );

          const isPresent =
            record?.status ===
            'present';

          const isAbsent =
            record?.status ===
            'absent';

          return (
            <View
              key={member.id}
              style={styles.memberCard}
            >
              <View style={styles.memberAvatar}>
                <Text
                  style={
                    styles.memberAvatarText
                  }
                >
                  {member.name
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.memberInfo}>
                <Text
                  style={styles.memberName}
                >
                  {member.name}
                </Text>

                <Text
                  style={styles.memberId}
                >
                  {member.id}
                </Text>

                {record && (
                  <Text
                    style={
                      styles.methodText
                    }
                  >
                    {record.method ===
                    'manual'
                      ? 'Manually marked'
                      : 'Proximity verified'}
                  </Text>
                )}
              </View>

              <View style={styles.actions}>
                {/* PRESENT */}

                <Pressable
                  style={[
                    styles.smallButton,
                    isPresent &&
                      styles.presentButton,
                  ]}
                  onPress={() =>
                    setManual(
                      member,
                      'present'
                    )
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={
                      isPresent
                        ? COLORS.white
                        : COLORS.success
                    }
                  />

                  <Text
                    style={[
                      styles.smallText,
                      isPresent &&
                        styles.selectedButtonText,
                    ]}
                  >
                    Present
                  </Text>
                </Pressable>

                {/* ABSENT */}

                <Pressable
                  style={[
                    styles.smallButton,
                    isAbsent &&
                      styles.absentButton,
                  ]}
                  onPress={() =>
                    setManual(
                      member,
                      'absent'
                    )
                  }
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={
                      isAbsent
                        ? COLORS.white
                        : COLORS.danger
                    }
                  />

                  <Text
                    style={[
                      styles.smallText,
                      isAbsent &&
                        styles.selectedButtonText,
                    ]}
                  >
                    Absent
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* END MEETING */}

        <Pressable
          style={styles.endButton}
          onPress={finish}
        >
          <Ionicons
            name="stop-circle-outline"
            size={21}
            color={COLORS.white}
          />

          <Text style={styles.endText}>
            End Attendance Session
          </Text>
        </Pressable>

        <Text style={styles.footerNote}>
          Automatic proximity attendance is available
          only during the first 5 minutes. The
          president can manually mark attendance until
          the meeting is ended.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navy,
  },

  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginRight: 5,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger,
  },

  /*
  |--------------------------------------------------------------------------
  | Meeting Card
  |--------------------------------------------------------------------------
  */

  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },

  meetingTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  meetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF3F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  meetingInfo: {
    flex: 1,
  },

  meetingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.navy,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  locationText: {
    marginLeft: 4,
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  detailsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 15,
    paddingTop: 14,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },

  /*
  |--------------------------------------------------------------------------
  | Timer Card
  |--------------------------------------------------------------------------
  */

  timerCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
  },

  timerCardClosed: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timerHeaderText: {
    flex: 1,
  },

  cardLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  cardLabelClosed: {
    color: COLORS.textSecondary,
  },

  timerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 5,
  },

  timerSubtitleClosed: {
    color: COLORS.textSecondary,
  },

  timerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timerIconClosed: {
    backgroundColor: COLORS.background,
  },

  timer: {
    color: COLORS.white,
    fontSize: 52,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 12,
  },

  timerClosed: {
    color: COLORS.navy,
  },

  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 8,
  },

  progressFillClosed: {
    backgroundColor: COLORS.textLight,
  },

  timerStatus: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },

  timerStatusText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 7,
  },

  timerStatusTextClosed: {
    color: COLORS.textSecondary,
  },

  closeLink: {
    color: COLORS.gold,
    marginTop: 16,
    fontSize: 12,
    fontWeight: '800',
  },

  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
  },

  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  /*
  |--------------------------------------------------------------------------
  | Member Section
  |--------------------------------------------------------------------------
  */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  sessionBadge: {
    marginLeft: 'auto',
    backgroundColor: '#EEF3F9',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },

  sessionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.navy,
  },

  /*
  |--------------------------------------------------------------------------
  | Member Card
  |--------------------------------------------------------------------------
  */

  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 13,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  memberAvatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  memberInfo: {
    marginBottom: 10,
  },

  memberName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
  },

  memberId: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  methodText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  smallButton: {
    flex: 1,
    minHeight: 40,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  presentButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  absentButton: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },

  smallText: {
    color: COLORS.navy,
    fontWeight: '700',
    fontSize: 11,
  },

  selectedButtonText: {
    color: COLORS.white,
  },

  /*
  |--------------------------------------------------------------------------
  | End Button
  |--------------------------------------------------------------------------
  */

  endButton: {
    height: 54,
    backgroundColor: COLORS.danger,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  endText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },

  footerNote: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 14,
  },

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  emptyPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: COLORS.background,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
  },

  emptySubtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },

  dashboardButton: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 13,
    marginTop: 22,
  },

  dashboardButtonText: {
    color: COLORS.white,
    fontWeight: '800',
  },
});