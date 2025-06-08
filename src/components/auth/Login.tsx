import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { users } from '../../data/users';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');

  //   const user = users.find(
  //     u => u.email === formData.email && u.password === formData.password && u.isActive
  //   );

  //   if (!user) {
  //     setError('Invalid credentials or inactive account');
  //     return;
  //   }

  //   // Store user info in localStorage (in production, use proper session management)
  //   localStorage.setItem('user', JSON.stringify(user));

  //   // Redirect based on role
  //   switch (user.role) {
  //     case 'admin':
  //       navigate('/admin/dashboard');
  //       break;
  //     case 'manager':
  //       navigate('/manager/dashboard');
  //       break;
  //     case 'employee':
  //       navigate('/employee/dashboard');
  //       break;
  //   }
  // };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://localhost:5030/api/Auth/Login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok || !data.isSuccess) {
      setError(data.errorMessages?.[0] || 'Login failed');
      return;
    }

    const { access_token, user_id, user_name, role_name,user_email } = data.result;

    // Save the token and user info in localStorage
        localStorage.setItem('user', JSON.stringify({
        token: access_token,
        userId: user_id,
        userName: user_name,
        userEmail : user_email,
         role: role_name.toLowerCase() 
      }));


          // Navigate based on role
      if (role_name === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/manager/dashboard');
      }

  } catch (err) {
    console.error(err);
    setError('Something went wrong. Please try again later.');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;