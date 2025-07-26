import React, { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Icons (simple SVG for delete)
const DeleteIcon = ({ ...props }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M6 6L14 14M6 14L14 6" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

type Device = {
  deviceId: string;
  deviceName: string;
};

type SharedUser = {
  email: string;
  permission: 'view' | 'edit';
};

type Props = {
  userEmail: string;
};

export default function DeviceAccessManager({ userEmail = "test@example.com" }: Props) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceSharedUsers, setDeviceSharedUsers] = useState<Record<string, SharedUser[]>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [addDeviceId, setAddDeviceId] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    devicesResponse?: any;
    sharedUsersResponses?: Record<string, any>;
  }>({});

  // Fetch devices owned by current user
  const fetchDevices = async () => {
    if (!userEmail) return;
    try {
      const url = `${BACKEND_URL}/devices/my?email=${encodeURIComponent(userEmail)}`;
      console.log('Fetching devices from:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Devices response:', data);
      setDebugInfo(prev => ({ ...prev, devicesResponse: data }));
      
      setDevices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
      setMessage('Failed to load devices.');
    }
  };

  // Fetch shared users for a device
  const fetchSharedUsers = async (deviceId: string) => {
    if (!deviceId) return [];
    try {
      const url = `${BACKEND_URL}/devices/${deviceId}/access`;
      console.log('Fetching shared users from:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log(`Shared users for device ${deviceId}:`, data);
      setDebugInfo(prev => ({ 
        ...prev, 
        sharedUsersResponses: { 
          ...(prev.sharedUsersResponses || {}), 
          [deviceId]: data 
        } 
      }));
      
      // Handle both array response and object with sharedWith property
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.sharedWith)) {
        return data.sharedWith;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching shared users for device ${deviceId}:`, error);
      return [];
    }
  };

  // Fetch all shared users for all devices
  const fetchAllSharedUsers = async (deviceList: Device[]) => {
    console.log('Fetching shared users for devices:', deviceList);
    const result: Record<string, SharedUser[]> = {};
    
    await Promise.all(
      deviceList.map(async (device) => {
        const users = await fetchSharedUsers(device.deviceId);
        result[device.deviceId] = users;
        console.log(`Shared users for ${device.deviceName} (${device.deviceId}):`, users);
      })
    );
    
    console.log('All shared users:', result);
    setDeviceSharedUsers(result);
  };

  // Fetch devices and their shared users
  useEffect(() => {
    const load = async () => {
      if (userEmail) {
        console.log('Loading devices for user:', userEmail);
        await fetchDevices();
      }
    };
    load();
  }, [userEmail]);

  // When devices change, fetch all shared users
  useEffect(() => {
    console.log('Devices changed:', devices);
    if (devices.length > 0) {
      fetchAllSharedUsers(devices);
    } else {
      setDeviceSharedUsers({});
    }
  }, [devices]);

  // Share access (add user)
  const handleShare = async () => {
    if (!addDeviceId || !addEmail) return;
    setAddLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${BACKEND_URL}/devices/${addDeviceId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to share device.');
      }
      setAddSuccess(true);
      setMessage('Successfully granted access!');
      // Refresh shared users for this device
      const users = await fetchSharedUsers(addDeviceId);
      setDeviceSharedUsers((prev) => ({ ...prev, [addDeviceId]: users }));
      setAddEmail('');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Unshare access (remove user)
  const handleUnshare = async (deviceId: string, email: string) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${BACKEND_URL}/devices/${deviceId}/unshare`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to remove access.');
      }
      // Refresh shared users for this device
      const users = await fetchSharedUsers(deviceId);
      setDeviceSharedUsers((prev) => ({ ...prev, [deviceId]: users }));
      setMessage('Access removed.');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset add access form
  const resetAddForm = () => {
    setAddMode(false);
    setAddDeviceId('');
    setAddEmail('');
    setAddSuccess(false);
    setMessage('');
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Device Access Management</h2>
      
      {/* Debug Information Panel */}
      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '4px', 
        padding: '1rem', 
        marginBottom: '1rem',
        fontSize: '12px'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Debug Information</h4>
        <div><strong>User Email:</strong> {userEmail}</div>
        <div><strong>Backend URL:</strong> {BACKEND_URL}</div>
        <div><strong>Devices Count:</strong> {devices.length}</div>
        <div><strong>Device Shared Users Keys:</strong> {Object.keys(deviceSharedUsers).join(', ')}</div>
        
        {Object.keys(debugInfo).length > 0 && (
          <details style={{ marginTop: '0.5rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Raw API Responses</summary>
            <pre style={{ 
              background: 'white', 
              padding: '0.5rem', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '10px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>

      <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
        {!addMode && (
          <button
            onClick={() => setAddMode(true)}
            style={{
              background: '#319795', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 500
            }}
          >
            + Add Access
          </button>
        )}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead style={{ background: '#f7fafc' }}>
          <tr>
            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Device Name</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Device ID</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Shared Users</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            // Filter devices that have shared users
            const sharedDevices = devices.filter(device => 
              deviceSharedUsers[device.deviceId] && deviceSharedUsers[device.deviceId].length > 0
            );

            if (sharedDevices.length === 0) {
              return (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>
                    No shared devices at the moment
                  </td>
                </tr>
              );
            }

            // Display only shared devices and their users
            return sharedDevices.flatMap((device) => {
              const sharedUsers = deviceSharedUsers[device.deviceId];
              
              return sharedUsers.map((user, index) => (
                <tr key={`${device.deviceId}-${user.email}-${index}`}>
                  <td style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid #e2e8f0', 
                    fontWeight: 500,
                    background: index === 0 ? '#f8f9fa' : 'transparent'
                  }}>
                    {index === 0 ? device.deviceName : ''}
                  </td>
                  <td style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid #e2e8f0', 
                    fontSize: '12px', 
                    color: '#666',
                    background: index === 0 ? '#f8f9fa' : 'transparent'
                  }}>
                    {index === 0 ? device.deviceId : ''}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ marginRight: 8, fontWeight: 500 }}>{user.email}</span>
                        <span style={{ color: '#718096', fontSize: 12 }}>({user.permission})</span>
                      </div>
                      <button
                        onClick={() => handleUnshare(device.deviceId, user.email)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove access"
                        disabled={loading}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fee'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ));
            });
          })()}
          {addMode && (
            <tr>
              <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <select
                  value={addDeviceId}
                  onChange={e => setAddDeviceId(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #cbd5e0', minWidth: 120 }}
                  disabled={addSuccess}
                >
                  <option value="">Choose Device</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.deviceName}</option>
                  ))}
                </select>
              </td>
              <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                {addDeviceId}
              </td>
              <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={e => setAddEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #cbd5e0', minWidth: 180 }}
                    disabled={addSuccess}
                  />
                  {!addSuccess && (
                    <button
                      onClick={handleShare}
                      disabled={addLoading || !addDeviceId || !addEmail}
                      style={{ 
                        background: addLoading || !addDeviceId || !addEmail ? '#ccc' : '#319795', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 4, 
                        padding: '0.5rem 1rem', 
                        cursor: addLoading || !addDeviceId || !addEmail ? 'not-allowed' : 'pointer', 
                        fontWeight: 500 
                      }}
                    >
                      {addLoading ? 'Adding...' : 'Add'}
                    </button>
                  )}
                  {addSuccess && (
                    <span style={{ color: '#38a169', fontWeight: 500, marginLeft: 8 }}>Successfully granted access!</span>
                  )}
                  <button
                    onClick={resetAddForm}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', marginLeft: 8, cursor: 'pointer', fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          color: message.includes('success') || message.includes('removed') ? '#38a169' : '#e53e3e', 
          fontWeight: 500, 
          textAlign: 'center' 
        }}>
          {message}
        </div>
      )}
    </div>
  );
}