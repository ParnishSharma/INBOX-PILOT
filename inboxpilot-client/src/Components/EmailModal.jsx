// components/EmailModal.jsx
import DOMPurify from 'dompurify';


const EmailModal = ({ isOpen, onClose, email }) => {
  if (!isOpen || !email) return null;
  console.log("Rendering EmailModal with email:", email)
const cleanHTML = DOMPurify.sanitize(email.htmlBody);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] md:w-[60%] max-h-[80%] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{email.subject}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600 text-xl">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-2"><b>From:</b> {email.from}</p>
        <p className="text-sm text-gray-500 mb-4"><b>Date:</b> {email.date || 'N/A'}</p>
        <hr className="mb-4" />
        <div 
  className="email-body" 
  dangerouslySetInnerHTML={{ __html: cleanHTML }}
></div>
      </div>
    </div>
  );
};

export default EmailModal;
