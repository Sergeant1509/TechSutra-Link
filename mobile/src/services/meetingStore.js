let activeMeeting = null;
let scheduledMeetings = [];
let meetingHistory = [];

/*
|--------------------------------------------------------------------------
| Create Meeting
|--------------------------------------------------------------------------
*/

export const createMeeting = ({
  title,
  date,
  time,
  location,
  duration,
  mode = 'scheduled',
  startAt = null,
}) => {
  const now = new Date();

  const meeting = {
    id: `MTG-${Date.now()}`,

    sessionId: `TS-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`,

    title: title?.trim() || 'TechSutra Meeting',

    date,

    time,

    location: location?.trim() || 'TechSutra Campus',

    duration: Number(duration) || 30,

    mode,

    status: mode === 'active' ? 'active' : 'scheduled',

    startAt,

    createdAt: now.toISOString(),

    startedAt:
      mode === 'active'
        ? now.toISOString()
        : null,

    endedAt: null,

    /*
     * Automatic proximity attendance is available
     * only for the first 5 minutes.
     */
    attendanceWindow: {
      durationMinutes: 5,

      startsAt:
        mode === 'active'
          ? now.toISOString()
          : null,

      endsAt:
        mode === 'active'
          ? new Date(
              now.getTime() + 5 * 60 * 1000
            ).toISOString()
          : null,

      automaticAttendanceOpen:
        mode === 'active',
    },

    stats: {
      present: 0,
      verifying: 0,
      absent: 0,
      manuallyMarked: 0,
    },

    /*
     * This will eventually contain real attendance
     * records from the backend.
     */
    attendance: [],
  };

  if (mode === 'active') {
    activeMeeting = meeting;
  } else {
    scheduledMeetings.unshift(meeting);
  }

  return meeting;
};

/*
|--------------------------------------------------------------------------
| Getters
|--------------------------------------------------------------------------
*/

export const getActiveMeeting = () => {
  return activeMeeting;
};

export const getScheduledMeetings = () => {
  return scheduledMeetings;
};

export const getMeetingHistory = () => {
  return meetingHistory;
};

/*
|--------------------------------------------------------------------------
| Find Meeting
|--------------------------------------------------------------------------
*/

export const getMeetingById = (meetingId) => {
  if (!meetingId) {
    return null;
  }

  if (activeMeeting?.id === meetingId) {
    return activeMeeting;
  }

  const scheduledMeeting = scheduledMeetings.find(
    (meeting) => meeting.id === meetingId
  );

  if (scheduledMeeting) {
    return scheduledMeeting;
  }

  const historicalMeeting = meetingHistory.find(
    (meeting) => meeting.id === meetingId
  );

  return historicalMeeting || null;
};

/*
|--------------------------------------------------------------------------
| Start Scheduled Meeting
|--------------------------------------------------------------------------
*/

export const startMeeting = (meetingId) => {
  const index = scheduledMeetings.findIndex(
    (meeting) => meeting.id === meetingId
  );

  if (index === -1) {
    return null;
  }

  /*
   * If another meeting is already active,
   * don't overwrite it.
   */
  if (activeMeeting) {
    return null;
  }

  const scheduledMeeting = scheduledMeetings[index];

  const now = new Date();

  const startedMeeting = {
    ...scheduledMeeting,

    status: 'active',

    mode: 'active',

    startedAt: now.toISOString(),

    attendanceWindow: {
      durationMinutes: 5,

      startsAt: now.toISOString(),

      endsAt: new Date(
        now.getTime() + 5 * 60 * 1000
      ).toISOString(),

      automaticAttendanceOpen: true,
    },

    stats: {
      ...scheduledMeeting.stats,
    },
  };

  /*
   * Remove from scheduled meetings.
   */
  scheduledMeetings.splice(index, 1);

  /*
   * Make it the active meeting.
   */
  activeMeeting = startedMeeting;

  return activeMeeting;
};

/*
|--------------------------------------------------------------------------
| Automatic Attendance Status
|--------------------------------------------------------------------------
*/

export const isAutomaticAttendanceOpen = () => {
  if (!activeMeeting) {
    return false;
  }

  const attendanceWindow =
    activeMeeting.attendanceWindow;

  if (!attendanceWindow) {
    return false;
  }

  if (!attendanceWindow.automaticAttendanceOpen) {
    return false;
  }

  if (!attendanceWindow.endsAt) {
    return false;
  }

  const now = Date.now();

  const endTime = new Date(
    attendanceWindow.endsAt
  ).getTime();

  /*
   * Five-minute automatic attendance window
   * has expired.
   */
  if (now >= endTime) {
    activeMeeting = {
      ...activeMeeting,

      attendanceWindow: {
        ...attendanceWindow,

        automaticAttendanceOpen: false,
      },
    };

    return false;
  }

  return true;
};

/*
|--------------------------------------------------------------------------
| Get Remaining Automatic Attendance Time
|--------------------------------------------------------------------------
*/

export const getAutomaticAttendanceRemainingSeconds =
  () => {
    if (!activeMeeting) {
      return 0;
    }

    const attendanceWindow =
      activeMeeting.attendanceWindow;

    if (!attendanceWindow?.endsAt) {
      return 0;
    }

    if (
      !attendanceWindow.automaticAttendanceOpen
    ) {
      return 0;
    }

    const now = Date.now();

    const endTime = new Date(
      attendanceWindow.endsAt
    ).getTime();

    const remainingMilliseconds =
      endTime - now;

    if (remainingMilliseconds <= 0) {
      closeAutomaticAttendance();
      return 0;
    }

    return Math.ceil(
      remainingMilliseconds / 1000
    );
  };

/*
|--------------------------------------------------------------------------
| Close Automatic Attendance
|--------------------------------------------------------------------------
*/

export const closeAutomaticAttendance = () => {
  if (!activeMeeting) {
    return null;
  }

  activeMeeting = {
    ...activeMeeting,

    attendanceWindow: {
      ...activeMeeting.attendanceWindow,

      automaticAttendanceOpen: false,
    },
  };

  return activeMeeting;
};

/*
|--------------------------------------------------------------------------
| Manual Attendance
|--------------------------------------------------------------------------
|
| President can manually mark attendance even after
| automatic proximity attendance has closed.
|--------------------------------------------------------------------------
*/

export const markMemberManually = (
  memberId,
  status = 'present'
) => {
  if (!activeMeeting) {
    return null;
  }

  if (!memberId) {
    return activeMeeting;
  }

  const existingIndex =
    activeMeeting.attendance.findIndex(
      (record) =>
        record.memberId === memberId
    );

  const attendanceRecord = {
    memberId,

    status,

    method: 'manual',

    markedBy: 'president',

    markedAt: new Date().toISOString(),
  };

  let updatedAttendance = [
    ...activeMeeting.attendance,
  ];

  /*
   * If the member was already marked,
   * update their existing record instead
   * of creating duplicates.
   */
  if (existingIndex !== -1) {
    updatedAttendance[existingIndex] =
      attendanceRecord;
  } else {
    updatedAttendance.push(
      attendanceRecord
    );
  }

  const presentCount =
    updatedAttendance.filter(
      (record) =>
        record.status === 'present'
    ).length;

  const absentCount =
    updatedAttendance.filter(
      (record) =>
        record.status === 'absent'
    ).length;

  const manuallyMarkedCount =
    updatedAttendance.filter(
      (record) =>
        record.method === 'manual'
    ).length;

  activeMeeting = {
    ...activeMeeting,

    attendance: updatedAttendance,

    stats: {
      ...activeMeeting.stats,

      present: presentCount,

      absent: absentCount,

      manuallyMarked:
        manuallyMarkedCount,
    },
  };

  return activeMeeting;
};

/*
|--------------------------------------------------------------------------
| Proximity Attendance
|--------------------------------------------------------------------------
|
| This function will later be called by the BLE
| verification system.
|--------------------------------------------------------------------------
*/

export const markMemberByProximity = (
  memberId,
  proximityVerifiedSeconds = 0
) => {
  if (!activeMeeting) {
    return null;
  }

  /*
   * IMPORTANT:
   * Proximity attendance is allowed ONLY while
   * the automatic attendance window is open.
   */
  if (!isAutomaticAttendanceOpen()) {
    return null;
  }

  if (!memberId) {
    return null;
  }

  const existingIndex =
    activeMeeting.attendance.findIndex(
      (record) =>
        record.memberId === memberId
    );

  const attendanceRecord = {
    memberId,

    status: 'present',

    method: 'proximity',

    markedBy: 'system',

    proximityVerifiedSeconds,

    markedAt: new Date().toISOString(),
  };

  let updatedAttendance = [
    ...activeMeeting.attendance,
  ];

  /*
   * Don't create duplicate attendance
   * records for the same member.
   */
  if (existingIndex !== -1) {
    updatedAttendance[existingIndex] =
      attendanceRecord;
  } else {
    updatedAttendance.push(
      attendanceRecord
    );
  }

  const presentCount =
    updatedAttendance.filter(
      (record) =>
        record.status === 'present'
    ).length;

  activeMeeting = {
    ...activeMeeting,

    attendance: updatedAttendance,

    stats: {
      ...activeMeeting.stats,

      present: presentCount,
    },
  };

  return activeMeeting;
};

/*
|--------------------------------------------------------------------------
| Update Meeting Statistics
|--------------------------------------------------------------------------
*/

export const updateMeetingStats = (
  stats = {}
) => {
  if (!activeMeeting) {
    return null;
  }

  activeMeeting = {
    ...activeMeeting,

    stats: {
      ...activeMeeting.stats,

      ...stats,
    },
  };

  return activeMeeting;
};

/*
|--------------------------------------------------------------------------
| Delete Scheduled Meeting
|--------------------------------------------------------------------------
*/

export const deleteScheduledMeeting = (
  meetingId
) => {
  const index = scheduledMeetings.findIndex(
    (meeting) =>
      meeting.id === meetingId
  );

  if (index === -1) {
    return false;
  }

  scheduledMeetings.splice(index, 1);

  return true;
};

/*
|--------------------------------------------------------------------------
| End Active Meeting
|--------------------------------------------------------------------------
*/

export const endMeeting = () => {
  if (!activeMeeting) {
    return null;
  }

  /*
   * Automatically close proximity attendance
   * when the meeting ends.
   */
  const completedMeeting = {
    ...activeMeeting,

    status: 'completed',

    endedAt: new Date().toISOString(),

    attendanceWindow: {
      ...activeMeeting.attendanceWindow,

      automaticAttendanceOpen: false,
    },
  };

  /*
   * Save completed meeting to history.
   */
  meetingHistory.unshift(
    completedMeeting
  );

  /*
   * Clear active meeting.
   */
  activeMeeting = null;

  return completedMeeting;
};

/*
|--------------------------------------------------------------------------
| Clear Store
|--------------------------------------------------------------------------
|
| Development helper only.
|--------------------------------------------------------------------------
*/

export const clearMeetingStore = () => {
  activeMeeting = null;

  scheduledMeetings = [];

  meetingHistory = [];
};