// src/pages/Skills.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const Skills = () => {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('/users/me');
      setUser(res.data);

      const allSkills = await axios.get('/skills');
      setSkills(allSkills.data);
    };
    fetch();
  }, []);

  const addSkill = async () => {
    if (!selectedSkill || !proficiency || !experience) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post('/skills/user', {
        user_id: user.user_id,
        skill_id: parseInt(selectedSkill),
        proficiency_level: proficiency,
        years_experience: parseInt(experience),
      });
      alert('Skill added!');
    } catch (err) {
      alert('Failed to add skill');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Add Skill to Profile</h2>

      <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
        <option value="">-- Select Skill --</option>
        {skills.map(s => (
          <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>
        ))}
      </select>

      <select value={proficiency} onChange={e => setProficiency(e.target.value)}>
        <option value="">-- Proficiency Level --</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Expert">Expert</option>
      </select>

      <input
        type="number"
        placeholder="Years of Experience"
        min="0"
        value={experience}
        onChange={e => setExperience(e.target.value)}
      />

      <button onClick={addSkill}>Add Skill</button>
    </div>
  );
};

export default Skills;
