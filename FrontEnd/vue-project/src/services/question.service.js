// Ask a question
const ask_question = (eventId, questionData, token) => {
  return fetch(`http://localhost:3333/event/${eventId}/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
    // Convert the data to a JSON String
    body: JSON.stringify(questionData),
  })
    .then((response) => {
      if (response.status === 201) {
        return response.json();
      }
      // In case the user is already registered for the event
      else if (response.status === 403) {
        throw new Error("You must be registered to ask a question");
      } else {
        throw new Error("Error asking a question");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Upvote a question
const upvote_question = (questionID, token) => {
  return fetch(`http://localhost:3333/question/${questionID}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token, 
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.text(); 
      } else {
        throw new Error("You have already voted");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};
// Downvote a question
const downvote_question = (questionID, token) => {
  return fetch(`http://localhost:3333/question/${questionID}/vote`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.text();
      } else {
        throw new Error("You have already voted");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Delete a question
const delete_question = (questionID, token) => {
  return fetch(`http://localhost:3333/question/${questionID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token, 
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.text(); 
      } // In case the user is not the author of the quesiton 
       else if (response.status === 403) {
        throw new Error("You are not the author of the question");
      } else {
        throw new Error("Error deleting question");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

export const questionService = {
  ask_question: ask_question,
  upvote_question: upvote_question,
  downvote_question: downvote_question,
  delete_question: delete_question,
};
