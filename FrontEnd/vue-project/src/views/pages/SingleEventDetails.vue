<template>
  <div class="event-details-container">
    <h1>Event Details</h1>
    <div v-if="event" class="event-box">
        <!-- Event Section -->

      <button class="event-edit-btn" v-if="loggedIn && isMyEvent" @click="goToUpdateEvent">
        <i class="fas fa-edit"></i>
      </button>

      <p><strong>Title:</strong> {{ event.name }}</p>
      <p><strong>Location:</strong> {{ event.location }}</p>
      <p><strong>Description:</strong> {{ event.description }}</p>
      <p><strong>Start Date:</strong> {{ formatDate(event.start) }}</p>
      <p><strong>Close Registration:</strong> {{ formatDate(event.close_registration) }}</p>
      <p><strong>Max Attendees:</strong> {{ event.max_attendees }}</p>
      <p><strong>Number Attending:</strong> {{ event.number_attending }}</p>
    </div>
      <!-- Error Message -->

    <div v-else-if="error" class="error-message">
      <p>Error: {{ error }}</p>
    </div>
    <div v-else class="loading-message">
      <p>Loading event details...</p>
    </div>
    <button class="register-btn" v-if="!isMyEvent"  @click="registerForEvent">Register</button>
    <button class="question-btn" v-if="!isMyEvent" @click="askQuestion">Ask a Question</button>
  </div>

  <!-- Question Section -->
  <div class="question-details-container" v-if="event && event.questions.length">
    <h1>Questions</h1>

    <div v-for="question in event.questions" :key="question.question_id" class="question-box">
      <button class="question-edit-btn" v-if="loggedIn" @click="deleteQuestion(question.question_id)">
        <i class="fa-solid fa-trash"></i>
      </button>
      <p><strong>Question:</strong> {{ question.question }}</p>
      <p><strong>Asked By:</strong> {{ question.asked_by.first_name }} {{ question.asked_by.last_name }}</p>
      <p><strong>Votes:</strong> {{ question.votes }}</p>

        <!-- Voting Section -->

      <div class="vote-container">
        <button class="downvoting-btn" v-if="loggedIn" @click="downvoteQuestion(question.question_id)">
          <i class="fa-solid fa-thumbs-down vote-icon"></i>
        </button>
        <button class="upvoting-btn" v-if="loggedIn" @click="upvoteQuestion(question.question_id)">
          <i class="fa-solid fa-thumbs-up vote-icon"></i>
        </button>
      </div>
    </div>
  </div>
</template>



<script>
import { authService } from "@/services/auth.service";
import { eventService } from "@/services/event.service";
import { questionService } from "@/services/question.service";

export default {
  data() {
    return {
      eventId: null,
      event: null,
      error: "",
      question: null,
      loggedIn: false,
      status: "MY_EVENTS",
      isMyEvent:false,
    };
  },
  created() {
    this.eventId = this.$route.params.event_id;
    this.fetchEventDetails();
     // Checks if there's a session token
    this.loggedIn = !!authService.getSessionToken(); 
  },
  methods: {
    formatDate(date_value) {
      if (!date_value) return "Invalid Date";
      try {
        return new Date(date_value).toLocaleDateString();
      } catch (error) {
        return "Error Formatting Date";
      }
    },

    fetchEventDetails() {
      const token = authService.getSessionToken();  

      eventService
        .single_event_details(this.eventId)
        .then((event) => {
          this.event = event;

          // Search for the event based on its name and status
          eventService
            .search_event(this.event.name, this.status, "", "", token)
            .then((response) => {
              if (response.length === 0) {
                this.isMyEvent = false; 
              } else {
                this.isMyEvent = true;   
              }
            })
            .catch((error) => {
              this.error = error.message || "Error fetching event details";
            });
        })
        .catch((error) => {
          this.error = error.message || "Error fetching event details";
        });
    },
    //Register for a event
    registerForEvent() {
      const token = authService.getSessionToken();
      const closeRegistrationDate = new Date(this.event.close_registration);
      const currentDate = Date.now();

      //Validation checks
      if (!token) {
        alert("You need to log in to register for this event.");
        return;
      }

      if (closeRegistrationDate < currentDate) {
        alert("Registration date has closed.");
        return;
      }

      if (this.event.number_attending === this.event.max_attendees) {
        alert("Event is at capacity.");
        return;
      }
      //Send the request to the API service
      eventService
        .register_for_event(this.eventId, token)
        .then(() => {
          alert("Successfully registered for the event!");
        })
        .catch((error) => {
          console.error("Error registering for event:", error);
          alert(error.message || "Registration failed. Please try again.");
        });
    },
    goToUpdateEvent() {
      this.$router.push({ path: `/update/${this.eventId}` });
    },
    askQuestion() {
      const token = authService.getSessionToken();
      if (!token) {
        alert("You need to log in to ask a question.");
        return;
      } else if(token){      
      this.$router.push({ path: `/event/${this.eventId}/question` });
      }
    },

    //Down vote a question
    downvoteQuestion(question_id) {
      console.log("Downvote button clicked for question ID:", question_id);

      const token = authService.getSessionToken();

      if (!token) {
        alert("You need to log in to downvote a question.");
        return;
      }

      questionService
        .downvote_question(question_id, token)
        .then(() => {
          alert("Question successfully downvoted!");
          // Optionally, refresh the question list or update the vote count
          this.fetchEventDetails();
        })
        .catch((error) => {
          console.error("Error downvoting question:", error);
          alert(error.message || "Downvote failed. Please try again.");
        });
    },
        // Up vote a question
    upvoteQuestion(question_id) {
      const token = authService.getSessionToken();

      if (!token) {
        alert("You need to log in to downvote a question.");
        return;
      }
      questionService
        .upvote_question(question_id, token)
        .then(() => {
          alert("Question successfully upvoted!");
          // Optionally, refresh the question list or update the vote count
          this.fetchEventDetails();
        })
        .catch((error) => {
          console.error("Error upvoting question:", error);
          alert(error.message || "Downvote failed. Please try again.");
        });
    },
    deleteQuestion(question_id) {
      const token = authService.getSessionToken();
      
      if (!token) {
        alert("You need to log in to delete a question.");
        return;
      }

      questionService.delete_question(question_id, token)
        .then(() => {
          alert("Question deleted successfully!");
          this.fetchEventDetails();
        })
        .catch((error) => {
          console.error("Error deleting question:", error);
          alert(error.message || "Deleting question failed. Please try again.");
        });
    }

  },
};
</script>

<style scoped>
.event-details-container {
  color: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  margin: 2rem auto;
  padding: 1rem;
  max-width: 800px;
  border-radius: 8px;
}


/* Styling for Event box */
.event-box {
  background-color: #1e1e1e;
  border: 1px solid #333;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem auto;
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
}

.event-box p {
  font-size: 1.2rem;
  margin: 0.5rem 0;
  color: #D3D3D3;
}

.event-box strong {
  color: #ffffff;
}
/*Styling for edit button */
.event-edit-btn {
  margin-left: 98%;
  color: #ffffff;
  background-color: #1e1e1e;
  border: none;
  padding: 0;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

}

.event-edit-btn:hover {
  box-shadow: 0px 0px 20px rgba(255, 255, 255, 0.4);
  background-color: #1e1e1e;
  transform: scale(1.4);
}

.event-edit-btn:after {
  content: "Edit";
  background-color: #007bff;
  color: #ffffff;
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  /**Initially hidden */
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.event-edit-btn:hover:after {
  opacity: 1;
  visibility: visible;
}
/* Styling for question edit button */
.question-edit-btn {
  position: relative;
  margin-left: 98%;
  background-color: #1e1e1e;
  color: #ffffff;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 0;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;

}

.question-edit-btn:hover {
  background-color: #1e1e1e;
  box-shadow: 0px 0px 20px rgba(255, 255, 255, 0.4);
  transform: scale(1.4);
}

.question-edit-btn:after {
  content: "Delete";
  position: absolute;
  left: 50%;
  top: -35px;
  transform: translateX(-50%);
  background-color: #007bff;
  color: #ffffff;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  opacity: 0;
  /* Initially hidden */
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.question-edit-btn:hover:after {
  opacity: 1;
  visibility: visible;
}

/**Styling for downvote button */
.downvoting-btn {
  background: none;
  color: #ffffff;
  border: none;
  padding: 0;
  font-size: 1rem;
  border-radius: 4px;
  /* Rounded corners */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

}

.downvoting-btn:hover {
  background: none;
  transform: scale(1.2);
}

.downvoting-btn:after {
  content: "Downvote";
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}


.downvoting-btn:hover:after {
  opacity: 1;
  visibility: visible;
}

.upvoting-btn {
  background: none;
  color: #ffffff;
  border: none;
  padding: 0;
  border-radius: 4px;
  /* Rounded corners */
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.upvoting-btn:hover {
  background: none;
  transform: scale(1.2);
}

.upvoting-btn:after {
  background-color: #007bff;
  color: #ffffff;
  content: "Upvote";
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.upvoting-btn:hover:after {
  opacity: 1;
  visibility: visible;
}


/* Stylign for Register button */
.register-btn {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #007bff;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}

.register-btn:hover {
  background-color: #0056b3;
  transform: translateY(-3px);
}

/* Styling for Error message  */
.error-message {
  color: #e63946;
  margin-top: 1rem;
  font-size: 1.2rem;
}

/* Styling for Question button */
.question-btn {
  display: inline-block;
  margin-top: 1.5rem;
  margin-left: 1.25rem;
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}

.question-btn:hover {
  background-color: #0056b3;
  transform: translateY(-3px);
}

/* Question details container */
.question-details-container {
  color: #f0f0f0;
  text-align: center;
  margin: 2rem auto;
  max-width: 800px;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.question-details-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.question-box {
  background-color: #2c2c2c;
  border: 1px solid #444;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem auto;
  max-width: 800px;
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: left;
}

.question-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
}

/* Question text */
.question-box p {
  color: #e0e0e0;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.question-box strong {
  color: #ffffff;
}

/* Styling for Vote container */
.vote-container {
  display: flex;
  justify-content: space-between;
  width: 80px;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
}

.vote-icon {
  color: #007bff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, color 0.3s;
}

.vote-icon:hover {
  color: #0056b3;
  transform: scale(1.2);
}
.loading-message {
  font-size: 1.1rem;
  color: #b3b3b3;
  margin-top: 1rem;
}

</style>