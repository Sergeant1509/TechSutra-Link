import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../theme/colors';

import { auth, db } from '../services/firebase';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  getActiveMeetings,
  getScheduledMeetings,
  getCompletedMeetings,
  deleteMeeting,
} from '../services/meetingService';

export default function MeetingsScreen({ navigation }) {
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [previousMeetings, setPreviousMeetings] = useState([]);

  const [isPresident, setIsPresident] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [deletingMeetingId, setDeletingMeetingId] = useState(null);

  /* =========================================
     LOAD MEETINGS + USER ROLE
  ========================================= */

  const loadMeetings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      /* =====================================
         CHECK USER ROLE
      ===================================== */

      const user = auth.currentUser;

      if (user) {
        try {
          const profileRef = doc(
            db,
            'users',
            user.uid
          );

          const profileSnapshot =
            await getDoc(profileRef);

          if (profileSnapshot.exists()) {
            const role =
              profileSnapshot.data()?.role;

            setIsPresident(
              role === 'president'
            );
          } else {
            setIsPresident(false);
          }
        } catch (roleError) {
          console.log(
            'Role loading error:',
            roleError
          );

          setIsPresident(false);
        }
      } else {
        setIsPresident(false);
      }

      /* =====================================
         LOAD ALL MEETINGS
      ===================================== */

      const [
        active,
        scheduled,
        completed,
      ] = await Promise.all([
        getActiveMeetings(),
        getScheduledMeetings(),
        getCompletedMeetings(),
      ]);

      /* =====================================
         SORT MEETINGS
      ===================================== */

      const sortByStartTime = (a, b) => {
        const aTime = a.startAt
          ? new Date(a.startAt).getTime()
          : 0;

        const bTime = b.startAt
          ? new Date(b.startAt).getTime()
          : 0;

        return aTime - bTime;
      };

      const sortedActive = [...active].sort(
        sortByStartTime
      );

      const sortedScheduled = [...scheduled].sort(
        sortByStartTime
      );

      const sortedCompleted =
        [...completed].sort((a, b) => {
          const aTime = a.endedAt?.seconds
            ? a.endedAt.seconds * 1000
            : a.startAt
              ? new Date(a.startAt).getTime()
              : 0;

          const bTime = b.endedAt?.seconds
            ? b.endedAt.seconds * 1000
            : b.startAt
              ? new Date(b.startAt).getTime()
              : 0;

          return bTime - aTime;
        });

      setActiveMeetings(sortedActive);
      setUpcomingMeetings(sortedScheduled);
      setPreviousMeetings(sortedCompleted);

    } catch (err) {
      console.log(
        'MeetingsScreen load error:',
        err
      );

      setError(
        err?.message ||
          'Unable to load meetings.'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================
     REFRESH WHEN SCREEN OPENS
  ========================================= */

  useFocusEffect(
    useCallback(() => {
      loadMeetings();
    }, [])
  );

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (meeting) => {
    if (meeting?.startAt) {
      const date = new Date(
        meeting.startAt
      );

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }
        );
      }
    }

    return (
      meeting?.date ||
      'Date not available'
    );
  };

  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime = (meeting) => {
    if (meeting?.startAt) {
      const date = new Date(
        meeting.startAt
      );

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString(
          'en-IN',
          {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }
        );
      }
    }

    return (
      meeting?.startTime ||
      'Time not available'
    );
  };

  /* =========================================
     DELETE SCHEDULED MEETING
  ========================================= */

  const handleDeleteMeeting = (meeting) => {
    Alert.alert(
      'Delete Meeting?',
      `Are you sure you want to delete "${meeting.title}"?\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              setDeletingMeetingId(
                meeting.id
              );

              await deleteMeeting(
                meeting.id
              );

              setUpcomingMeetings(
                (currentMeetings) =>
                  currentMeetings.filter(
                    (item) =>
                      item.id !== meeting.id
                  )
              );

              Alert.alert(
                'Meeting Deleted',
                'The scheduled meeting has been deleted successfully.'
              );

            } catch (error) {
              console.log(
                'Delete meeting error:',
                error
              );

              Alert.alert(
                'Delete Failed',
                'Unable to delete the meeting. Please try again.'
              );

            } finally {
              setDeletingMeetingId(null);
            }
          },
        },
      ]
    );
  };

  /* =========================================
     ACTIVE MEETING
  ========================================= */

  const renderActiveMeeting = () => {
    if (activeMeetings.length === 0) {
      return (
        <View style={styles.emptyActiveCard}>

          <View style={styles.emptyActiveIcon}>
            <Ionicons
              name="time-outline"
              size={30}
              color={COLORS.gold}
            />
          </View>

          <Text style={styles.emptyActiveTitle}>
            No Active Meeting
          </Text>

          <Text style={styles.emptyActiveText}>
            There is currently no active
            TechSutra meeting.
          </Text>

        </View>
      );
    }

    const meeting = activeMeetings[0];

    return (
      <View style={styles.activeCard}>

        <View style={styles.activeHeader}>

          <View style={styles.activeBadge}>

            <View style={styles.activeDot} />

            <Text style={styles.activeBadgeText}>
              LIVE
            </Text>

          </View>

          <Text style={styles.todayText}>
            {formatDate(meeting).toUpperCase()}
          </Text>

        </View>

        <Text style={styles.meetingTitle}>
          {meeting.title}
        </Text>

        <Text style={styles.description}>
          TechSutra meeting is currently active.
        </Text>

        <View style={styles.detailsRow}>

          <View style={styles.detail}>

            <View style={styles.detailIconContainer}>
              <Ionicons
                name="time-outline"
                size={18}
                color={COLORS.gold}
              />
            </View>

            <View>
              <Text style={styles.detailLabel}>
                TIME
              </Text>

              <Text style={styles.detailValue}>
                {formatTime(meeting)}
              </Text>
            </View>

          </View>

          <View style={styles.detail}>

            <View style={styles.detailIconContainer}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.gold}
              />
            </View>

            <View style={styles.locationContainer}>

              <Text style={styles.detailLabel}>
                LOCATION
              </Text>

              <Text
                style={styles.detailValue}
                numberOfLines={1}
              >
                {meeting.location ||
                  'Location not available'}
              </Text>

            </View>

          </View>

        </View>

        <Pressable
          style={styles.attendanceButton}
          onPress={() =>
            navigation.navigate(
              isPresident
                ? 'LiveAttendance'
                : 'Attendance',
              {
                meetingId: meeting.id,
              }
            )
          }
        >

          <Ionicons
            name={
              isPresident
                ? 'people-outline'
                : 'checkmark-circle-outline'
            }
            size={19}
            color={COLORS.navy}
          />

          <Text style={styles.attendanceText}>
            {isPresident
              ? 'Manage Attendance'
              : 'Join Attendance'}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={COLORS.navy}
            style={styles.arrow}
          />

        </Pressable>

      </View>
    );
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadMeetings(true)
            }
            tintColor={COLORS.goldDark}
          />
        }
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View>

            <Text style={styles.heading}>
              Meetings
            </Text>

            <Text style={styles.subtitle}>
              {isPresident
                ? 'Manage TechSutra meetings'
                : 'Stay connected with TechSutra'}
            </Text>

          </View>

          <View style={styles.calendarIcon}>

            <Ionicons
              name="calendar-outline"
              size={24}
              color={COLORS.navy}
            />

          </View>

        </View>

        {/* LOADING */}

        {loading ? (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color={COLORS.goldDark}
            />

            <Text style={styles.loadingText}>
              Loading meetings...
            </Text>

          </View>

        ) : (

          <>

            {/* ERROR */}

            {error ? (

              <View style={styles.errorCard}>

                <View style={styles.errorIcon}>

                  <Ionicons
                    name="alert-circle-outline"
                    size={25}
                    color={COLORS.danger}
                  />

                </View>

                <Text style={styles.errorTitle}>
                  Unable to load meetings
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={() =>
                    loadMeetings()
                  }
                >

                  <Ionicons
                    name="refresh-outline"
                    size={17}
                    color={COLORS.white}
                  />

                  <Text style={styles.retryText}>
                    Retry
                  </Text>

                </Pressable>

              </View>

            ) : (

              <>

                {/* ACTIVE */}

                <Text style={styles.sectionTitle}>
                  Active Meeting
                </Text>

                {renderActiveMeeting()}

                {/* UPCOMING */}

                <Text style={styles.sectionTitle}>
                  Upcoming Meetings
                </Text>

                {upcomingMeetings.length === 0 ? (

                  <View style={styles.emptyCard}>

                    <View style={styles.emptyIcon}>

                      <Ionicons
                        name="calendar-outline"
                        size={25}
                        color={COLORS.textSecondary}
                      />

                    </View>

                    <Text style={styles.emptyTitle}>
                      No Upcoming Meetings
                    </Text>

                    <Text style={styles.emptyText}>
                      Scheduled meetings will
                      appear here.
                    </Text>

                  </View>

                ) : (

                  upcomingMeetings.map(
                    (meeting) => (

                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        isPresident={isPresident}
                        deletingMeetingId={
                          deletingMeetingId
                        }

                        onEdit={() =>
                          navigation.navigate(
                            'CreateMeeting',
                            {
                              editMode: true,
                              meeting,
                            }
                          )
                        }

                        onDelete={() =>
                          handleDeleteMeeting(
                            meeting
                          )
                        }
                      />

                    )
                  )

                )}

                {/* PREVIOUS */}

                <Text style={styles.sectionTitle}>
                  Previous Meetings
                </Text>

                {previousMeetings.length === 0 ? (

                  <View style={styles.emptyCard}>

                    <View style={styles.emptyIcon}>

                      <Ionicons
                        name="time-outline"
                        size={25}
                        color={COLORS.textSecondary}
                      />

                    </View>

                    <Text style={styles.emptyTitle}>
                      No Previous Meetings
                    </Text>

                    <Text style={styles.emptyText}>
                      Completed meetings will
                      appear here.
                    </Text>

                  </View>

                ) : (

                  previousMeetings.map(
                    (meeting) => (

                      <PreviousMeeting
                        key={meeting.id}
                        meeting={meeting}
                      />

                    )
                  )

                )}

              </>

            )}

          </>

        )}

      </ScrollView>

    </View>
  );
}

/* =========================================================
   UPCOMING MEETING CARD
========================================================= */

function MeetingCard({
  meeting,
  isPresident,
  deletingMeetingId,
  onEdit,
  onDelete,
}) {
  const {
    day,
    month,
  } = getMeetingDateParts(meeting);

  return (
    <View style={styles.meetingCard}>

      <View style={styles.meetingCardMain}>

        <View style={styles.dateBox}>

          <Text style={styles.dateDay}>
            {day}
          </Text>

          <Text style={styles.dateMonth}>
            {month}
          </Text>

        </View>

        <View style={styles.meetingCardInfo}>

          <Text
            style={styles.meetingCardTitle}
            numberOfLines={1}
          >
            {meeting.title}
          </Text>

          <View style={styles.cardDetailRow}>

            <Ionicons
              name="time-outline"
              size={13}
              color={COLORS.textSecondary}
            />

            <Text style={styles.meetingCardDetails}>
              {getMeetingTime(meeting)}
            </Text>

          </View>

          <View style={styles.cardDetailRow}>

            <Ionicons
              name="location-outline"
              size={13}
              color={COLORS.textSecondary}
            />

            <Text
              style={styles.meetingCardDetails}
              numberOfLines={1}
            >
              {meeting.location ||
                'Location not available'}
            </Text>

          </View>

        </View>

      </View>

      {/* PRESIDENT CONTROLS */}

      {isPresident ? (

        <View style={styles.meetingActions}>

          <Pressable
            style={styles.editButton}
            onPress={onEdit}
          >

            <Ionicons
              name="create-outline"
              size={17}
              color={COLORS.navy}
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>

          </Pressable>

          <Pressable
            style={styles.deleteButton}
            disabled={
              deletingMeetingId === meeting.id
            }
            onPress={onDelete}
          >

            {deletingMeetingId === meeting.id ? (

              <ActivityIndicator
                size="small"
                color={COLORS.danger}
              />

            ) : (

              <>
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={COLORS.danger}
                />

                <Text style={styles.deleteButtonText}>
                  Delete
                </Text>
              </>

            )}

          </Pressable>

        </View>

      ) : (

        <View style={styles.scheduledInfoRow}>

          <Ionicons
            name="time-outline"
            size={14}
            color={COLORS.textLight}
          />

          <Text style={styles.scheduledInfoText}>
            Scheduled meeting
          </Text>

        </View>

      )}

    </View>
  );
}

/* =========================================================
   PREVIOUS MEETING
========================================================= */

function PreviousMeeting({ meeting }) {
  const status =
    meeting?.attendanceStatus ||
    'Completed';

  const isAbsent =
    status.toLowerCase() === 'absent';

  return (
    <View style={styles.previousCard}>

      <View style={styles.previousIcon}>

        <Ionicons
          name="clipboard-outline"
          size={21}
          color={COLORS.navy}
        />

      </View>

      <View style={styles.previousInfo}>

        <Text
          style={styles.previousTitle}
          numberOfLines={1}
        >
          {meeting.title}
        </Text>

        <View style={styles.previousDateRow}>

          <Ionicons
            name="calendar-outline"
            size={12}
            color={COLORS.textSecondary}
          />

          <Text style={styles.previousDate}>
            {getMeetingDate(meeting)}
          </Text>

        </View>

      </View>

      <View
        style={[
          styles.statusBadge,
          isAbsent && styles.absentBadge,
        ]}
      >

        <Ionicons
          name={
            isAbsent
              ? 'close-circle-outline'
              : 'checkmark-circle-outline'
          }
          size={13}
          color={
            isAbsent
              ? COLORS.danger
              : COLORS.success
          }
        />

        <Text
          style={[
            styles.statusText,
            isAbsent && styles.absentText,
          ]}
        >
          {status}
        </Text>

      </View>

    </View>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getMeetingDate(meeting) {
  if (meeting?.startAt) {
    const date = new Date(
      meeting.startAt
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );
    }
  }

  return (
    meeting?.date ||
    'Date not available'
  );
}

function getMeetingTime(meeting) {
  if (meeting?.startAt) {
    const date = new Date(
      meeting.startAt
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString(
        'en-IN',
        {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }
      );
    }
  }

  return (
    meeting?.startTime ||
    'Time not available'
  );
}

function getMeetingDateParts(meeting) {
  const date = getMeetingDate(meeting);

  const parts = date.split(' ');

  return {
    day: parts[0] || '--',
    month: parts[1] || '---',
  };
}

/* =========================================================
   STYLES
========================================================= */

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
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 13,
  },

  /* =========================================
     ACTIVE MEETING
  ========================================= */

  activeCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 21,
    padding: 22,
  },

  emptyActiveCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 21,
    padding: 24,
    alignItems: 'center',
  },

  emptyActiveIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor:
      'rgba(255,198,41,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyActiveTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
  },

  emptyActiveText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,198,41,0.15)',
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

  detailIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor:
      'rgba(255,198,41,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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

  locationContainer: {
    flex: 1,
  },

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
    marginLeft: 7,
  },

  arrow: {
    marginLeft: 9,
  },

  /* =========================================
     UPCOMING MEETINGS
  ========================================= */

  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 11,
  },

  meetingCardMain: {
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

  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  meetingCardDetails: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginLeft: 5,
    flexShrink: 1,
  },

  /* =========================================
     PRESIDENT ACTIONS
  ========================================= */

  meetingActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  editButtonText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },

  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },

  scheduledInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  scheduledInfoText: {
    color: COLORS.textLight,
    fontSize: 10,
    marginLeft: 5,
  },

  /* =========================================
     PREVIOUS
  ========================================= */

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
    marginRight: 8,
  },

  previousTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  previousDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  previousDate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginLeft: 4,
  },

  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },

  absentBadge: {
    backgroundColor: '#FEE2E2',
  },

  absentText: {
    color: COLORS.danger,
  },

  /* =========================================
     LOADING
  ========================================= */

  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },

  /* =========================================
     EMPTY
  ========================================= */

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },

  /* =========================================
     ERROR
  ========================================= */

  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginTop: 28,
  },

  errorIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  errorTitle: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '800',
  },

  errorText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.navy,
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});