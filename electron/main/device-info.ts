import { app } from 'electron'
import { platform, hostname, arch, release, type } from 'os'
import { machineId } from 'node-machine-id'

interface DeviceInfo {
  appName: string
  appVersion: string
  platform: string
  platformVersion: string
  architecture: string
  deviceName: string
  deviceId: string
  userAgent: string
}

let cachedDeviceInfo: DeviceInfo | null = null
let cachedMachineId: string | null = null

async function getMachineId(): Promise<string> {
  if (cachedMachineId) {
    return cachedMachineId
  }

  try {
    cachedMachineId = await machineId()
    return cachedMachineId
  } catch {
    cachedMachineId = `${hostname()}-${platform()}-${arch()}`.replace(/[^a-zA-Z0-9-]/g, '')
    return cachedMachineId
  }
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  if (cachedDeviceInfo) {
    return cachedDeviceInfo
  }

  const appName = app.getName()
  const appVersion = app.getVersion()
  const osType = type()
  const osRelease = release()
  const osArch = arch()
  const deviceName = hostname()
  const deviceId = await getMachineId()

  const userAgent = `${appName}/${appVersion} (${osType} ${osRelease}; ${osArch}) Desktop/${deviceName}`

  cachedDeviceInfo = {
    appName,
    appVersion,
    platform: osType,
    platformVersion: osRelease,
    architecture: osArch,
    deviceName,
    deviceId,
    userAgent
  }

  return cachedDeviceInfo
}

export async function getSessionMetadata() {
  const deviceInfo = await getDeviceInfo()

  return {
    'X-Client-Name': deviceInfo.appName,
    'X-Client-Version': deviceInfo.appVersion,
    'X-Client-Platform': deviceInfo.platform,
    'X-Client-Platform-Version': deviceInfo.platformVersion,
    'X-Client-Architecture': deviceInfo.architecture,
    'X-Device-Name': deviceInfo.deviceName,
    'X-Device-ID': deviceInfo.deviceId,
    'X-Client-Type': 'desktop'
  }
}
