import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', name: '', surname: '', role: 'customer'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registered successfully!');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Register</h3>
      <form onSubmit={handleSubmit}>
        <input name="username" className="form-control my-2" placeholder="Username" onChange={handleChange} />
        <input name="email" className="form-control my-2" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" className="form-control my-2" placeholder="Password" onChange={handleChange} />
        <input name="name" className="form-control my-2" placeholder="Name" onChange={handleChange} />
        <input name="surname" className="form-control my-2" placeholder="Surname" onChange={handleChange} />
        <select name="role" className="form-control my-2" onChange={handleChange}>
          <option value="customer">Customer</option>
          <option value="contractor">Contractor</option>
        </select>
        <button className="btn btn-primary mt-2" type="submit">Register</button>
      </form>
    </div>
  );
}
