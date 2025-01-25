const db = require("../../database");

// Add a question to the databas
const insertQuestion = (question, event_id, user_id, done) => {
  const sql = `INSERT INTO questions (question,event_id, asked_by, votes) VALUES (?,?,?,?)`;
  const values = [question.question, event_id, user_id, 0];
  // Run the query
  db.run(sql, values, function (err) {
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

// Get a question from the database
const getQuestionEventDetails = (question_id, done) => {
  const sql = `SELECT q.question_id, q.question, q.asked_by, q.votes, q.event_id, e.creator_id
                 FROM questions q
                 JOIN events e ON q.event_id = e.event_id
                 WHERE q.question_id = ?`;

  const values = [question_id];
  console.log(question_id);
  // Rum the query 
  db.get(sql, values, (err, result) => {
    console.log(result);
    if (err) return done(err);
    return done(null, result);
  });
};

// Delete a question from the database
const deleteQuestion = (question_id, done) => {
  const sql = `DELETE FROM questions WHERE question_id = ?`;
  const values = [question_id];

  db.run(sql, values, function (err) {
    if (err) return done(err);
    return done(null); 
  });
};
// Upvote a question
const upVote = (question_id, user_id, done) => {
  const checkVoteSql = `SELECT * FROM votes WHERE question_id = ? AND voter_id = ?`;
  const insertVoteSql = `INSERT INTO votes (question_id, voter_id) VALUES (?, ?)`;
  const updateVoteSql = `UPDATE questions SET votes = IFNULL(votes, 0) + 1 WHERE question_id = ?`;
  const values = [question_id, user_id];
  
  // Check if the vote exists in the databse already
  db.get(checkVoteSql, values, (err, row) => {
    if (err) {
      console.error("Error checking vote:", err);
      return done(err);
    }
    // If the vote exists return
    if (row) {
      console.log("User has already voted");
      return done(null, { alreadyVoted: true });
    }

    // If the vote doesnot exist, insert the vote in the database
    db.run(insertVoteSql, values, (err) => {
      if (err) return done(err);

      // Update the question to add the vote
      db.run(updateVoteSql, [question_id], (err) => {
        if (err) return done(err);
        console.log("Vote successfully added.");
        return done(null, { fittingresponse: true });
      });
    });
  });
};

// Downvote a question 
const downVote = (question_id, user_id, done) => {
  const checkVoteSql = `SELECT * FROM votes WHERE question_id = ? AND voter_id = ?`;
  const insertVoteSql = `INSERT INTO votes (question_id, voter_id) VALUES (?, ?)`;
  const updateVoteSql = `UPDATE questions SET votes = IFNULL(votes, 0) -1 WHERE question_id = ? `;

  const values = [question_id, user_id];

  // Check if the vote already exists
  db.get(checkVoteSql, values, (err, row) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    // If the vote exists return 
    if (row) {
      return done(null, { alreadyDeleted: true });
    }
    // If the vote doesnot exist, insert the vote in the database
    db.run(insertVoteSql, values, (err) => {
      if (err) return done(err);
      // Update the question to add the vote
      db.run(updateVoteSql, [question_id], (err) => {
        if (err) return done(err);
        console.log("Vote successfully deleted and count updated.");
        return done(null, { fittingresponse: true });
      });
    });
  });
};

module.exports = {
  insertQuestion: insertQuestion,
  deleteQuestion: deleteQuestion,
  getQuestionEventDetails: getQuestionEventDetails,
  upVote: upVote,
  downVote: downVote,
};
