/**
 * System statistics interface representing real-time resource usage
 */
type Statistics = {
  cpuUsage: number;
  ramUsage: number;
  storageData: number;
};

/**
 * Static system information that doesn't change frequently
 */
type StaticData = {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
};

/**
 * Function that can be called to unsubscribe from an event
 */
type UnsubscribeFunction = () => void;

/**
 * Mapping of IPC event names to their corresponding payload types
 */
type EventPayloadMapping = {
  statistics: Statistics;
  getStaticData: StaticData;
};

/**
 * Extend the Window interface to include our Electron API
 */
interface Window {
  electron: {
    /**
     * Subscribe to system statistics updates
     * @param callback Function to call with updated statistics
     * @returns Function to call when you want to unsubscribe
     */
    subscribeStatistics: (
      callback: (statistics: Statistics) => void,
    ) => UnsubscribeFunction;

    /**
     * Get static system information that doesn't change often
     * @returns Promise that resolves with the system information
     */
    getStaticData: () => Promise<StaticData>;
  };
}
