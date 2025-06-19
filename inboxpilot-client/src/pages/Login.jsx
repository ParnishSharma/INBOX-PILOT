import { FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';



function Login() {

  const navigate = useNavigate();

  const handleLogin = () =>  { 
  window.location.href = 'http://localhost:5000/auth/google';

  };

  return (
      
<div className=" flex flex-col items-center justify-center h-screen bg-gradient-to-r from-amber-700  to-amber-900 border-2 border-amber-800  ">

       <div className=" inline-block border-2 p-12 rounded-3xl border-black">

       <h1 className="text-4xl top-0 font-Lacquer bg-amber-100 rounded-4xl text-center text-amber-900 font-bold mb-5 ">Inbox Pilot</h1>
<div className="flex flex-col items-center justify-center gap-5 text-2xl">

        Sign in To clear the clutter 

         <button onClick={handleLogin} className="border p-3 rounded-4xl flex gap-4 cursor-pointer  bg-gradient-to-r from-yellow-400  to-red-600 border-red-900 "> Sign Up using Google Account <FaGoogle className="size-8 border p-0.5 sm:size sm:p-2"/></button>
</div>
       </div>

</div>

  )
}

export default Login
