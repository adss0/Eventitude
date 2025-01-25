const Joi = require("joi");
const events = require("../models/event.server.models");
const users = require("../models/user.server.models");
const filter= require('leo-profanity');



//Create new Event.
const create_new_event = async (req, res) => {

  //Criteria validating the information entered for the new Event.
  const schema = Joi.object({
    name:Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    start: Joi.number().integer().min(1).required(),
    close_registration: Joi.number().integer().min(1).required(),
    max_attendees: Joi.number().integer().min(1).required(),
  });

  //If any Error send 400 (Bad request) response.
  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).send({ error_message: error.details[0].message });

  //Check if the start date is in the future.
  let date = Date.now();
  if (req.body.start <= date) {
    return res
      .sendStatus(400)
      .send({ error_message: "Event start time must be in the future." });
  }

  //Check if the close registration date is before the start date.
  if (req.body.start <= req.body.close_registration) {
    return res.status(400).send({
      error_message:
        "Registration date must be closed before the start of the event.",
    });
  }
  const fieldsToCheck = ["name", "description", "location"];

  fieldsToCheck.forEach(field => {
    req.body[field] = filter.clean(req.body[field]);
  });


  //If all validation passes, send the request to the model to add the new Event.
  events.addNewEvent(req.body, req.user_id, (err, id) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    } else {
      console.log(id);
      return res.status(201).send({ event_id: id });
    }
  });
};

//Get the details for an event.
const single_event_details = (req, res) => {
  //Get the event ID from the params.
  const event_id = req.params.event_id;

  let user_id;

  //Check if the user is logged in.
  let token = req.get("X-Authorization");
  users.getIdFromToken(token, (err, id) => {
    if (err) return res.status(500).send(err);
    //If the user is logged in, then pass the user ID. If there is no user Id, then pass it as null.
    if (id) {
      user_id = id;
    }
    //Pass the event Id and user ID to get the event Details from the model function.
    events.getEventDetails(event_id, user_id, (err, result) => {
      //Log if there is any error.
      if (err) {
        if (err.status === 404) {
          return res.status(404).send({ error_message: err.message });
        }
        console.error("Error retrieving event details:", err);
        // Return 500 for all other errors
        return res.sendStatus(500);
      }
      //Return the result along with 200 (OK) reponse.
      return res.status(200).send(result);
    });
  });
};

//Update an event.
const update_event = (req, res) => {
  //Get the event ID from the params.
  const event_id = req.params.event_id;

  // If there is no user Id, return 401 (Unauthorized).
  if (!req.user_id) {
    console.log("The user is not logged in.");
    return res.sendStatus(401);
  }

  //Pass the paramaters to the model function.
  events.getEventDetails(event_id, req.user_id, (err, result) => {
    if (err) {
      console.log(err);
      if (err.status === 404) {
        return res.status(404).send({ error_message: err.message });
      }
      //return 500 status for all other eorrs
      return res.sendStatus(500);
    }
    //If the user Id is not the same as creator Id, return 403 (Forbidden).
    if (req.user_id !== result.creator.creator_id) {
      return res.sendStatus(403);
    }

    //Initial validatation to see if the new event details meet the criteria.
    const schema = Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      location: Joi.string().optional(),
      start: Joi.number().integer().min(1).optional(),
      close_registration: Joi.number().integer().min(1).optional(),
      max_attendees: Joi.number().integer().min(1).optional(),
    });

    //If any Error send 400 (Bad request) response.
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({ error_message: error.details[0].message });
    }

    //Check if the start date is in the future.
    let date = Date.now();
    if (req.body.start <= date) {
      return res
        .sendStatus(400)
        .send({ error_message: "Event start time must be in the future." });
    }

    //Check if the close registration date is before the start of the event.
    if (req.body.start <= req.body.close_registration) {
      return res.status(400).send({
        error_message:
          "Registration date must be closed before the start of the event.",
      });
    }

    //If new event information is provided use that, otherwise, use the event information that is already present.
    const updatedEvent = {
      name: req.body.name || result.name,
      description: req.body.description || result.description,
      location: req.body.location || result.location,
      start: req.body.start || result.start,
      close_registration:
        req.body.close_registration || result.close_registration,
      max_attendees: req.body.max_attendees || result.max_attendees,
    };

    //Pass the infromation to the model function.
    events.updateEvent(event_id, updatedEvent, (err) => {
      if (err) return res.sendStatus(500);
      return res.sendStatus(200);
    });
  });
};

//Register for an event.
const register_for_event = (req, res) => {
  //Get the event ID from the params
  const event_id = req.params.event_id;

  let date = Date.now();

  //Get the event details first to check if the event even exists.
  events.getEventDetails(event_id, req.user_id, (err, result) => {
    if (err) {
      console.log(err);
      //If no event found return 404(not found).
      if (err.status === 404) {
        return res.status(404).send({ error_message: err.message });
      }
      //Return 500 response for all other errors.
      return res.sendStatus(500);
    }
    //Check if the user is already registered or not.
    events.checkIfRegistered(event_id, req.user_id, (err, isRegistered) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      //If the event is full, return 403(forbidden) response.
      if (result.max_attendees == result.number_attending) {
        return res.status(403).send({ error_message: "Event is at capacity" });
      }
      //If the user is already registered,return 403(forbidden) response.
      if (req.user_id === result.creator.creator_id || isRegistered) {
        return res
          .status(403)
          .send({ error_message: "You are already registered" });
      }
      //If the registration date is closed, return 403(forbidden) response.
      if (
        result.close_registration < date ||
        result.close_registration === -1
      ) {
        return res
          .status(403)
          .send({ error_message: "Registration is closed" });
      }

      // Register the user for the event
      events.registerEvent(event_id, req.user_id, (err) => {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }
        //Return 200 (OK) response if the user is successfully registered into the event.
        return res.sendStatus(200);
      });
    });
  });
};

//Delete a event.
const delete_event = (req, res) => {
  //Get the event ID from the params
  const event_id = req.params.event_id;

  //Get the event details first to check if the event even exists.
  events.getEventDetails(event_id, req.user_id, (err, result) => {
    if (err) {
      //If no event found return 404(not found).
      if (err.status === 404) {
        return res.status(404).send({ error_message: err.message });
      }
      //Return 500 response for all other errors.
      return res.sendStatus(500);
    }
    //If the user is not the creator of the event, return 403(forbidden) response.
    if (req.user_id !== result.creator.creator_id) {
      return res.sendStatus(403);
    }
    //Archive the event by setting the close registration date to -1.
    result["close_registration"] = -1;
    //Pass the information to the model function to update the event.
    events.updateEvent(event_id, result, (err) => {
      if (err) return res.sendStatus(500);
      //Return 200(OK) response if the event is successfully deleted.
      return res.sendStatus(200);
    });
  });
};

//Search for events.
const search_event = (req, res) => {
  // Set the default limit of results to 20.
  let limit = 20;
  // Set the default offset to 0.
  let offset = 0;
  // Get the status from the query parameters.
  const status = req.query.status;
  // Get the query from the query parameters.
  const query = req.query.q;

  // Get the token from request headers.
  const token = req.get("X-Authorization");

  // Initialize user Id as undefined.
  let user_id;

  // Retrieve the user ID using the token.
  users.getIdFromToken(token, (err, id) => {
    if (err) {
      // If there is any error retrieving user ID, return a server error.
      return res.status(500).send(err); 
    }
    
    // Set the user ID if available.
    if (id) {
      user_id = id; 
    }

    console.log("User ID:", user_id);
    
    // The list of valid Status that can be used.
    const validStatuses = [
      "MY_EVENTS", // Gets all events that the user created. 
      "ATTENDING", // Gets all events that the user is attending. 
      "ARCHIVE",  // Gets all events that the user deleted.
      "OPEN",  // Gets all events that are still open for registration.
      "ALL_EVENTS",  // Gets the list of all events.
    ];

    // Return 400(Bad Request) if the status is not recognized.
    if (status && !validStatuses.includes(status)) {
      return res.sendStatus(400);
    }

    // Return 400(Bad Request) if the status requires authentication but the user is not logged in.
    if ((status === "MY_EVENTS" || status === "ATTENDING") && !user_id) {
      return res.sendStatus(400);
    }

    // If the status is 'ALL_EVENTS', set the limit and offset to undefined as it should give a list of all the events.
    if (status === "ALL_EVENTS") {
      limit = undefined;
      offset = undefined;
    }

    // If the 'limit' and 'offset' are defined in the query parameters, then use them.
    if (req.query.limit) {
      limit = req.query.limit;
    }
    if (req.query.offset) {
      offset = req.query.offset;
    }

    // Pass the parameters to the model function to get all the events matching the search.
    events.getAllEvents(
      status,
      query,
      limit,
      offset,
      user_id,
      (err, results) => {
        if (err) {
          console.error("Error fetching events:", err);
          // Return 500 response if the query fails.
          return res.status(500).send(err); 
        }
        // Return 200(OK) repsonse with the results.
        return res.status(200).send(results); 
      }
    );
  });
};

module.exports = {
  create_new_event: create_new_event,
  single_event_details: single_event_details,
  update_event: update_event,
  register_for_event: register_for_event,
  delete_event: delete_event,
  search_event: search_event,
};
