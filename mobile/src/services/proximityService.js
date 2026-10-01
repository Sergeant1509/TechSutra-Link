const VALID_RSSI_THRESHOLD = -65;
const LOST_RSSI_THRESHOLD = -70;

const REQUIRED_PROXIMITY_MS = 2 * 60 * 1000;
const GRACE_PERIOD_MS = 10 * 1000;

const RSSI_WINDOW_SIZE = 5;

export class ProximityVerifier {
  constructor(options = {}) {
    this.validRssiThreshold =
      options.validRssiThreshold ?? VALID_RSSI_THRESHOLD;

    this.lostRssiThreshold =
      options.lostRssiThreshold ?? LOST_RSSI_THRESHOLD;

    this.requiredProximityMs =
      options.requiredProximityMs ?? REQUIRED_PROXIMITY_MS;

    this.gracePeriodMs =
      options.gracePeriodMs ?? GRACE_PERIOD_MS;

    this.rssiWindowSize =
      options.rssiWindowSize ?? RSSI_WINDOW_SIZE;

    this.rssiHistory = [];

    this.proximityStartTime = null;
    this.lastValidTime = null;

    this.isInProximity = false;
    this.isVerified = false;
  }

  addRssi(rssi, timestamp = Date.now()) {
    if (
      typeof rssi !== 'number' ||
      Number.isNaN(rssi)
    ) {
      return this.getStatus();
    }

    this.rssiHistory.push({
      rssi,
      timestamp,
    });

    if (
      this.rssiHistory.length >
      this.rssiWindowSize
    ) {
      this.rssiHistory.shift();
    }

    const filteredRssi =
      this.getFilteredRssi();

    const status =
      this.evaluateProximity(
        filteredRssi,
        timestamp
      );

    return status;
  }

  getFilteredRssi() {
    if (this.rssiHistory.length === 0) {
      return null;
    }

    const values = this.rssiHistory
      .map((item) => item.rssi)
      .sort((a, b) => a - b);

    const middle =
      Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      return (
        values[middle - 1] +
        values[middle]
      ) / 2;
    }

    return values[middle];
  }

  evaluateProximity(
    filteredRssi,
    timestamp
  ) {
    if (filteredRssi === null) {
      return this.getStatus();
    }

    /*
      STRONG / VALID ZONE
      RSSI >= -65 dBm
    */

    if (
      filteredRssi >=
      this.validRssiThreshold
    ) {
      if (!this.proximityStartTime) {
        this.proximityStartTime =
          timestamp;
      }

      this.lastValidTime = timestamp;
      this.isInProximity = true;

      const duration =
        timestamp -
        this.proximityStartTime;

      if (
        duration >=
        this.requiredProximityMs
      ) {
        this.isVerified = true;
      }

      return this.getStatus();
    }

    /*
      GRACE ZONE
      Between -65 dBm and -70 dBm

      We don't immediately cancel
      the proximity session.
    */

    if (
      filteredRssi >
      this.lostRssiThreshold
    ) {
      if (
        this.proximityStartTime &&
        this.lastValidTime
      ) {
        const timeSinceLastValid =
          timestamp -
          this.lastValidTime;

        if (
          timeSinceLastValid <=
          this.gracePeriodMs
        ) {
          this.isInProximity = true;
          return this.getStatus();
        }
      }

      this.isInProximity = false;

      return this.getStatus();
    }

    /*
      LOST ZONE
      RSSI <= -70 dBm
    */

    if (
      this.lastValidTime
    ) {
      const timeSinceLastValid =
        timestamp -
        this.lastValidTime;

      if (
        timeSinceLastValid <=
        this.gracePeriodMs
      ) {
        this.isInProximity = true;
        return this.getStatus();
      }
    }

    this.resetVerification();

    return this.getStatus();
  }

  getProximityDuration(timestamp = Date.now()) {
    if (!this.proximityStartTime) {
      return 0;
    }

    return Math.max(
      0,
      timestamp -
        this.proximityStartTime
    );
  }

  getRemainingTime(timestamp = Date.now()) {
    if (this.isVerified) {
      return 0;
    }

    const duration =
      this.getProximityDuration(
        timestamp
      );

    return Math.max(
      0,
      this.requiredProximityMs -
        duration
    );
  }

  resetVerification() {
    this.rssiHistory = [];

    this.proximityStartTime = null;
    this.lastValidTime = null;

    this.isInProximity = false;
    this.isVerified = false;
  }

  getStatus(timestamp = Date.now()) {
    const filteredRssi =
      this.getFilteredRssi();

    const duration =
      this.getProximityDuration(
        timestamp
      );

    const remainingTime =
      this.getRemainingTime(
        timestamp
      );

    let zone = 'unknown';

    if (filteredRssi !== null) {
      if (
        filteredRssi >=
        this.validRssiThreshold
      ) {
        zone = 'valid';
      } else if (
        filteredRssi >
        this.lostRssiThreshold
      ) {
        zone = 'grace';
      } else {
        zone = 'lost';
      }
    }

    return {
      filteredRssi,
      zone,

      isInProximity:
        this.isInProximity,

      isVerified:
        this.isVerified,

      proximityDurationMs:
        duration,

      remainingTimeMs:
        remainingTime,

      validRssiThreshold:
        this.validRssiThreshold,

      lostRssiThreshold:
        this.lostRssiThreshold,

      requiredProximityMs:
        this.requiredProximityMs,

      gracePeriodMs:
        this.gracePeriodMs,
    };
  }
}

export const createProximityVerifier = (
  options = {}
) => {
  return new ProximityVerifier(
    options
  );
};

export const PROXIMITY_CONFIG = {
  VALID_RSSI_THRESHOLD,
  LOST_RSSI_THRESHOLD,
  REQUIRED_PROXIMITY_MS,
  GRACE_PERIOD_MS,
  RSSI_WINDOW_SIZE,
};