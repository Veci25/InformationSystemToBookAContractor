import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function Skills() {
  const [user, setUser] = useState(null);

  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [mySkills, setMySkills] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [savingRow, setSavingRow] = useState({}); 

  useEffect(() => {
    (async () => {
      try {
        const me = await axios.get('/users/me');
        setUser(me.data);

        const all = await axios.get('/skills');
        setSkills(all.data || []);

        await loadMine();
      } catch (err) {
        console.error('Failed to load skills/user', err);
        alert('Failed to load skills. Please refresh.');
      }
    })();
  }, []);

  const loadMine = async () => {
    setLoadingMine(true);
    try {
      const { data } = await axios.get('/skills/me');
      setMySkills(data || []);
    } catch (e) {
      console.error(e);
      setMySkills([]);
    } finally {
      setLoadingMine(false);
    }
  };

  const addSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkill || !proficiency || experience === '') {
      alert('Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('/skills/user', {
        user_id: user.user_id,
        skill_id: parseInt(selectedSkill, 10),
        proficiency_level: proficiency,
        years_experience: Math.max(0, parseInt(experience, 10) || 0),
      });
      setSelectedSkill('');
      setProficiency('Beginner');
      setExperience('');
      await loadMine();
      alert('Skill added!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setSubmitting(false);
    }
  };

  const updateYears = async (skill_id, value) => {
    const years =
      value === '' || value === null
        ? null
        : Math.max(0, Math.min(60, parseInt(value, 10) || 0));

    setSavingRow((m) => ({ ...m, [skill_id]: true }));
    try {
      await axios.patch(`/skills/me/${skill_id}/experience`, { years_experience: years });
      setMySkills((prev) =>
        prev.map((s) => (s.skill_id === skill_id ? { ...s, years_experience: years } : s))
      );
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to update experience');
      await loadMine();
    } finally {
      setSavingRow((m) => ({ ...m, [skill_id]: false }));
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-0">Skills</h2>
          <small className="text-muted">Add skills and keep your experience up to date.</small>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Add Skill to Profile</h4>
              <form onSubmit={addSkill} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Skill</label>
                  <select
                    className="form-select"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    required
                  >
                    <option value="">-- Select Skill --</option>
                    {skills.map((s) => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Proficiency</label>
                  <select
                    className="form-select"
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="form-control"
                    placeholder="e.g. 3"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting || !user}
                  >
                    {submitting ? 'Adding…' : 'Add Skill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">My Skills</h4>
                {loadingMine && <span className="text-muted small">Loading…</span>}
              </div>

              {mySkills.length === 0 ? (
                <div className="text-muted">You haven’t added any skills yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Proficiency</th>
                        <th style={{ width: 200 }}>Years</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mySkills.map((s) => (
                        <tr key={s.skill_id}>
                          <td>{s.skill_name || s.skill_id}</td>
                          <td className="text-capitalize">
                            {s.proficiency_level || '—'}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="60"
                                className="form-control"
                                style={{ maxWidth: 110 }}
                                value={s.years_experience ?? ''}
                                onChange={(e) =>
                                  setMySkills((prev) =>
                                    prev.map((x) =>
                                      x.skill_id === s.skill_id
                                        ? {
                                            ...x,
                                            years_experience:
                                              e.target.value === ''
                                                ? ''
                                                : parseInt(e.target.value, 10) || 0,
                                          }
                                        : x
                                    )
                                  )
                                }
                                onBlur={(e) => updateYears(s.skill_id, e.target.value)}
                              />
                              {savingRow[s.skill_id] && (
                                <span className="text-muted small">Saving…</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
