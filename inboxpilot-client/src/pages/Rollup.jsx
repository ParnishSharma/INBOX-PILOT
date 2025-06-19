import { useEffect, useState } from 'react';
import EmailModal from '../Components/EmailModal';


function Rollup() {
  const [rollups, setRollups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);
const [selectedEmail, setSelectedEmail] = useState(null);


  const [selectedmail, setSelectedmail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (email) => {
    setSelectedmail(email);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedmail(null);
    setModalOpen(false);
  };

  useEffect(() => {
    fetch('http://localhost:5000/me/rollup', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setRollups(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading rollup emails:', err);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    fetch('http://localhost:5000/me/rollup/' + id, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(() => {
        setRollups(rollups.filter((email) => email._id !== id));
        alert('Rollup deleted successfully!');
      })
      .catch((err) => {
        console.error('Failed to delete rollup:', err);
        alert('Failed to delete rollup');
      });
  };

  const fetchLabels = async () => {
    try {
      const res = await fetch('http://localhost:5000/labels', {
        credentials: 'include',
      });
      const data = await res.json();
      console.log("Fetched labels:", data);
      setLabels(data.filter(label => !label.id.startsWith('CATEGORY_') && !["INBOX", "SENT", "TRASH", "DRAFT"].includes(label.id)));
    } catch (err) {
      console.error("Failed to fetch labels:", err);
    }
  };

const handleAssignClick = (mongoId, gmailId) => {
  setSelectedEmail({ mongoId, gmailId });
  fetchLabels();
};

  const assignLabel = async (emailId, labelId) => {
    try {
      const res = await fetch('http://localhost:5000/assign-label', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, labelId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Label assigned!');
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('Failed to assign label:', err);
      alert('Failed to assign label');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">📦 Weekly Rollup</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4 max-h-[600px] overflow-y-auto">
          {rollups.length > 0 ? (
            rollups.map((email) => (
              <li key={email.gmailMessageId || email._id} className="bg-amber-100 rounded-xl shadow p-4">
                <h3 className="text-xl font-semibold text-amber-900"  onClick={() => openModal(email)}>{email.subject}</h3>
                <p className="text-gray-700">From: {email.from}</p>
                <p className="text-sm text-gray-500">Added: {new Date(email.createdAt).toLocaleString()}</p>

                <button
                  onClick={() => handleDelete(email._id)}
                  className="ml-2 mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Delete
                </button>

                <button
                  className="ml-2 mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                  onClick={() => handleAssignClick(email._id, email.gmailMessageId)}
                >
                  Assign to Label
                </button>

                {selectedEmail?.mongoId === email._id && (
                  <div className="mt-4 bg-white border rounded-xl p-4 shadow-lg">
                    <h4 className="text-md font-bold text-gray-700 mb-2">Choose Label:</h4>
                    <ul className="space-y-2">
                      {labels.length > 0 ? (
                        labels.map((label) => (
                          <li key={label.id}>
                            <button
                              onClick={() => assignLabel(selectedEmail.gmailId, label.id)}
                              className="text-blue-600 hover:underline"
                            >
                              {label.name}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">No labels found.</li>
                      )}
                    </ul>
                    <button
                      onClick={() => setSelectedEmailId(null)}
                      className="mt-4 text-sm text-red-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic">No rollup emails yet. Go roll some up 🌀</p>
          )}
        </ul>
      )}
      <EmailModal isOpen={modalOpen} onClose={closeModal} email={selectedmail} />
    </div>
  );
}

export default Rollup;
