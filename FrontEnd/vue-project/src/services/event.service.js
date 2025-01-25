// Get the event details for a single event
const single_event_details=(id)=>{
  return fetch(`http://localhost:3333/event/${id}`)
  .then((response)=>{
      if(response.status === 200){
          return response.json();
      }else{
          throw new Error ("Error retrieving event details");
      }
  })
  .then((reJson)=>{
      return reJson
  })
  .catch((error)=>{
      console.log("Err", error)
      return Promise.reject(error)
  })
}

// Search for an event using specified conditions
const search_event = (searchString, status, limit, offset, token) => {
  // Base URL
  let url = "http://localhost:3333/search?";

  //Add the search string if provided
  if (searchString) {
    url += `q=${encodeURIComponent(searchString)}&`;
  } 
  // Add limit parameter if provided 
  if (limit) {
    url += `limit=${encodeURIComponent(limit)}&`;
  }
  // Add offset parameter if provided 
  if (offset) {
    url += `offset=${encodeURIComponent(offset)}&`;
  }
  // Add status parameter if provided
  if (status) {
    url += `status=${encodeURIComponent(status)}&`;
  }
 

  // If the URL ends with a & slice it
  url = url.endsWith("&") ? url.slice(0, -1) : url;

  // send the API request
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Set the X-Authorization header if provided
      "X-Authorization": token, 
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Search failed. No Events found");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Register for an event
const register_for_event = (eventId, token) => {

  return fetch(`http://localhost:3333/event/${eventId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token, 
    },
  })
  .then((response)=>{
    if(response.status === 200){
        return response.text;
    }else{
      // In case the user is already registered for the event
        throw new Error("You are already registered for the event");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};


// Create new Event
const create_new_event = (eventData, token) => {

  //Log the event data being sent
  console.log("Event Data being sent:", eventData);

  return fetch("http://localhost:3333/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "X-Authorization": token,
    },
    // Change event data to a JSON String
    body: JSON.stringify(eventData), 
  })
    .then((response) => {
      console.log("Response Status:", response.status);
      if (response.status === 201) {
        return response.json();
      } else {
        throw new Error("Error creating new Event");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Update a Event
const update_event = (eventData, eventId, token) => {
  return fetch(`http://localhost:3333/event/${eventId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    // Change event data to a JSON String
    body: JSON.stringify(eventData), 
  })
    .then((response) => {
      console.log("Response Status:", response.status); 
      if (response.status === 200) {
        return response.text();
      } else {
        throw new Error("Error updating Event");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Delete a event
const delete_event=(eventId,token)=>{
  return fetch(`http://localhost:3333/event/${eventId}`, {
    method: "DELETE",
    headers: {
      "X-Authorization": token, 
    },
  })
    .then((response) => {
      console.log("Response Status:", response.status); 
      if (response.status === 200) {
        return response.text();
      } else {
        throw new Error("Error deleting Event");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

const allEvents = (token) => {

  // Make the API request
  return fetch("http://localhost:3333/search?status=ALL_EVENTS", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token, 
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Search failed. No Events found");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};



export const eventService={
single_event_details: single_event_details,
search_event: search_event,
register_for_event:register_for_event,
create_new_event: create_new_event,
update_event: update_event,
delete_event:delete_event,
allEvents: allEvents,
}