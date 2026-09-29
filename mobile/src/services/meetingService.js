import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

const MEETINGS_COLLECTION = 'meetings';

/*
|--------------------------------------------------------------------------
| CREATE MEETING
|--------------------------------------------------------------------------
*/

export const createMeeting = async ({
  title,
  location,
  date,
  startTime,
  startAt,
  duration,
  createdBy,
  status = 'scheduled',
}) => {
  try {
    if (!title?.trim()) {
      throw new Error('Meeting title is required.');
    }

    if (!location?.trim()) {
      throw new Error('Meeting location is required.');
    }

    if (!createdBy) {
      throw new Error('Creator information is missing.');
    }

    const meetingData = {
      title: title.trim(),
      location: location.trim(),
      date: date || '',
      startTime: startTime || '',
      startAt: startAt || null,
      duration: Number(duration) || 30,
      status,
      createdBy,
      createdAt: serverTimestamp(),

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      | Start immediately only when the meeting is created as active.
      |
      | Scheduled meeting:
      | startedAt = null
      |
      | Start Now:
      | startedAt = current Firestore server timestamp
      |--------------------------------------------------------------------------
      */

      startedAt:
        status === 'active'
          ? serverTimestamp()
          : null,

      endedAt: null,
    };

    const meetingsRef = collection(
      db,
      MEETINGS_COLLECTION
    );

    const meetingDoc = await addDoc(
      meetingsRef,
      meetingData
    );

    return {
      id: meetingDoc.id,
      ...meetingData,
    };
  } catch (error) {
    console.log(
      'createMeeting error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MEETING
|--------------------------------------------------------------------------
*/

export const updateMeeting = async (
  meetingId,
  {
    title,
    location,
    date,
    startTime,
    startAt,
    duration,
  }
) => {
  try {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    if (!title?.trim()) {
      throw new Error(
        'Meeting title is required.'
      );
    }

    if (!location?.trim()) {
      throw new Error(
        'Meeting location is required.'
      );
    }

    const meetingRef = doc(
      db,
      MEETINGS_COLLECTION,
      meetingId
    );

    const updatedMeetingData = {
      title: title.trim(),
      location: location.trim(),
      date: date || '',
      startTime: startTime || '',
      startAt: startAt || null,
      duration: Number(duration) || 30,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(
      meetingRef,
      updatedMeetingData
    );

    return {
      id: meetingId,
      ...updatedMeetingData,
    };
  } catch (error) {
    console.log(
      'updateMeeting error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET MEETING BY ID
|--------------------------------------------------------------------------
*/

export const getMeetingById = async (
  meetingId
) => {
  try {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const meetingRef = doc(
      db,
      MEETINGS_COLLECTION,
      meetingId
    );

    const meetingSnapshot =
      await getDoc(meetingRef);

    if (!meetingSnapshot.exists()) {
      return null;
    }

    return {
      id: meetingSnapshot.id,
      ...meetingSnapshot.data(),
    };
  } catch (error) {
    console.log(
      'getMeetingById error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET SCHEDULED MEETINGS
|--------------------------------------------------------------------------
*/

export const getScheduledMeetings =
  async () => {
    try {
      const meetingsRef = collection(
        db,
        MEETINGS_COLLECTION
      );

      const q = query(
        meetingsRef,
        where(
          'status',
          '==',
          'scheduled'
        )
      );

      const snapshot =
        await getDocs(q);

      return snapshot.docs.map(
        (meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        })
      );
    } catch (error) {
      console.log(
        'getScheduledMeetings error:',
        error
      );

      throw error;
    }
  };

/*
|--------------------------------------------------------------------------
| GET ACTIVE MEETINGS
|--------------------------------------------------------------------------
*/

export const getActiveMeetings =
  async () => {
    try {
      const meetingsRef = collection(
        db,
        MEETINGS_COLLECTION
      );

      const q = query(
        meetingsRef,
        where(
          'status',
          '==',
          'active'
        )
      );

      const snapshot =
        await getDocs(q);

      return snapshot.docs.map(
        (meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        })
      );
    } catch (error) {
      console.log(
        'getActiveMeetings error:',
        error
      );

      throw error;
    }
  };

/*
|--------------------------------------------------------------------------
| GET COMPLETED MEETINGS
|--------------------------------------------------------------------------
*/

export const getCompletedMeetings =
  async () => {
    try {
      const meetingsRef = collection(
        db,
        MEETINGS_COLLECTION
      );

      const q = query(
        meetingsRef,
        where(
          'status',
          '==',
          'completed'
        )
      );

      const snapshot =
        await getDocs(q);

      return snapshot.docs.map(
        (meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        })
      );
    } catch (error) {
      console.log(
        'getCompletedMeetings error:',
        error
      );

      throw error;
    }
  };

/*
|--------------------------------------------------------------------------
| START MEETING
|--------------------------------------------------------------------------
|
| Used when a previously scheduled meeting is
| started from the Meetings / Live Attendance flow.
|--------------------------------------------------------------------------
*/

export const startMeeting = async (
  meetingId
) => {
  try {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const meetingRef = doc(
      db,
      MEETINGS_COLLECTION,
      meetingId
    );

    await updateDoc(meetingRef, {
      status: 'active',
      startedAt: serverTimestamp(),
      endedAt: null,
    });

    return true;
  } catch (error) {
    console.log(
      'startMeeting error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| END MEETING
|--------------------------------------------------------------------------
*/

export const endMeeting = async (
  meetingId
) => {
  try {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const meetingRef = doc(
      db,
      MEETINGS_COLLECTION,
      meetingId
    );

    await updateDoc(meetingRef, {
      status: 'completed',
      endedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.log(
      'endMeeting error:',
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MEETING
|--------------------------------------------------------------------------
*/

export const deleteMeeting = async (
  meetingId
) => {
  try {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const meetingRef = doc(
      db,
      MEETINGS_COLLECTION,
      meetingId
    );

    await deleteDoc(meetingRef);

    return true;
  } catch (error) {
    console.log(
      'deleteMeeting error:',
      error
    );

    throw error;
  }
};