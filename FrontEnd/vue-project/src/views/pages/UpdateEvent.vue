<template>
  <div>
    <h1>Update Event</h1>
    <form @submit.prevent="handleSubmit" class="formBox">
      <div>
        <label for="name" class="formLabel">Event Name:</label>
        <input id="name" name="name" v-model="name" class="formInput" required />
      </div>

      <div>
        <label for="description" class="formLabel">Description:</label>
        <textarea id="description" name="description" v-model="description" class="formInput" required></textarea>
      </div>

      <div>
        <label for="location" class="formLabel">Location:</label>
        <input id="location" name="location" v-model="location" class="formInput" required />
      </div>

      <div>
        <label for="start" class="formLabel">Event Start Time (Unix Timestamp):</label>
        <input id="start" name="start" type="number" v-model.number="start" class="formInput" required />
      </div>

      <div>
        <label for="close_registration" class="formLabel">Close Registration (Unix Timestamp):</label>
        <input id="close_registration" name="close_registration" type="number" v-model.number="close_registration"
          class="formInput" required />
      </div>

      <div>
        <label for="max_attendees" class="formLabel">Maximum Attendees:</label>
        <input id="max_attendees" name="max_attendees" type="number" v-model.number="max_attendees" class="formInput"
          required />
      </div>

      <!-- Update Button -->
      <button type="submit" class="SaveButton">Update Event</button>

      <!-- Separator between Update and Delete buttons -->
      <div class="or-divider">
        <hr>
        <span>OR</span>
        <hr>
      </div>

      <!-- Delete Event Button -->
      <div class="forDeleting">
        <button class="DeleteButton" @click.prevent="deleteEvent">Delete Event</button>
      </div>
      <!-- Error Message -->
      <div v-if="error" class="errorMessage">{{ error }}</div>
    </form>

  </div>
</template>

<script>
import { authService } from "@/services/auth.service";
import { eventService } from "@/services/event.service";

export default {
  data() {
    return {
      name: "",
      description: "",
      location: "",
      start: null,
      close_registration: null,
      max_attendees: null,
      error: "",
    };
  },
  created() {
    this.fetchEventDetails();
  },
  methods: {
    // Fetch event details using the event ID passed as a route parameter
    fetchEventDetails() {
      const eventId = this.$route.params.event_id;
      //get the event details
      eventService
        .single_event_details(eventId)
        .then((event) => {
          // pre Fill the event container with the event information
          this.name = event.name;
          this.description = event.description;
          this.location = event.location;
          this.start = event.start;
          this.close_registration = event.close_registration;
          this.max_attendees = event.max_attendees;
        })
        .catch((error) => {
          this.error = error.message || "Error fetching event details";
        });
    },

    
    //Delete a event
    deleteEvent() {
      const token = authService.getSessionToken();
      //get the event ID from the route params
      const eventId = this.$route.params.event_id;

      eventService.delete_event(eventId, token)
        .then(() => {
          alert("Event successfully deleted!");
          //Redirect to home page
          this.$router.push({ path: "/Home" });
        })
        .catch((error) => {
          console.error("Error deleting event:", error);
          this.error = error.message || "Error deleting the event.";
        });
    },

    // Handle form submission
    handleSubmit() {
      const { name, description, location, start, close_registration, max_attendees } = this;

      // Validate all fields are filled
      if (!(name && description && location && start && close_registration && max_attendees)) {
        this.error = "All fields are required.";
        return;
      }

      // Validate timestamp fields
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (start <= currentTimestamp) {
        this.error = "Start time must be in the future.";
        return;
      }

      if (close_registration >= start) {
        this.error = "Close registration must be before the start time.";
        return;
      }

      // Validate positive integers
      if (max_attendees <= 0) {
        this.error = "Maximum attendees must be a positive number.";
        return;
      }

      // Prepare event data
      const eventData = { name, description, location, start, close_registration, max_attendees };
      const token = authService.getSessionToken();
      const eventId = this.$route.params.event_id; // Get event ID from URL

      // Call the API to update the event
      eventService
        .update_event(eventData, eventId, token)
        .then(() => {
          alert("Event successfully updated!");
          this.$router.push({ path: "/Home" });
        })
        .catch((error) => {
          console.error("Error updating event:", error);
          this.error = error.message || "Error updating the event.";
        });
    },

  },
};
</script>

<style scoped>
/* Styling for form box*/
.formBox {
  background-color: #121212;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
  border: 1px solid #333;
  margin: 1rem auto;
  max-width: 600px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.formBox:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
  transform: translateY(-5px);
}

.formLabel {
  display: block;
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.formInput {
  width: 94%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #555;
  background-color: #1e1e1e;
  color: #ffffff;
  border-radius: 4px;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}

.formInput:focus {
  border-color: #007bff;
  outline: none;
}

/* Styling for save Button */
.SaveButton {
  padding: 1rem;
  color: #ffffff;
  background-color: #007bff;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
  width: 100%;
}


/* Styling for update Button */
.UpdateButton:hover {
  background-color: #0056b3;
}

 /* Styling or divider*/
.or-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.or-divider hr {
  flex: 1;
  border: none;
  border-top: 1px solid #ccc;
  margin: 0 10px;
}

.or-divider span {
  padding: 0 10px;
  color: #666;
  font-weight: bold;
  font-size: 14px;
}

/* Styling for delete Button */
.DeleteButton {
  background-color: #e63946;
  padding: 1rem;
  font-weight: bold;
  color: #ffffff;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.DeleteButton:hover {
  background-color: #d32f2f;
}

.errorMessage {
  color: #e63946;
  padding-top: 0.4rem;
  font-size: 0.9rem;
  text-align: center;
}

/**Responsive design for smaller screens */
@media (max-width: 1024px) {
  .formBox {
    padding: 1rem;
    width: 95%;
  }

  .formLabel {
    font-size: 0.9rem;
  }
  .SaveButton,
  .DeleteButton {
    font-size: 1rem;
    padding: 0.8rem;
  }

  .formInput {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .or-divider span {
    font-size: 12px;
  }
}
</style>
