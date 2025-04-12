import osUtils from 'os-utils';
import fs from 'fs';
import os from 'os';
import { BrowserWindow } from 'electron';
import { ipcWebContentsSend } from './util.js';
import { SYSTEM_MONITOR } from './constants.js';

/**
 * Start monitoring system resources and send updates to the main window
 * @returns Function to stop the monitoring when called
 */
export function pollResources(mainWindow: BrowserWindow): () => void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return () => {}; // Return no-op function if window is invalid
  }

  const interval = setInterval(async () => {
    try {
      if (mainWindow.isDestroyed()) {
        clearInterval(interval);
        return;
      }

      const cpuUsage = await getCPUUsage();
      const storageData = getStorageData();
      const ramUsage = getRamUsage();

      ipcWebContentsSend('statistics', mainWindow.webContents, {
        cpuUsage,
        ramUsage,
        storageData: storageData.usage,
      });
    } catch (error) {
      console.error('Error polling system resources:', error);
    }
  }, SYSTEM_MONITOR.POLLING_INTERVAL);

  // Return cleanup function that can be called to stop monitoring
  return () => clearInterval(interval);
}

/**
 * Get static system information that doesn't change often
 */
export function getStaticData(): StaticData {
  const storageData = getStorageData();
  const cpuModel = os.cpus()[0]?.model || 'Unknown CPU';
  const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024);

  return {
    totalStorage: storageData.total,
    cpuModel,
    totalMemoryGB,
  };
}

/**
 * Get current CPU usage as a fraction (0-1)
 */
function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    osUtils.cpuUsage((usage) => {
      resolve(Math.min(Math.max(usage, 0), 1)); // Ensure value is between 0-1
    });
  });
}

/**
 * Get current RAM usage as a fraction (0-1)
 */
function getRamUsage(): number {
  return Math.min(Math.max(1 - osUtils.freememPercentage(), 0), 1); // Ensure value is between 0-1
}

/**
 * Get storage statistics for the system drive
 */
function getStorageData(): { total: number; usage: number } {
  try {
    const systemDrive = process.platform === 'win32' ? 'C://' : '/';
    const stats = fs.statfsSync(systemDrive);
    const total = stats.bsize * stats.blocks;
    const free = stats.bsize * stats.bfree;
    const usage = Math.min(Math.max(1 - free / total, 0), 1); // Ensure value is between 0-1

    return {
      total: Math.floor(total / 1_000_000_000),
      usage,
    };
  } catch (error) {
    console.error('Error getting storage data:', error);
    return {
      total: 0,
      usage: 0,
    };
  }
}
