const db = require("../../database");

// Add new Event to the database
const addNewEvent = (event, user_id, done) => {
  const sql =
    "INSERT INTO `events` (name, description, location, start_date, close_registration, max_attendees, creator_id)VALUES(?,?,?,?,?,?,?)";
  let values = [
    event.name,
    event.description,
    event.location,
    event.start,
    event.close_registration,
    event.max_attendees,
    user_id,
  ];
  // Run the SQL query
  db.run(sql, values, function (err) {
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

// Get event details from the database
const getEventDetails = (event_id, userid, done) => {
  const logged_in_user_id = userid;

  // SQL Query to get Event details
  const sql = `
        SELECT e.event_id, e.name, e.description, e.location, e.start_date AS start, 
               e.close_registration, e.max_attendees, u.user_id AS creator_id, 
               u.first_name, u.last_name, u.email 
        FROM events e 
        JOIN users u ON e.creator_id = u.user_id 
        WHERE e.event_id = ?`;

  // SQL Query to get the attendees for an event
  const attendeeSql = `
        SELECT u.user_id, u.first_name, u.last_name, u.email 
        FROM attendees ae 
        JOIN users u ON ae.user_id = u.user_id 
        WHERE ae.event_id = ?`;

  // SQL Query to get the questions for an event
  const questionSql = `SELECT 
    q.question, 
    q.asked_by, 
    q.votes, 
    q.question_id, 
    u.user_id AS user_id, 
    u.first_name AS first_name 
FROM questions q
JOIN users u ON q.asked_by = u.user_id
WHERE q.event_id = ? 
ORDER BY q.question_id DESC`;

  // Run the event query to get the event details
  db.get(sql, [event_id], (err, row) => {
    if (err) return done(err);
    // Return a 404(Not Found) if no such event exists
    if (!row) return done({ status: 404, message: "Event not found" });

    let event_details = row;

    // Object to return
    const to_return = {
      event_id: event_details.event_id,
      creator: {
        creator_id: event_details.creator_id,
        first_name: event_details.first_name,
        last_name: event_details.last_name,
        email: event_details.email,
      },
      name: event_details.name,
      description: event_details.description,
      location: event_details.location,
      start: event_details.start,
      close_registration: event_details.close_registration,
      max_attendees: event_details.max_attendees,
    };

    let attendees_list = [];
    // Get the attendee details
    db.each(
      attendeeSql,
      [event_id],
      (err, attendee) => {
        if (err) return done(err);

        // Add the attendees 
        attendees_list.unshift({
          user_id: attendee.user_id,
          first_name: attendee.first_name,
          last_name: attendee.last_name,
          email: attendee.email,
        });
      },
      (err) => {
        if (err) return done(err);

        // Add the creator details
        attendees_list.unshift({
          user_id: event_details.creator_id,
          first_name: event_details.first_name,
          last_name: event_details.last_name,
          email: event_details.email,
        });

        to_return.number_attending = attendees_list.length;

        // If the logged in user is the creator of the event, Add the attendee details
        if (
          logged_in_user_id &&
          logged_in_user_id === event_details.creator_id
        ) {
          to_return.attendees = attendees_list;
        }

        db.all(questionSql, [event_id], (err, questions) => {
          if (err) return done(err);
          
          // Add the questions list to the object
          let questions_list = [];
          questions.forEach((question) => {
            questions_list.push({
              question_id: question.question_id,
              question: question.question,
              votes: question.votes,
              asked_by: {
                user_id: question.user_id,
                first_name: question.first_name,
              },
            });
          });

          to_return.questions = questions_list;
          console.log(to_return);
          // Return the object with the details
          return done(null, to_return);
        });
      }
    );
  });
};

// Update a event in the database
const updateEvent = (event_id, event, done) => {
  // SQL query to update event 
  const sql =
    "UPDATE events SET name=?, description=?, location=?, start_date=?,close_registration=?, max_attendees=? WHERE event_id=?";
  let values = [
    event.name,
    event.description,
    event.location,
    event.start,
    event.close_registration,
    event.max_attendees,
    event_id,
  ];
  // Run the SQL query 
  db.run(sql, values, function (err) {
    console.log(event);
    if (err) return done(err);
    return done(null, this.changes);
  });
};

// Check if the user is registered for the event
const checkIfRegistered = (event_id, user_id, done) => {
  const sql =
    "SELECT COUNT(*) As count FROM `attendees` WHERE event_id = ? AND user_id = ?";
  db.get(sql, [event_id, user_id], (err, row) => {
    if (err) return done(err);
    // Return true if the user is registered for the event
    return done(null, row.count > 0); 
  });
};
// Register for an event
const registerEvent = (event_id, user_id, done) => {
  const sql = "INSERT INTO `attendees` (user_id, event_id) VALUES(?,?)";
  db.run(sql, [user_id, event_id], function (err) {
    if (err) return done(err);
    return done(null, this.changes);
  });
};

// Get event details for all events in the database dependent on conditions
const getAllEvents = (status, query, limit, offset, user_id, done) => {

  // Array for making up the SQL conditions
  let conditions = [];
  let params = [];

  // If there is a search query, add it to the conditions
  if (query) {
    conditions.push("name LIKE ?");
    params.push(`%${query}%`);
  }
  //Get events where the user is the creator of the event
  if (status === "MY_EVENTS") {
    conditions.push("creator_id = ?");
    params.push(user_id);
  } else if (status === "ATTENDING") {
    // Get events where user is an attendee
    conditions.push(
      "event_id IN (SELECT event_id FROM attendees WHERE user_id = ?)"
    );
    params.push(user_id);
  }
  else if (status === "ARCHIVE") {
    // Events that have been archived or closed for registration
    conditions.push("close_registration = -1");
  } else if (status === "OPEN") {
    // Events that are still open for registration
    conditions.push("close_registration > ?");
    // Get current date to check if the event is open or closed
    params.push(Date.now()); 
  }

  // SQL Query 
  let sql = `
        SELECT 
            events.*, 
            (SELECT COUNT(*) FROM attendees WHERE attendees.event_id = events.event_id) AS number_attending
        FROM events
    `;

  // If there are conditions, then add the conditions to the SQL Query
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  // Set the limit if available
  if (limit) {
    sql += " LIMIT ?";
    params.push(limit);
  }
  // Set the offset if available
  if (offset) {
    sql += " OFFSET ?";
    params.push(offset);
  }
  // Log the queries for debugging
  console.log("SQL Query:", sql);
  console.log("Params:", params);

  // Run the SQL query
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    // Return the rows as a result
    return done(null, rows); 
  });
};

module.exports = {
  addNewEvent: addNewEvent,
  getEventDetails: getEventDetails,
  updateEvent: updateEvent,
  registerEvent: registerEvent,
  checkIfRegistered: checkIfRegistered,
  getAllEvents: getAllEvents,
};
