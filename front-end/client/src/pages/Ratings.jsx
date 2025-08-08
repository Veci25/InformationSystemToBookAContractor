import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const Ratings = () => {
  const [user, setUser] = useState(null);
  const [targetId, setTargetId] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [receivedRatings, setReceivedRatings] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('/users/me');
      setUser(res.data);

      const myRatings = await axios.get(`/ratings/user/${res.data.user_id}`);
      setReceivedRatings(myRatings.data);
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId || !feedback) return alert('All fields required');

    try {
      await axios.post('/ratings/create', {
        target_user_id: targetId,
        rating_value: ratingValue,
        feedback_text: feedback,
      });
      alert('Rating submitted!');
      window.location.reload();
    } catch {
      alert('Failed to submit rating');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Submit a Rating</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-4">
          <input className="form-control" type="number" placeholder="Target User ID" value={targetId} onChange={e => setTargetId(e.target.value)} />
        </div>
        <div className="col-md-4">
          <input className="form-control" type="number" min={1} max={5} value={ratingValue} onChange={e => setRatingValue(e.target.value)} />
        </div>
        <div className="col-md-12">
          <textarea className="form-control" placeholder="Feedback" value={feedback} onChange={e => setFeedback(e.target.value)} />
        </div>
        <div className="col-12">
          <button className="btn btn-primary" type="submit">Submit</button>
        </div>
      </form>

      <h4 className="mt-4">Your Ratings</h4>
      <ul className="list-group">
        {receivedRatings.map(r => (
          <li className="list-group-item" key={r.rating_id}>
            ⭐ {r.rating_value} — {r.feedback_text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ratings;