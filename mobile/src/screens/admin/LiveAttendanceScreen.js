import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../theme/colors';

import {
  getActiveMeetings,
  getMeetingById,
  endMeeting,
} from '../../services/meetingService';

import {
  getMembers,
  getMeetingAttendance,
  markAttendance,
} from '../../services/attendanceService';


const AUTOMATIC_ATTENDANCE_DURATION_SECONDS = 5 * 60;


/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`;
};


const getStartedAtMillis = (meeting) => {
  if (!meeting?.startedAt) {
    return null;
  }

  try {
    if (typeof meeting.startedAt.toMillis === 'function') {
      return meeting.startedAt.toMillis();
    }

    if (typeof meeting.startedAt.toDate === 'function') {
      return meeting.startedAt.toDate().getTime();
    }

    if (meeting.startedAt instanceof Date) {
      return meeting.startedAt.getTime();
    }

    if (typeof meeting.startedAt === 'number') {
      return meeting.startedAt;
    }

    return null;
  } catch (error) {
    console.log('getStartedAtMillis error:', error);
    return null;
  }
};


const getAutomaticAttendanceRemaining = (meeting) => {
  const startedAtMillis = getStartedAtMillis(meeting);

  if (!startedAtMillis) {
    return 0;
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - startedAtMillis) / 1000
  );

  return Math.max(
    0,
    AUTOMATIC_ATTENDANCE_DURATION_SECONDS - elapsedSeconds
  );
};


const isAutomaticAttendanceAvailable = (meeting) => {
  if (!meeting || meeting.status !== 'active') {
    return false;
  }

  return getAutomaticAttendanceRemaining(meeting) > 0;
};


const getMeetingDisplayTime = (meeting) => {
  return meeting?.startTime || meeting?.time || '--';
};


const getMeetingDisplayDate = (meeting) => {
  return meeting?.date || '--';
};


const getSessionId = (meeting) => {
  if (meeting?.sessionId) {
    return meeting.sessionId;
  }

  if (meeting?.id) {
    return meeting.id.slice(0, 12).toUpperCase();
  }

  return 'PENDING';
};


/* -------------------------------------------------------------------------- */
/* Live Attendance Screen                                                     */
/* -------------------------------------------------------------------------- */

export default function LiveAttendanceScreen({
  navigation,
  route,
}) {
  const routeMeetingId = route?.params?.meetingId || null;

  const [meeting, setMeeting] = useState(null);
  const [meetingId, setMeetingId] = useState(routeMeetingId);

  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshingMeeting, setRefreshingMeeting] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [savingAttendanceUid, setSavingAttendanceUid] =
    useState(null);

  const [remaining, setRemaining] = useState(0);
  const [automaticOpen, setAutomaticOpen] = useState(false);


  /* ---------------------------------------------------------------------- */
  /* Load Members                                                           */
  /* ---------------------------------------------------------------------- */

  const loadMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);

      const memberList = await getMembers();

      setMembers(memberList || []);

      console.log(
        'LiveAttendance members loaded:',
        memberList?.length || 0
      );
    } catch (error) {
      console.log('loadMembers error:', error);

      Alert.alert(
        'Members Error',
        error?.message ||
          'Members could not be loaded from Firebase.'
      );
    } finally {
      setLoadingMembers(false);
    }
  }, []);


  /* ---------------------------------------------------------------------- */
  /* Load Attendance                                                        */
  /* ---------------------------------------------------------------------- */

  const loadAttendance = useCallback(async (id) => {
    if (!id) {
      return;
    }

    try {
      const records = await getMeetingAttendance(id);

      setAttendanceRecords(records || []);

      console.log(
        'LiveAttendance records loaded:',
        records?.length || 0
      );
    } catch (error) {
      console.log('loadAttendance error:', error);

      Alert.alert(
        'Attendance Error',
        error?.message ||
          'Attendance could not be loaded from Firebase.'
      );
    }
  }, []);


  /* ---------------------------------------------------------------------- */
  /* Load Meeting                                                           */
  /* ---------------------------------------------------------------------- */

  const loadMeeting = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshingMeeting(true);
        }

        let loadedMeeting = null;

        if (meetingId) {
          loadedMeeting = await getMeetingById(meetingId);
        }

        if (!loadedMeeting && !meetingId) {
          const activeMeetings = await getActiveMeetings();

          if (activeMeetings.length > 0) {
            loadedMeeting = activeMeetings[0];

            setMeetingId(activeMeetings[0].id);
          }
        }

        if (!loadedMeeting) {
          setMeeting(null);
          setRemaining(0);
          setAutomaticOpen(false);
          return;
        }

        setMeeting(loadedMeeting);

        const seconds =
          getAutomaticAttendanceRemaining(loadedMeeting);

        setRemaining(seconds);

        setAutomaticOpen(
          isAutomaticAttendanceAvailable(loadedMeeting)
        );

        await loadAttendance(loadedMeeting.id);
      } catch (error) {
        console.log(
          'LiveAttendance loadMeeting error:',
          error
        );

        Alert.alert(
          'Unable to Load Meeting',
          error?.message ||
            'The meeting could not be loaded from Firebase.'
        );
      } finally {
        setLoading(false);
        setRefreshingMeeting(false);
      }
    },
    [meetingId, loadAttendance]
  );


  /* ---------------------------------------------------------------------- */
  /* Initial Load                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadMeeting(true);
    loadMembers();
  }, [loadMeeting, loadMembers]);


  /* ---------------------------------------------------------------------- */
  /* Refresh Attendance Every 5 Seconds                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!meetingId) {
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const updatedMeeting =
          await getMeetingById(meetingId);

        if (!updatedMeeting) {
          setMeeting(null);
          setRemaining(0);
          setAutomaticOpen(false);
          return;
        }

        setMeeting(updatedMeeting);

        const seconds =
          getAutomaticAttendanceRemaining(
            updatedMeeting
          );

        setRemaining(seconds);

        setAutomaticOpen(
          isAutomaticAttendanceAvailable(
            updatedMeeting
          )
        );

        await loadAttendance(meetingId);
      } catch (error) {
        console.log(
          'LiveAttendance polling error:',
          error
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [meetingId, loadAttendance]);


  /* ---------------------------------------------------------------------- */
  /* Countdown                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!meeting) {
      return undefined;
    }

    const interval = setInterval(() => {
      const seconds =
        getAutomaticAttendanceRemaining(meeting);

      setRemaining(seconds);

      if (
        meeting.status === 'active' &&
        seconds > 0
      ) {
        setAutomaticOpen(true);
      } else {
        setAutomaticOpen(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [meeting]);


  /* ---------------------------------------------------------------------- */
  /* Manual Attendance -> FIRESTORE                                         */
  /* ---------------------------------------------------------------------- */

  const setManual = async (member, status) => {
    if (!meetingId) {
      Alert.alert(
        'Meeting Error',
        'Meeting ID is missing.'
      );
      return;
    }

    if (!member?.uid) {
      Alert.alert(
        'Member Error',
        'This member does not have a valid Firebase UID.'
      );
      return;
    }

    try {
      setSavingAttendanceUid(member.uid);

      console.log(
        'Saving attendance:',
        {
          meetingId,
          uid: member.uid,
          memberId: member.memberId,
          memberName: member.name,
          status,
        }
      );

      await markAttendance({
        meetingId,
        uid: member.uid,
        memberId: member.memberId || '',
        memberName: member.name || '',
        status,
        method: 'manual',
      });

      await loadAttendance(meetingId);

      Alert.alert(
        'Attendance Updated',
        `${member.name} has been marked ${status}.`
      );
    } catch (error) {
      console.log(
        'setManual error:',
        error
      );

      Alert.alert(
        'Attendance Error',
        error?.message ||
          'Attendance could not be saved.'
      );
    } finally {
      setSavingAttendanceUid(null);
    }
  };


  /* ---------------------------------------------------------------------- */
  /* Close Automatic Attendance                                             */
  /* ---------------------------------------------------------------------- */

  const closeAutomaticAttendance = () => {
    setAutomaticOpen(false);
    setRemaining(0);
  };


  /* ---------------------------------------------------------------------- */
  /* End Meeting                                                            */
  /* ---------------------------------------------------------------------- */

  const finish = () => {
    if (!meetingId) {
      Alert.alert(
        'Meeting Error',
        'Meeting ID is missing.'
      );
      return;
    }

    Alert.alert(
      'End Meeting?',
      'This will end the live attendance session and mark the meeting as completed.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Meeting',
          style: 'destructive',
          onPress: async () => {
            try {
              setRefreshingMeeting(true);

              await endMeeting(meetingId);

              setMeeting(null);
              setRemaining(0);
              setAutomaticOpen(false);

              Alert.alert(
                'Meeting Completed',
                'The meeting has been successfully completed.',
                [
                  {
                    text: 'Back to Dashboard',
                    onPress: () => {
                      navigation.navigate(
                        'PresidentTabs',
                        {
                          screen: 'Dashboard',
                        }
                      );
                    },
                  },
                ]
              );
            } catch (error) {
              console.log(
                'LiveAttendance finish error:',
                error
              );

              Alert.alert(
                'Unable to End Meeting',
                error?.message ||
                  'The meeting could not be ended. Please try again.'
              );
            } finally {
              setRefreshingMeeting(false);
            }
          },
        },
      ]
    );
  };


  /* ---------------------------------------------------------------------- */
  /* Attendance Statistics                                                  */
  /* ---------------------------------------------------------------------- */

  const presentCount = useMemo(() => {
    return attendanceRecords.filter(
      (record) =>
        record.status === 'present'
    ).length;
  }, [attendanceRecords]);


  const absentCount = useMemo(() => {
    return attendanceRecords.filter(
      (record) =>
        record.status === 'absent'
    ).length;
  }, [attendanceRecords]);


  const totalMembers = members.length;


  const getMemberRecord = (uid) => {
    return attendanceRecords.find(
      (record) => record.uid === uid
    );
  };


  /* ---------------------------------------------------------------------- */
  /* Loading State                                                          */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.loadingPage}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="cloud-download-outline"
              size={40}
              color={COLORS.navy}
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading Meeting
          </Text>

          <Text style={styles.loadingSubtitle}>
            Fetching live meeting data and members from Firebase...
          </Text>

          <ActivityIndicator
            size="small"
            color={COLORS.navy}
            style={styles.loadingSpinner}
          />
        </View>
      </SafeAreaView>
    );
  }


  /* ---------------------------------------------------------------------- */
  /* No Active Meeting                                                      */
  /* ---------------------------------------------------------------------- */

  if (!meeting || meeting.status !== 'active') {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
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
            There is currently no active attendance session.
          </Text>

          <Pressable
            style={styles.dashboardButton}
            onPress={() =>
              navigation.navigate(
                'PresidentTabs',
                {
                  screen: 'Dashboard',
                }
              )
            }
          >
            <Ionicons
              name="arrow-back-outline"
              size={18}
              color={COLORS.white}
              style={styles.dashboardButtonIcon}
            />

            <Text style={styles.dashboardButtonText}>
              Back to Dashboard
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }


  /* ---------------------------------------------------------------------- */
  /* Progress                                                               */
  /* ---------------------------------------------------------------------- */

  const totalSeconds =
    AUTOMATIC_ATTENDANCE_DURATION_SECONDS;

  const progress = Math.max(
    0,
    Math.min(
      1,
      remaining / totalSeconds
    )
  );


  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
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
            onPress={() => navigation.goBack()}
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


        {/* FIREBASE STATUS */}

        <View style={styles.firebaseStatus}>
          <View style={styles.firebaseStatusIcon}>
            <Ionicons
              name="cloud-done-outline"
              size={16}
              color={COLORS.success}
            />
          </View>

          <View style={styles.firebaseStatusTextContainer}>
            <Text style={styles.firebaseStatusTitle}>
              Live meeting connected
            </Text>

            <Text style={styles.firebaseStatusSubtitle}>
              Attendance is synced with Firebase
            </Text>
          </View>

          {refreshingMeeting && (
            <ActivityIndicator
              size="small"
              color={COLORS.navy}
            />
          )}
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
                  {meeting.location ||
                    'Location not specified'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.detailLabel}>
                  Date
                </Text>
              </View>

              <Text style={styles.detailValue}>
                {getMeetingDisplayDate(meeting)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.detailLabel}>
                  Time
                </Text>
              </View>

              <Text style={styles.detailValue}>
                {getMeetingDisplayTime(meeting)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <Ionicons
                  name="hourglass-outline"
                  size={12}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.detailLabel}>
                  Duration
                </Text>
              </View>

              <Text style={styles.detailValue}>
                {meeting.duration || 30} min
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

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
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
              style={styles.closeAttendanceButton}
              onPress={closeAutomaticAttendance}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={COLORS.gold}
              />

              <Text style={styles.closeLink}>
                Close automatic attendance early
              </Text>
            </Pressable>
          )}
        </View>


        {/* STATS */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.presentStatIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color={COLORS.success}
              />
            </View>

            <Text style={styles.statNumber}>
              {presentCount}
            </Text>

            <Text style={styles.statLabel}>
              Present
            </Text>
          </View>


          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.memberStatIcon,
              ]}
            >
              <Ionicons
                name="people-outline"
                size={19}
                color={COLORS.navy}
              />
            </View>

            <Text style={styles.statNumber}>
              {totalMembers}
            </Text>

            <Text style={styles.statLabel}>
              Members
            </Text>
          </View>


          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.absentStatIcon,
              ]}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color={COLORS.danger}
              />
            </View>

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
              Manual marking is saved directly to Firebase
            </Text>
          </View>

          <View style={styles.sessionBadge}>
            <Ionicons
              name="key-outline"
              size={11}
              color={COLORS.navy}
              style={styles.sessionIcon}
            />

            <Text style={styles.sessionBadgeText}>
              {getSessionId(meeting)}
            </Text>
          </View>
        </View>


        {/* MEMBER LIST */}

        {loadingMembers ? (
          <View style={styles.membersLoading}>
            <ActivityIndicator
              size="small"
              color={COLORS.navy}
            />

            <Text style={styles.membersLoadingText}>
              Loading members...
            </Text>
          </View>
        ) : members.length === 0 ? (
          <View style={styles.noMembersCard}>
            <Ionicons
              name="people-outline"
              size={35}
              color={COLORS.textSecondary}
            />

            <Text style={styles.noMembersTitle}>
              No Members Found
            </Text>

            <Text style={styles.noMembersText}>
              No Firebase users with the member role were found.
            </Text>
          </View>
        ) : (
          members.map((member) => {
            const record = getMemberRecord(
              member.uid
            );

            const isPresent =
              record?.status === 'present';

            const isAbsent =
              record?.status === 'absent';

            const isSaving =
              savingAttendanceUid === member.uid;

            return (
              <View
                key={member.uid}
                style={styles.memberCard}
              >
                <View style={styles.memberTop}>
                  <View style={styles.memberAvatar}>
                    <Text
                      style={styles.memberAvatarText}
                    >
                      {(member.name || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.name ||
                        'Unnamed Member'}
                    </Text>

                    <Text style={styles.memberId}>
                      {member.memberId ||
                        'No Member ID'}
                    </Text>

                    {record && (
                      <View style={styles.methodRow}>
                        <Ionicons
                          name={
                            record.method ===
                            'manual'
                              ? 'hand-left-outline'
                              : 'bluetooth-outline'
                          }
                          size={12}
                          color={
                            COLORS.textSecondary
                          }
                        />

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
                      </View>
                    )}
                  </View>
                </View>


                <View style={styles.actions}>
                  {/* PRESENT */}

                  <Pressable
                    style={[
                      styles.smallButton,
                      isPresent &&
                        styles.presentButton,
                    ]}
                    disabled={isSaving}
                    onPress={() =>
                      setManual(
                        member,
                        'present'
                      )
                    }
                  >
                    {isSaving &&
                    !isPresent ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.success}
                      />
                    ) : (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={
                          isPresent
                            ? COLORS.white
                            : COLORS.success
                        }
                      />
                    )}

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
                    disabled={isSaving}
                    onPress={() =>
                      setManual(
                        member,
                        'absent'
                      )
                    }
                  >
                    {isSaving &&
                    !isAbsent ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.danger}
                      />
                    ) : (
                      <Ionicons
                        name="close"
                        size={16}
                        color={
                          isAbsent
                            ? COLORS.white
                            : COLORS.danger
                        }
                      />
                    )}

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
          })
        )}


        {/* END MEETING */}

        <Pressable
          style={styles.endButton}
          onPress={finish}
          disabled={refreshingMeeting}
        >
          {refreshingMeeting ? (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
            />
          ) : (
            <>
              <Ionicons
                name="stop-circle-outline"
                size={21}
                color={COLORS.white}
              />

              <Text style={styles.endText}>
                End Attendance Session
              </Text>
            </>
          )}
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


/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

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


  /* Header */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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


  /* Firebase */

  firebaseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  firebaseStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  firebaseStatusTextContainer: {
    flex: 1,
  },

  firebaseStatusTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },

  firebaseStatusSubtitle: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
  },


  /* Meeting */

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

  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },


  /* Timer */

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

  closeAttendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 16,
  },

  closeLink: {
    color: COLORS.gold,
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '800',
  },


  /* Stats */

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

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  presentStatIcon: {
    backgroundColor: '#ECFDF3',
  },

  memberStatIcon: {
    backgroundColor: '#EEF3F9',
  },

  absentStatIcon: {
    backgroundColor: '#FEF2F2',
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


  /* Section */

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3F9',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },

  sessionIcon: {
    marginRight: 4,
  },

  sessionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.navy,
  },


  /* Members */

  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 13,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  memberTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  memberAvatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  memberInfo: {
    flex: 1,
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

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  methodText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginLeft: 4,
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


  /* Loading members */

  membersLoading: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  membersLoadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },


  /* No members */

  noMembersCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  noMembersTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },

  noMembersText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 5,
  },


  /* End */

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


  /* Loading page */

  loadingPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: COLORS.background,
  },

  loadingIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  loadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
  },

  loadingSubtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },

  loadingSpinner: {
    marginTop: 20,
  },


  /* Empty */

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 13,
    marginTop: 22,
  },

  dashboardButtonIcon: {
    marginRight: 7,
  },

  dashboardButtonText: {
    color: COLORS.white,
    fontWeight: '800',
  },
});