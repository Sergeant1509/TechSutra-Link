import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../theme/colors';

import { auth } from '../../services/firebase';

import {
  createMeeting,
  updateMeeting,
} from '../../services/meetingService';

const DURATION_OPTIONS = [
  15,
  30,
  45,
  60,
  90,
  120,
];

const pad = (number) =>
  String(number).padStart(2, '0');

const formatDate = (date) => {
  return date.toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
};

const formatTime12Hour = (date) => {
  let hours = date.getHours();

  const minutes = date.getMinutes();

  const period =
    hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${pad(minutes)} ${period}`;
};

const isSameDay = (
  date1,
  date2
) => {
  return (
    date1.getFullYear() ===
      date2.getFullYear() &&
    date1.getMonth() ===
      date2.getMonth() &&
    date1.getDate() ===
      date2.getDate()
  );
};

/* =========================================
   CONVERT FIREBASE / ISO DATE TO JS DATE
========================================= */

const parseMeetingDate = (
  meeting
) => {
  if (!meeting) {
    return new Date();
  }

  if (meeting.startAt) {
    const parsed =
      new Date(meeting.startAt);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed;
    }
  }

  if (meeting.date) {
    const parsed =
      new Date(meeting.date);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed;
    }
  }

  return new Date();
};

/* =========================================
   PARSE TIME FROM MEETING
========================================= */

const parseMeetingTime = (
  meeting
) => {
  if (meeting?.startAt) {
    const parsed =
      new Date(meeting.startAt);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed;
    }
  }

  if (meeting?.startTime) {
    const timeMatch =
      meeting.startTime.match(
        /(\d{1,2}):(\d{2})\s*(AM|PM)/i
      );

    if (timeMatch) {
      let hours =
        parseInt(
          timeMatch[1],
          10
        );

      const minutes =
        parseInt(
          timeMatch[2],
          10
        );

      const period =
        timeMatch[3].toUpperCase();

      if (
        period === 'PM' &&
        hours !== 12
      ) {
        hours += 12;
      }

      if (
        period === 'AM' &&
        hours === 12
      ) {
        hours = 0;
      }

      const date = new Date();

      date.setHours(
        hours,
        minutes,
        0,
        0
      );

      return date;
    }
  }

  return new Date();
};

export default function CreateMeetingScreen({
  navigation,
  route,
}) {

  /* =========================================
     EDIT MODE
  ========================================= */

  const editMode =
    route?.params?.editMode === true;

  const editingMeeting =
    route?.params?.meeting || null;

  /* =========================================
     INITIAL DATE / TIME
  ========================================= */

  const initialMeetingDate =
    useMemo(() => {
      if (
        editMode &&
        editingMeeting
      ) {
        return parseMeetingDate(
          editingMeeting
        );
      }

      const date = new Date();

      date.setHours(
        12,
        0,
        0,
        0
      );

      return date;
    }, [
      editMode,
      editingMeeting,
    ]);

  const initialMeetingTime =
    useMemo(() => {
      if (
        editMode &&
        editingMeeting
      ) {
        return parseMeetingTime(
          editingMeeting
        );
      }

      const date = new Date();

      date.setMinutes(
        0,
        0,
        0
      );

      date.setHours(
        date.getHours() + 1
      );

      return date;
    }, [
      editMode,
      editingMeeting,
    ]);

  /* =========================================
     STATE
  ========================================= */

  const [meetingMode, setMeetingMode] =
    useState(
      editMode
        ? 'schedule'
        : 'schedule'
    );

  const [title, setTitle] =
    useState(
      editMode
        ? editingMeeting?.title ||
            ''
        : ''
    );

  const [location, setLocation] =
    useState(
      editMode
        ? editingMeeting?.location ||
            ''
        : ''
    );

  const [selectedDate, setSelectedDate] =
    useState(
      initialMeetingDate
    );

  const [selectedTime, setSelectedTime] =
    useState(
      initialMeetingTime
    );

  const [duration, setDuration] =
    useState(
      editMode
        ? Number(
            editingMeeting?.duration
          ) || 30
        : 30
    );

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  /* =========================================
     TODAY
  ========================================= */

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }, []);

  /* =========================================
     DATE PICKER
  ========================================= */

  const handleDateChange = (
    event,
    date
  ) => {
    setShowDatePicker(false);

    if (
      !date ||
      event?.type === 'dismissed'
    ) {
      return;
    }

    const newDate =
      new Date(date);

    newDate.setHours(
      12,
      0,
      0,
      0
    );

    setSelectedDate(
      newDate
    );
  };

  /* =========================================
     TIME PICKER
  ========================================= */

  const handleTimeChange = (
    event,
    date
  ) => {
    setShowTimePicker(false);

    if (
      !date ||
      event?.type === 'dismissed'
    ) {
      return;
    }

    const newTime =
      new Date(
        selectedTime
      );

    newTime.setHours(
      date.getHours(),
      date.getMinutes(),
      0,
      0
    );

    setSelectedTime(
      newTime
    );
  };

  /* =========================================
     COMBINE DATE + TIME
  ========================================= */

  const getScheduledDateTime =
    () => {
      const meetingDateTime =
        new Date(
          selectedDate
        );

      meetingDateTime.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0
      );

      return meetingDateTime;
    };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {

    if (!title.trim()) {
      Alert.alert(
        'Meeting Title Required',
        'Please enter a meeting title.'
      );

      return false;
    }

    if (!location.trim()) {
      Alert.alert(
        'Location Required',
        'Please enter the meeting location.'
      );

      return false;
    }

    /*
      Future-time validation is required
      when creating a scheduled meeting.

      During edit mode we also validate the
      resulting meeting time so the President
      cannot accidentally save a past meeting.
    */

    if (
      meetingMode ===
      'schedule'
    ) {
      const scheduledDateTime =
        getScheduledDateTime();

      if (
        scheduledDateTime <=
        new Date()
      ) {
        Alert.alert(
          'Invalid Meeting Time',
          'Please select a future date and time.'
        );

        return false;
      }
    }

    return true;
  };

  /* =========================================
     MAIN SUBMIT
  ========================================= */

  const handleCreateMeeting =
    async () => {

      if (creating) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user) {
        Alert.alert(
          'Authentication Error',
          'You are not logged in. Please login again.'
        );

        return;
      }

      /*
       * EDIT MODE
       */

      if (editMode) {

        if (!editingMeeting?.id) {
          Alert.alert(
            'Meeting Error',
            'The selected meeting could not be identified.'
          );

          return;
        }

        try {
          setCreating(true);

          const scheduledDateTime =
            getScheduledDateTime();

          await updateMeeting(
            editingMeeting.id,
            {
              title: title.trim(),
              location: location.trim(),
              date: formatDate(
                scheduledDateTime
              ),
              startTime:
                formatTime12Hour(
                  scheduledDateTime
                ),
              startAt:
                scheduledDateTime.toISOString(),
              duration:
                Number(duration) || 30,
            }
          );

          Alert.alert(
            'Meeting Updated',
            `${title.trim()}\n\n${formatDate(
              scheduledDateTime
            )} at ${formatTime12Hour(
              scheduledDateTime
            )}`,
            [
              {
                text: 'OK',
                onPress: () =>
                  navigation.goBack(),
              },
            ]
          );

        } catch (error) {

          console.log(
            'Update meeting error:',
            error
          );

          Alert.alert(
            'Unable to Update Meeting',
            error?.message ||
              'Something went wrong while updating the meeting.'
          );

        } finally {
          setCreating(false);
        }

        return;
      }

      /*
       * NORMAL CREATE FLOW
       */

      try {

        setCreating(true);

        /* =====================================
           START NOW
        ===================================== */

        if (
          meetingMode ===
          'active'
        ) {

          const now =
            new Date();

          const meeting =
            await createMeeting({
              title:
                title.trim(),

              location:
                location.trim(),

              date:
                formatDate(now),

              startTime:
                formatTime12Hour(now),

              startAt:
                now.toISOString(),

              duration,

              createdBy:
                user.uid,

              status:
                'active',
            });

          Alert.alert(
            'Meeting Started',
            `${meeting.title}\n\n${formatDate(
              now
            )} at ${formatTime12Hour(
              now
            )}`,
            [
              {
                text: 'Continue',

                onPress: () =>
                  navigation.replace(
                    'LiveAttendance',
                    {
                      meetingId:
                        meeting.id,
                    }
                  ),
              },
            ]
          );

          return;
        }

        /* =====================================
           SCHEDULE MEETING
        ===================================== */

        const scheduledDateTime =
          getScheduledDateTime();

        const meeting =
          await createMeeting({
            title:
              title.trim(),

            location:
              location.trim(),

            date:
              formatDate(
                scheduledDateTime
              ),

            startTime:
              formatTime12Hour(
                scheduledDateTime
              ),

            startAt:
              scheduledDateTime.toISOString(),

            duration,

            createdBy:
              user.uid,

            status:
              'scheduled',
          });

        Alert.alert(
          'Meeting Scheduled',
          `${meeting.title}\n\n${formatDate(
            scheduledDateTime
          )} at ${formatTime12Hour(
            scheduledDateTime
          )}`,
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.goBack(),
            },
          ]
        );

      } catch (error) {

        console.log(
          'Create meeting error:',
          error
        );

        Alert.alert(
          'Unable to Create Meeting',
          error?.message ||
            'Something went wrong while creating the meeting.'
        );

      } finally {
        setCreating(false);
      }
    };

  /* =========================================
     RETURN UI
  ========================================= */

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
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            style={
              styles.backButton
            }
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

          <View
            style={
              styles.headerTextContainer
            }
          >

            <Text
              style={
                styles.headerTitle
              }
            >
              {editMode
                ? 'Edit Meeting'
                : 'Create Meeting'}
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              {editMode
                ? 'Update your TechSutra meeting'
                : 'Organize your TechSutra meeting'}
            </Text>

          </View>

        </View>

        {/* MEETING TYPE */}

        <View style={styles.section}>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Meeting Type
          </Text>

          <View
            style={
              styles.modeContainer
            }
          >

            {/* SCHEDULE */}

            <Pressable
              style={[
                styles.modeCard,
                meetingMode ===
                  'schedule' &&
                  styles.modeCardActive,
              ]}
              onPress={() =>
                !editMode &&
                setMeetingMode(
                  'schedule'
                )
              }
            >

              <View
                style={[
                  styles.modeIcon,
                  meetingMode ===
                    'schedule' &&
                    styles.modeIconActive,
                ]}
              >

                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={
                    meetingMode ===
                    'schedule'
                      ? COLORS.white
                      : COLORS.navy
                  }
                />

              </View>

              <View
                style={
                  styles.modeTextContainer
                }
              >

                <Text
                  style={[
                    styles.modeTitle,
                    meetingMode ===
                      'schedule' &&
                      styles.modeTitleActive,
                  ]}
                >
                  Schedule Meeting
                </Text>

                <Text
                  style={[
                    styles.modeDescription,
                    meetingMode ===
                      'schedule' &&
                      styles.modeDescriptionActive,
                  ]}
                >
                  Plan a meeting for later
                </Text>

              </View>

              {meetingMode ===
                'schedule' && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={
                    COLORS.gold
                  }
                />
              )}

            </Pressable>

            {/* START NOW */}

            {!editMode && (
              <Pressable
                style={[
                  styles.modeCard,
                  meetingMode ===
                    'active' &&
                    styles.modeCardActive,
                ]}
                onPress={() =>
                  setMeetingMode(
                    'active'
                  )
                }
              >

                <View
                  style={[
                    styles.modeIcon,
                    meetingMode ===
                      'active' &&
                      styles.modeIconActive,
                  ]}
                >

                  <Ionicons
                    name="play-outline"
                    size={22}
                    color={
                      meetingMode ===
                      'active'
                        ? COLORS.white
                        : COLORS.navy
                    }
                  />

                </View>

                <View
                  style={
                    styles.modeTextContainer
                  }
                >

                  <Text
                    style={[
                      styles.modeTitle,
                      meetingMode ===
                        'active' &&
                        styles.modeTitleActive,
                    ]}
                  >
                    Start Now
                  </Text>

                  <Text
                    style={[
                      styles.modeDescription,
                      meetingMode ===
                        'active' &&
                        styles.modeDescriptionActive,
                    ]}
                  >
                    Start attendance immediately
                  </Text>

                </View>

                {meetingMode ===
                  'active' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={
                      COLORS.gold
                    }
                  />
                )}

              </Pressable>
            )}

          </View>

        </View>

        {/* MEETING DETAILS */}

        <View style={styles.section}>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Meeting Details
          </Text>

          {/* TITLE */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={
                styles.inputLabel
              }
            >
              Meeting Title
            </Text>

            <View
              style={
                styles.inputContainer
              }
            >

              <Ionicons
                name="create-outline"
                size={20}
                color={
                  COLORS.textSecondary
                }
              />

              <TextInput
                value={title}
                onChangeText={
                  setTitle
                }
                placeholder="e.g. TechSutra Weekly Meeting"
                placeholderTextColor={
                  COLORS.textLight
                }
                style={
                  styles.input
                }
                maxLength={80}
              />

            </View>

          </View>

          {/* LOCATION */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={
                styles.inputLabel
              }
            >
              Location
            </Text>

            <View
              style={
                styles.inputContainer
              }
            >

              <Ionicons
                name="location-outline"
                size={20}
                color={
                  COLORS.textSecondary
                }
              />

              <TextInput
                value={location}
                onChangeText={
                  setLocation
                }
                placeholder="e.g. Seminar Hall"
                placeholderTextColor={
                  COLORS.textLight
                }
                style={
                  styles.input
                }
                maxLength={100}
              />

            </View>

          </View>

        </View>

        {/* SCHEDULE */}

        {meetingMode ===
          'schedule' && (

          <View
            style={
              styles.section
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Schedule
            </Text>

            {/* DATE */}

            <View
              style={
                styles.inputGroup
              }
            >

              <Text
                style={
                  styles.inputLabel
                }
              >
                Meeting Date
              </Text>

              <Pressable
                style={
                  styles.selectionCard
                }
                onPress={() =>
                  setShowDatePicker(
                    true
                  )
                }
              >

                <View
                  style={
                    styles.selectionIcon
                  }
                >

                  <Ionicons
                    name="calendar"
                    size={21}
                    color={
                      COLORS.navy
                    }
                  />

                </View>

                <View
                  style={
                    styles.selectionTextContainer
                  }
                >

                  <Text
                    style={
                      styles.selectionLabel
                    }
                  >
                    Date
                  </Text>

                  <Text
                    style={
                      styles.selectionValue
                    }
                  >
                    {formatDate(
                      selectedDate
                    )}
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    COLORS.textLight
                  }
                />

              </Pressable>

            </View>

            {/* TIME */}

            <View
              style={
                styles.inputGroup
              }
            >

              <Text
                style={
                  styles.inputLabel
                }
              >
                Meeting Time
              </Text>

              <Pressable
                style={
                  styles.selectionCard
                }
                onPress={() =>
                  setShowTimePicker(
                    true
                  )
                }
              >

                <View
                  style={
                    styles.selectionIcon
                  }
                >

                  <Ionicons
                    name="time"
                    size={21}
                    color={
                      COLORS.navy
                    }
                  />

                </View>

                <View
                  style={
                    styles.selectionTextContainer
                  }
                >

                  <Text
                    style={
                      styles.selectionLabel
                    }
                  >
                    Time
                  </Text>

                  <Text
                    style={
                      styles.selectionValue
                    }
                  >
                    {formatTime12Hour(
                      selectedTime
                    )}
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    COLORS.textLight
                  }
                />

              </Pressable>

            </View>

            {/* DATE PICKER */}

            {showDatePicker && (
              <DateTimePicker
                value={
                  selectedDate
                }
                mode="date"
                minimumDate={
                  today
                }
                display={
                  Platform.OS ===
                  'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={
                  handleDateChange
                }
              />
            )}

            {/* TIME PICKER */}

            {showTimePicker && (
              <DateTimePicker
                value={
                  selectedTime
                }
                mode="time"
                display={
                  Platform.OS ===
                  'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={
                  handleTimeChange
                }
              />
            )}

            {/* INFO */}

            {isSameDay(
              selectedDate,
              today
            ) && (

              <View
                style={
                  styles.infoBox
                }
              >

                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color={
                    COLORS.navy
                  }
                />

                <Text
                  style={
                    styles.infoText
                  }
                >
                  If you select today,
                  the meeting time
                  must be later than
                  the current time.
                </Text>

              </View>

            )}

          </View>

        )}

        {/* DURATION */}

        <View style={styles.section}>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Meeting Duration
          </Text>

          <View
            style={
              styles.durationGrid
            }
          >

            {DURATION_OPTIONS.map(
              (item) => {

                const selected =
                  duration === item;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.durationOption,
                      selected &&
                        styles.durationOptionActive,
                    ]}
                    onPress={() =>
                      setDuration(
                        item
                      )
                    }
                  >

                    <Text
                      style={[
                        styles.durationValue,
                        selected &&
                          styles.durationValueActive,
                      ]}
                    >
                      {item}
                    </Text>

                    <Text
                      style={[
                        styles.durationUnit,
                        selected &&
                          styles.durationUnitActive,
                      ]}
                    >
                      min
                    </Text>

                  </Pressable>
                );
              }
            )}

          </View>

        </View>

        {/* ATTENDANCE INFORMATION */}

        <View
          style={
            styles.attendanceInfo
          }
        >

          <View
            style={
              styles.attendanceInfoIcon
            }
          >

            <Ionicons
              name="radio-outline"
              size={22}
              color={
                COLORS.navy
              }
            />

          </View>

          <View
            style={
              styles.attendanceInfoContent
            }
          >

            <Text
              style={
                styles.attendanceInfoTitle
              }
            >
              Automatic Proximity Attendance
            </Text>

            <Text
              style={
                styles.attendanceInfoText
              }
            >
              Members can automatically
              mark attendance during
              the first 5 minutes after
              the meeting starts.
            </Text>

          </View>

        </View>

        {/* SUBMIT BUTTON */}

        <Pressable
          style={[
            styles.createButton,
            creating &&
              styles.createButtonDisabled,
          ]}
          onPress={
            handleCreateMeeting
          }
          disabled={creating}
        >

          {creating ? (

            <Text
              style={
                styles.createButtonText
              }
            >
              {editMode
                ? 'Saving...'
                : 'Creating...'}
            </Text>

          ) : (

            <>

              <Ionicons
                name={
                  editMode
                    ? 'checkmark-circle-outline'
                    : meetingMode ===
                      'active'
                      ? 'play-circle-outline'
                      : 'calendar-outline'
                }
                size={22}
                color={
                  COLORS.white
                }
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                {editMode
                  ? 'Save Changes'
                  : meetingMode ===
                    'active'
                    ? 'Create & Start Meeting'
                    : 'Schedule Meeting'}
              </Text>

            </>

          )}

        </Pressable>

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.navy,
  },

  headerSubtitle: {
    fontSize: 13,
    color:
      COLORS.textSecondary,
    marginTop: 3,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 12,
  },

  modeContainer: {
    gap: 11,
  },

  modeCard: {
    minHeight: 82,
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modeCardActive: {
    backgroundColor:
      COLORS.navy,
    borderColor:
      COLORS.navy,
  },

  modeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  modeIconActive: {
    backgroundColor:
      COLORS.navyLight,
  },

  modeTextContainer: {
    flex: 1,
  },

  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.navy,
  },

  modeTitleActive: {
    color: COLORS.white,
  },

  modeDescription: {
    fontSize: 12,
    color:
      COLORS.textSecondary,
    marginTop: 4,
  },

  modeDescriptionActive: {
    color: '#CBD5E1',
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 7,
  },

  inputContainer: {
    height: 54,
    borderRadius: 15,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  selectionCard: {
    minHeight: 68,
    borderRadius: 16,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      '#EEF3F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  selectionLabel: {
    fontSize: 11,
    color:
      COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 3,
  },

  selectionValue: {
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: '800',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      '#EEF3F9',
    borderRadius: 13,
    padding: 12,
    marginTop: 2,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    color:
      COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  durationOption: {
    width: '30%',
    minHeight: 58,
    borderRadius: 14,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  durationOptionActive: {
    backgroundColor:
      COLORS.navy,
    borderColor:
      COLORS.navy,
  },

  durationValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.navy,
  },

  durationValueActive: {
    color: COLORS.white,
  },

  durationUnit: {
    fontSize: 10,
    color:
      COLORS.textSecondary,
    marginTop: 1,
  },

  durationUnitActive: {
    color: '#CBD5E1',
  },

  attendanceInfo: {
    flexDirection: 'row',
    backgroundColor:
      '#FFF9E8',
    borderWidth: 1,
    borderColor:
      '#F8E6A8',
    borderRadius: 17,
    padding: 14,
    marginBottom: 20,
  },

  attendanceInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      '#FFF1BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  attendanceInfoContent: {
    flex: 1,
  },

  attendanceInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },

  attendanceInfoText: {
    fontSize: 12,
    lineHeight: 18,
    color:
      COLORS.textSecondary,
  },

  createButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor:
      COLORS.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  createButtonDisabled: {
    opacity: 0.6,
  },

  createButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },

});