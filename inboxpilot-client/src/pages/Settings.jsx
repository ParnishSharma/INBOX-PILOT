import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [rollupFreq, setRollupFreq] = useState('weekly');

  useEffect(() => {
    fetch('http://localhost:5000/me', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setRollupFreq(data.rollupFreq || 'weekly');
      });
  }, []);

  const updatePreference = (e) => {
    const freq = e.target.value;
    setRollupFreq(freq);

    fetch('http://localhost:5000/me/settings', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollupFreq: freq }),
    });
  };

  const logout = () => {
    fetch('http://localhost:5000/logout', {
      credentials: 'include',
    }).then((navigate('/')));
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">⚙️ Settings</h2>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-lg mb-2">👤 Logged in as: <strong>{user.email}</strong></p>

        <label className="block mb-4">
          🗓️ Rollup Frequency:
          <select value={rollupFreq} onChange={updatePreference} className="ml-2 px-3 py-1 border rounded">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="manual">Manual</option>
          </select>
        </label>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
        >
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}

export default Settings;
