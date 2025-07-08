#!/usr/bin/env python3
"""
K.E.N. & J.A.R.V.I.S. Audio Device Detection Service
Advanced audio peripheral and Bluetooth device management with real-time monitoring
"""

import asyncio
import json
import logging
import platform
import subprocess
import time
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Callable
from enum import Enum

try:
    import pyaudio
    import bluetooth
    import pulsectl
    import psutil
except ImportError as e:
    logging.warning(f"Optional dependency not available: {e}")

class DeviceType(Enum):
    AUDIO_INPUT = "audio_input"
    AUDIO_OUTPUT = "audio_output"
    BLUETOOTH_AUDIO = "bluetooth_audio"
    USB_AUDIO = "usb_audio"
    WIRELESS_AUDIO = "wireless_audio"

class DeviceStatus(Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    PAIRING = "pairing"
    ERROR = "error"
    UNKNOWN = "unknown"

@dataclass
class AudioDevice:
    device_id: str
    name: str
    device_type: DeviceType
    status: DeviceStatus
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    driver: Optional[str] = None
    sample_rate: Optional[int] = None
    channels: Optional[int] = None
    bit_depth: Optional[int] = None
    battery_level: Optional[int] = None
    signal_strength: Optional[int] = None
    last_seen: Optional[float] = None
    capabilities: Optional[List[str]] = None
    metadata: Optional[Dict] = None

class AudioDeviceDetectionService:
    """
    Advanced audio device detection and management service
    Supports multiple platforms and device types with real-time monitoring
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.devices: Dict[str, AudioDevice] = {}
        self.callbacks: List[Callable] = []
        self.monitoring = False
        self.platform = platform.system().lower()
        
        # Initialize platform-specific components
        self._init_platform_components()
        
    def _init_platform_components(self):
        """Initialize platform-specific audio components"""
        try:
            if self.platform == "linux":
                self._init_linux_components()
            elif self.platform == "windows":
                self._init_windows_components()
            elif self.platform == "darwin":  # macOS
                self._init_macos_components()
        except Exception as e:
            self.logger.error(f"Failed to initialize platform components: {e}")
    
    def _init_linux_components(self):
        """Initialize Linux-specific audio components"""
        try:
            # Initialize PulseAudio
            self.pulse = pulsectl.Pulse('ken-jarvis-audio')
            self.logger.info("PulseAudio initialized successfully")
        except Exception as e:
            self.logger.warning(f"PulseAudio initialization failed: {e}")
            self.pulse = None
    
    def _init_windows_components(self):
        """Initialize Windows-specific audio components"""
        # Windows audio detection using WMI and Windows APIs
        self.logger.info("Windows audio components initialized")
    
    def _init_macos_components(self):
        """Initialize macOS-specific audio components"""
        # macOS audio detection using Core Audio
        self.logger.info("macOS audio components initialized")
    
    async def detect_all_devices(self) -> List[AudioDevice]:
        """Detect all available audio devices across all types"""
        devices = []
        
        try:
            # Detect PyAudio devices
            pyaudio_devices = await self._detect_pyaudio_devices()
            devices.extend(pyaudio_devices)
            
            # Detect Bluetooth devices
            bluetooth_devices = await self._detect_bluetooth_devices()
            devices.extend(bluetooth_devices)
            
            # Detect USB audio devices
            usb_devices = await self._detect_usb_audio_devices()
            devices.extend(usb_devices)
            
            # Detect platform-specific devices
            platform_devices = await self._detect_platform_devices()
            devices.extend(platform_devices)
            
            # Update internal device registry
            for device in devices:
                device.last_seen = time.time()
                self.devices[device.device_id] = device
            
            self.logger.info(f"Detected {len(devices)} audio devices")
            return devices
            
        except Exception as e:
            self.logger.error(f"Device detection failed: {e}")
            return []
    
    async def _detect_pyaudio_devices(self) -> List[AudioDevice]:
        """Detect audio devices using PyAudio"""
        devices = []
        
        try:
            import pyaudio
            pa = pyaudio.PyAudio()
            
            for i in range(pa.get_device_count()):
                info = pa.get_device_info_by_index(i)
                
                device_type = DeviceType.AUDIO_INPUT if info['maxInputChannels'] > 0 else DeviceType.AUDIO_OUTPUT
                
                device = AudioDevice(
                    device_id=f"pyaudio_{i}",
                    name=info['name'],
                    device_type=device_type,
                    status=DeviceStatus.CONNECTED,
                    sample_rate=int(info['defaultSampleRate']),
                    channels=info['maxInputChannels'] if device_type == DeviceType.AUDIO_INPUT else info['maxOutputChannels'],
                    capabilities=['recording'] if device_type == DeviceType.AUDIO_INPUT else ['playback'],
                    metadata={
                        'host_api': pa.get_host_api_info_by_index(info['hostApi'])['name'],
                        'index': i
                    }
                )
                
                devices.append(device)
            
            pa.terminate()
            
        except Exception as e:
            self.logger.warning(f"PyAudio device detection failed: {e}")
        
        return devices
    
    async def _detect_bluetooth_devices(self) -> List[AudioDevice]:
        """Detect Bluetooth audio devices"""
        devices = []
        
        try:
            if self.platform == "linux":
                devices = await self._detect_bluetooth_linux()
            elif self.platform == "windows":
                devices = await self._detect_bluetooth_windows()
            elif self.platform == "darwin":
                devices = await self._detect_bluetooth_macos()
                
        except Exception as e:
            self.logger.warning(f"Bluetooth device detection failed: {e}")
        
        return devices
    
    async def _detect_bluetooth_linux(self) -> List[AudioDevice]:
        """Detect Bluetooth devices on Linux using bluetoothctl"""
        devices = []
        
        try:
            # Use bluetoothctl to scan for devices
            result = subprocess.run(['bluetoothctl', 'devices'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if line.startswith('Device'):
                        parts = line.split(' ', 2)
                        if len(parts) >= 3:
                            mac_address = parts[1]
                            device_name = parts[2]
                            
                            # Check if it's an audio device
                            if self._is_audio_device(device_name):
                                # Get additional device info
                                info_result = subprocess.run(
                                    ['bluetoothctl', 'info', mac_address],
                                    capture_output=True, text=True, timeout=5
                                )
                                
                                connected = 'Connected: yes' in info_result.stdout
                                battery = self._extract_battery_level(info_result.stdout)
                                
                                device = AudioDevice(
                                    device_id=f"bluetooth_{mac_address}",
                                    name=device_name,
                                    device_type=DeviceType.BLUETOOTH_AUDIO,
                                    status=DeviceStatus.CONNECTED if connected else DeviceStatus.DISCONNECTED,
                                    battery_level=battery,
                                    capabilities=['playback', 'recording'],
                                    metadata={
                                        'mac_address': mac_address,
                                        'protocol': 'bluetooth'
                                    }
                                )
                                
                                devices.append(device)
            
        except Exception as e:
            self.logger.warning(f"Linux Bluetooth detection failed: {e}")
        
        return devices
    
    async def _detect_bluetooth_windows(self) -> List[AudioDevice]:
        """Detect Bluetooth devices on Windows"""
        devices = []
        
        try:
            # Use PowerShell to get Bluetooth devices
            ps_command = """
            Get-PnpDevice | Where-Object {
                $_.Class -eq 'AudioEndpoint' -and 
                $_.InstanceId -like '*BTHENUM*'
            } | Select-Object FriendlyName, Status, InstanceId
            """
            
            result = subprocess.run(['powershell', '-Command', ps_command],
                                  capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')[3:]  # Skip headers
                for line in lines:
                    if line.strip():
                        parts = line.split()
                        if len(parts) >= 2:
                            name = ' '.join(parts[:-2])
                            status = parts[-2]
                            
                            device = AudioDevice(
                                device_id=f"bluetooth_win_{hash(name)}",
                                name=name,
                                device_type=DeviceType.BLUETOOTH_AUDIO,
                                status=DeviceStatus.CONNECTED if status == 'OK' else DeviceStatus.DISCONNECTED,
                                capabilities=['playback'],
                                metadata={'platform': 'windows'}
                            )
                            
                            devices.append(device)
            
        except Exception as e:
            self.logger.warning(f"Windows Bluetooth detection failed: {e}")
        
        return devices
    
    async def _detect_bluetooth_macos(self) -> List[AudioDevice]:
        """Detect Bluetooth devices on macOS"""
        devices = []
        
        try:
            # Use system_profiler to get Bluetooth info
            result = subprocess.run(['system_profiler', 'SPBluetoothDataType', '-json'],
                                  capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                data = json.loads(result.stdout)
                # Parse Bluetooth device data
                # Implementation would parse the JSON structure
                pass
            
        except Exception as e:
            self.logger.warning(f"macOS Bluetooth detection failed: {e}")
        
        return devices
    
    async def _detect_usb_audio_devices(self) -> List[AudioDevice]:
        """Detect USB audio devices"""
        devices = []
        
        try:
            if self.platform == "linux":
                # Check /proc/asound/cards for USB audio devices
                with open('/proc/asound/cards', 'r') as f:
                    content = f.read()
                    
                for line in content.split('\n'):
                    if 'USB' in line and ('Audio' in line or 'audio' in line):
                        parts = line.split(':')
                        if len(parts) >= 2:
                            card_id = parts[0].strip()
                            name = parts[1].strip()
                            
                            device = AudioDevice(
                                device_id=f"usb_audio_{card_id}",
                                name=name,
                                device_type=DeviceType.USB_AUDIO,
                                status=DeviceStatus.CONNECTED,
                                capabilities=['playback', 'recording'],
                                metadata={'interface': 'usb', 'card_id': card_id}
                            )
                            
                            devices.append(device)
            
        except Exception as e:
            self.logger.warning(f"USB audio device detection failed: {e}")
        
        return devices
    
    async def _detect_platform_devices(self) -> List[AudioDevice]:
        """Detect platform-specific audio devices"""
        devices = []
        
        try:
            if self.platform == "linux" and self.pulse:
                # Get PulseAudio sources and sinks
                sources = self.pulse.source_list()
                sinks = self.pulse.sink_list()
                
                for source in sources:
                    device = AudioDevice(
                        device_id=f"pulse_source_{source.index}",
                        name=source.description,
                        device_type=DeviceType.AUDIO_INPUT,
                        status=DeviceStatus.CONNECTED,
                        sample_rate=source.sample_spec.rate,
                        channels=source.sample_spec.channels,
                        capabilities=['recording'],
                        metadata={
                            'driver': source.driver,
                            'module': source.owner_module
                        }
                    )
                    devices.append(device)
                
                for sink in sinks:
                    device = AudioDevice(
                        device_id=f"pulse_sink_{sink.index}",
                        name=sink.description,
                        device_type=DeviceType.AUDIO_OUTPUT,
                        status=DeviceStatus.CONNECTED,
                        sample_rate=sink.sample_spec.rate,
                        channels=sink.sample_spec.channels,
                        capabilities=['playback'],
                        metadata={
                            'driver': sink.driver,
                            'module': sink.owner_module
                        }
                    )
                    devices.append(device)
            
        except Exception as e:
            self.logger.warning(f"Platform device detection failed: {e}")
        
        return devices
    
    def _is_audio_device(self, device_name: str) -> bool:
        """Check if a device name indicates an audio device"""
        audio_keywords = [
            'headphone', 'headset', 'speaker', 'earphone', 'earbud',
            'audio', 'sound', 'music', 'airpods', 'beats', 'sony',
            'bose', 'sennheiser', 'jbl', 'microphone', 'mic'
        ]
        
        name_lower = device_name.lower()
        return any(keyword in name_lower for keyword in audio_keywords)
    
    def _extract_battery_level(self, info_text: str) -> Optional[int]:
        """Extract battery level from device info text"""
        try:
            for line in info_text.split('\n'):
                if 'battery' in line.lower() and '%' in line:
                    # Extract percentage
                    import re
                    match = re.search(r'(\d+)%', line)
                    if match:
                        return int(match.group(1))
        except Exception:
            pass
        return None
    
    async def connect_device(self, device_id: str) -> bool:
        """Connect to a specific audio device"""
        try:
            device = self.devices.get(device_id)
            if not device:
                return False
            
            if device.device_type == DeviceType.BLUETOOTH_AUDIO:
                return await self._connect_bluetooth_device(device)
            else:
                # For other device types, connection is usually automatic
                device.status = DeviceStatus.CONNECTED
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to connect device {device_id}: {e}")
            return False
    
    async def _connect_bluetooth_device(self, device: AudioDevice) -> bool:
        """Connect to a Bluetooth audio device"""
        try:
            mac_address = device.metadata.get('mac_address')
            if not mac_address:
                return False
            
            if self.platform == "linux":
                result = subprocess.run(['bluetoothctl', 'connect', mac_address],
                                      capture_output=True, text=True, timeout=10)
                success = result.returncode == 0
            else:
                # Platform-specific connection logic
                success = True  # Placeholder
            
            if success:
                device.status = DeviceStatus.CONNECTED
                device.last_seen = time.time()
            
            return success
            
        except Exception as e:
            self.logger.error(f"Bluetooth connection failed: {e}")
            return False
    
    async def disconnect_device(self, device_id: str) -> bool:
        """Disconnect from a specific audio device"""
        try:
            device = self.devices.get(device_id)
            if not device:
                return False
            
            if device.device_type == DeviceType.BLUETOOTH_AUDIO:
                return await self._disconnect_bluetooth_device(device)
            else:
                device.status = DeviceStatus.DISCONNECTED
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to disconnect device {device_id}: {e}")
            return False
    
    async def _disconnect_bluetooth_device(self, device: AudioDevice) -> bool:
        """Disconnect from a Bluetooth audio device"""
        try:
            mac_address = device.metadata.get('mac_address')
            if not mac_address:
                return False
            
            if self.platform == "linux":
                result = subprocess.run(['bluetoothctl', 'disconnect', mac_address],
                                      capture_output=True, text=True, timeout=10)
                success = result.returncode == 0
            else:
                success = True  # Placeholder
            
            if success:
                device.status = DeviceStatus.DISCONNECTED
            
            return success
            
        except Exception as e:
            self.logger.error(f"Bluetooth disconnection failed: {e}")
            return False
    
    def add_device_change_callback(self, callback: Callable):
        """Add a callback for device change events"""
        self.callbacks.append(callback)
    
    def remove_device_change_callback(self, callback: Callable):
        """Remove a device change callback"""
        if callback in self.callbacks:
            self.callbacks.remove(callback)
    
    async def start_monitoring(self, interval: float = 5.0):
        """Start monitoring for device changes"""
        self.monitoring = True
        
        while self.monitoring:
            try:
                # Detect current devices
                current_devices = await self.detect_all_devices()
                
                # Check for changes
                current_ids = {d.device_id for d in current_devices}
                previous_ids = set(self.devices.keys())
                
                # Notify callbacks of changes
                if current_ids != previous_ids:
                    for callback in self.callbacks:
                        try:
                            await callback(current_devices)
                        except Exception as e:
                            self.logger.error(f"Callback error: {e}")
                
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Monitoring error: {e}")
                await asyncio.sleep(interval)
    
    def stop_monitoring(self):
        """Stop device monitoring"""
        self.monitoring = False
    
    def get_devices_by_type(self, device_type: DeviceType) -> List[AudioDevice]:
        """Get all devices of a specific type"""
        return [device for device in self.devices.values() 
                if device.device_type == device_type]
    
    def get_connected_devices(self) -> List[AudioDevice]:
        """Get all currently connected devices"""
        return [device for device in self.devices.values() 
                if device.status == DeviceStatus.CONNECTED]
    
    def to_dict(self) -> Dict:
        """Convert service state to dictionary"""
        return {
            'devices': {device_id: asdict(device) for device_id, device in self.devices.items()},
            'monitoring': self.monitoring,
            'platform': self.platform,
            'device_count': len(self.devices),
            'connected_count': len(self.get_connected_devices())
        }

# Example usage and testing
async def main():
    """Example usage of the AudioDeviceDetectionService"""
    service = AudioDeviceDetectionService()
    
    # Detect all devices
    devices = await service.detect_all_devices()
    print(f"Detected {len(devices)} audio devices:")
    
    for device in devices:
        print(f"  - {device.name} ({device.device_type.value}) - {device.status.value}")
        if device.battery_level:
            print(f"    Battery: {device.battery_level}%")
    
    # Add a callback for device changes
    async def device_change_callback(devices):
        print(f"Device change detected: {len(devices)} devices")
    
    service.add_device_change_callback(device_change_callback)
    
    # Start monitoring (would run indefinitely in real usage)
    # await service.start_monitoring()

if __name__ == "__main__":
    asyncio.run(main())

