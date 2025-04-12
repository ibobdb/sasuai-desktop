import { ipcMain, WebContents, WebFrameMain } from 'electron';
import { getUIPath } from './pathResolver.js';
import { pathToFileURL } from 'url';
import path from 'path';
import { app } from 'electron';

/**
 * Check if the application is in development mode
 */
export function isDev(): boolean {
  return (
    process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
  );
}

/**
 * Create a typed IPC handler for the main process
 */
export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: () => EventPayloadMapping[Key],
): void {
  ipcMain.handle(key, async (event) => {
    try {
      if (event.senderFrame) validateEventFrame(event.senderFrame);
      return await handler();
    } catch (error) {
      console.error(`Error in IPC handler '${key}':`, error);
      throw error; // Re-throw to let renderer handle it
    }
  });
}

/**
 * Send a typed IPC message to renderer
 */
export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: WebContents,
  payload: EventPayloadMapping[Key],
): void {
  if (!webContents.isDestroyed()) {
    webContents.send(key, payload);
  }
}

/**
 * Validate the frame origin for security
 */
export function validateEventFrame(frame: WebFrameMain): void {
  try {
    // Allow localhost in development mode
    if (isDev()) {
      const url = new URL(frame.url);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return;
      }
    }

    // Allow file URLs in production if they're in the app directory
    if (!isDev() && frame.url.startsWith('file://')) {
      const appPath = app.getAppPath();

      // Handle Windows paths specially
      if (process.platform === 'win32') {
        const urlPath = new URL(frame.url).pathname;
        const urlDrive = urlPath.replace(/^\//, '').split('/')[0];
        if (urlDrive.endsWith(':') || frame.url === `file:///${urlDrive}/`) {
          return;
        }
      }

      if (appPath && frame.url.includes(path.dirname(appPath))) {
        return;
      }

      return; // Outside of app path, but still file URL - allow for now
    }

    // Final check against the expected UI path
    const expectedUrl = pathToFileURL(getUIPath()).toString();
    if (frame.url !== expectedUrl) {
      throw new Error(
        `URL mismatch: Expected ${expectedUrl}, got ${frame.url}`,
      );
    }
  } catch (error) {
    throw new Error(
      `Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
