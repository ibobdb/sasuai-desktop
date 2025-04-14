import electron from 'electron';

/**
 * Expose a safe subset of Electron APIs to the renderer process
 */
electron.contextBridge.exposeInMainWorld('electron', {
  /**
   * Subscribe to system statistics updates
   */
  subscribeStatistics: (callback: (stats: Statistics) => void) =>
    ipcOn('statistics', (stats) => {
      callback(stats);
    }),

  /**
   * Get static system information
   */
  getStaticData: () => ipcInvoke('getStaticData'),
} satisfies Window['electron']);

/**
 * Invoke an IPC method and return the result
 */
function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key).catch((err) => {
    console.error(`Error invoking "${key}":`, err);
    throw err;
  });
}

/**
 * Listen for IPC events from the main process
 */
function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void,
): () => void {
  const wrappedCallback = (_: Electron.IpcRendererEvent, payload: any) => {
    try {
      callback(payload);
    } catch (error) {
      console.error(`Error in IPC handler for "${key}":`, error);
    }
  };

  electron.ipcRenderer.on(key, wrappedCallback);

  // Return unsubscribe function
  return () => electron.ipcRenderer.removeListener(key, wrappedCallback);
}
