import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

/*
|--------------------------------------------------------------------------
| Collections
|--------------------------------------------------------------------------
*/

const USERS_COLLECTION = 'users';
const MEETINGS_COLLECTION = 'meetings';
const ATTENDANCE_COLLECTION = 'attendance';

/*
|--------------------------------------------------------------------------
| Get All Members
|--------------------------------------------------------------------------
|
| Fetches users whose role is "member".
|
|--------------------------------------------------------------------------
*/

export const getMembers = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);

    const membersQuery = query(
      usersRef,
      where('role', '==', 'member')
    );

    const snapshot = await getDocs(membersQuery);

    return snapshot.docs.map((userDoc) => ({
      uid: userDoc.id,
      ...userDoc.data(),
    }));
  } catch (error) {
    console.log('getMembers error:', error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Get Member By UID
|--------------------------------------------------------------------------
*/

export const getMemberByUid = async (uid) => {
  try {
    if (!uid) {
      throw new Error('User UID is required.');
    }

    const userRef = doc(
      db,
      USERS_COLLECTION,
      uid
    );

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      uid: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log('getMemberByUid error:', error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Attendance Document Reference
|--------------------------------------------------------------------------
|
| Structure:
|
| meetings
|   └── meetingId
|       └── attendance
|           └── uid
|
|--------------------------------------------------------------------------
*/

const getAttendanceRef = (meetingId, uid) => {
  if (!meetingId) {
    throw new Error('Meeting ID is required.');
  }

  if (!uid) {
    throw new Error('User UID is required.');
  }

  return doc(
    db,
    MEETINGS_COLLECTION,
    meetingId,
    ATTENDANCE_COLLECTION,
    uid
  );
};

/*
|--------------------------------------------------------------------------
| Get Meeting Attendance
|--------------------------------------------------------------------------
*/

export const getMeetingAttendance = async (
  meetingId
) => {
  try {
    if (!meetingId) {
      throw new Error('Meeting ID is required.');
    }

    const attendanceRef = collection(
      db,
      MEETINGS_COLLECTION,
      meetingId,
      ATTENDANCE_COLLECTION
    );

    const snapshot = await getDocs(
      attendanceRef
    );

    return snapshot.docs.map((attendanceDoc) => ({
      uid: attendanceDoc.id,
      ...attendanceDoc.data(),
    }));
  } catch (error) {
    console.log(
      'getMeetingAttendance error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Get Individual Attendance
|--------------------------------------------------------------------------
*/

export const getMemberAttendance = async (
  meetingId,
  uid
) => {
  try {
    const attendanceRef =
      getAttendanceRef(
        meetingId,
        uid
      );

    const snapshot =
      await getDoc(attendanceRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      uid: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log(
      'getMemberAttendance error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Mark Attendance
|--------------------------------------------------------------------------
|
| status:
|   "present"
|   "absent"
|
| method:
|   "manual"
|   "proximity"
|
|--------------------------------------------------------------------------
*/

export const markAttendance = async ({
  meetingId,
  uid,
  memberId,
  memberName,
  status,
  method = 'manual',
}) => {
  try {
    if (!meetingId) {
      throw new Error('Meeting ID is required.');
    }

    if (!uid) {
      throw new Error('User UID is required.');
    }

    if (!status) {
      throw new Error('Attendance status is required.');
    }

    if (
      status !== 'present' &&
      status !== 'absent'
    ) {
      throw new Error(
        'Attendance status must be present or absent.'
      );
    }

    const attendanceRef =
      getAttendanceRef(
        meetingId,
        uid
      );

    const attendanceData = {
      uid,
      memberId: memberId || '',
      memberName: memberName || '',
      status,
      method,
      markedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(
      attendanceRef,
      attendanceData,
      {
        merge: true,
      }
    );

    return {
      uid,
      ...attendanceData,
    };
  } catch (error) {
    console.log(
      'markAttendance error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Mark Member Present
|--------------------------------------------------------------------------
*/

export const markMemberPresent = async ({
  meetingId,
  uid,
  memberId,
  memberName,
  method = 'manual',
}) => {
  return markAttendance({
    meetingId,
    uid,
    memberId,
    memberName,
    status: 'present',
    method,
  });
};

/*
|--------------------------------------------------------------------------
| Mark Member Absent
|--------------------------------------------------------------------------
*/

export const markMemberAbsent = async ({
  meetingId,
  uid,
  memberId,
  memberName,
  method = 'manual',
}) => {
  return markAttendance({
    meetingId,
    uid,
    memberId,
    memberName,
    status: 'absent',
    method,
  });
};

/*
|--------------------------------------------------------------------------
| Attendance Statistics
|--------------------------------------------------------------------------
*/

export const getAttendanceStats = async (
  meetingId
) => {
  try {
    const records =
      await getMeetingAttendance(
        meetingId
      );

    const present = records.filter(
      (record) =>
        record.status === 'present'
    ).length;

    const absent = records.filter(
      (record) =>
        record.status === 'absent'
    ).length;

    return {
      total: records.length,
      present,
      absent,
    };
  } catch (error) {
    console.log(
      'getAttendanceStats error:',
      error
    );

    throw error;
  }
};