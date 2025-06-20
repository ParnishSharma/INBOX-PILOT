import { useEffect, useState } from 'react';
import EmailModal from '../Components/EmailModal';

function Labels() {
  const [labels, setLabels] = useState([]);
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [emails, setEmails] = useState([]);



  const [selectedEmail, setSelectedEmail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (email) => {
    setSelectedEmail(email);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmail(null);
    setModalOpen(false);
  };

  useEffect(() => {
    fetch('https://inbox-pilot-production.up.railway.app/labels', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setLabels(data))
      .catch((err) => console.error('Failed to fetch labels:', err));
  }, []);

  const fetchEmailsForLabel = (labelId) => {
    setSelectedLabelId(labelId);
    fetch(`https://inbox-pilot-production.up.railway.app/labels/${labelId}/emails`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setEmails(data))
      .catch((err) => console.error('Failed to fetch emails:', err));
  };

  return (
    <div className="p-2">
      <h2 className="text-3xl font-bold mb-4">🏷️ Labels</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h3 className="text-xl font-semibold mb-2">Your Labels:</h3>
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {labels.map((label) => (
              <li key={label.id}>
                <button
                  onClick={() => fetchEmailsForLabel(label.id)}
                  className="text-blue-600 hover:underline"
                >
                  {label.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="max-h-[450px] bg-yellow-400 p-4 rounded-xl shadow overflow-auto">
          <h3 className="text-xl font-semibold mb-2">Emails in Label:</h3>
          {emails.length > 0 ? (
            <ul className="space-y-3">
              {emails.map((msg) => (
                <li key={msg.id} className="bg-gray-100 p-4 rounded-xl shadow">
                  <p className="font-semibold cursor-pointer" onClick={() => openModal(msg)}  >{msg.subject || '(No Subject)'}</p>
                  <p className="text-sm text-gray-600"  onClick={() => openModal(msg)}>From: {msg.from}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No emails yet or no label selected.</p>
          )}
        </div>
      </div>
     <EmailModal isOpen={openModal} onClose={closeModal} email={selectedEmail} />
    </div>
  );
}

export default Labels;
