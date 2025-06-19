import { useEffect, useState } from 'react';
import EmailModal from '../Components/EmailModal';

function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetch('http://localhost:5000/me/emails', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched emails:', data);
        setEmails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch emails', err);
        setLoading(false);
      });
  }, []);

  const handleRollup = (email) => {
    fetch('http://localhost:5000/me/rollup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(email),
    })
      .then((res) => res.json())
      .then((data) => {
        alert('Rollup successful!', data)
      })
      .catch((err) => {
        console.error('Failed to rollup email', err);
      })

  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">📬 Recent Emails</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4 max-h-[500px] overflow-y-auto">
          {emails.map((email) => (
            <li key={email.id}
              
              className="cursor-pointer hover:bg-gray-100 p-3 border-b" >

              <h3 className="text-xl font-semibold" onClick={() => openModal(email)}>{email.subject}</h3>
              <p className="text-gray-600 mb-2" onClick={() => openModal(email)} >From: {email.from}</p>
              <p className="font-stretch-extra-expanded text-md " onClick={() => openModal(email)}>{email.date}</p>
              {email.unsubscribe ? (
                <a
                  href={email.unsubscribe.startsWith('mailto:')
                    ? email.unsubscribe
                    : email.unsubscribe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                >
                  Unsubscribe
                </a>

              ) : (
                <span className="text-sm text-gray-400 italic">No unsubscribe found</span>

              )}

              <button onClick={() => handleRollup(email)} className='ml-2 px-4 py-2 rounded-xl text-md text-cyan-300 bg-gray-900 cursor-pointer hover:bg-gray-700 transition '>Rollup</button>
            </li>

          ))}


        </ul>

      )}
      <EmailModal isOpen={modalOpen} onClose={closeModal} email={selectedEmail} />

    </div>
  );
}

export default Dashboard;
