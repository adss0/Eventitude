<template>
  <div>
    <h1>Create New Event</h1>
    <form @submit.prevent="handleSubmit" class="formBox">
      <!-- Name Field -->
      <div>
        <label for="name" class="formLabel">Event Name:</label>
        <input id="name" name="name" v-model="name" class="formInput" required />
      </div>

      <!-- Description Field -->
      <div>
        <label for="description" class="formLabel">Description:</label>
        <textarea id="description" name="description" v-model="description" class="formInput" required></textarea>
      </div>

      <!-- Location Field -->
      <div>
        <label for="location" class="formLabel">Location:</label>
        <input id="location" name="location" v-model="location" class="formInput" required />
      </div>

      <!-- Start Time Field -->
      <div>
        <label for="startRegistration" class="formLabel">Event Start Time:</label>
        <input id="startRegistration" name="startRegistration" type="datetime-local" v-model="startRegistration"
          class="formInput" required />
      </div>

      <!-- Close Registration Field -->
      <div>
        <label for="closeRegistration" class="formLabel">Close Registration:</label>
        <input id="closeRegistration" name="closeRegistration" type="datetime-local" v-model="closeRegistration"
          class="formInput" required />
      </div>

      <!-- Max Attendees Field -->
      <div>
        <label for="max_attendees" class="formLabel">Maximum Attendees:</label>
        <input id="max_attendees" name="max_attendees" type="number" v-model.number="max_attendees" class="formInput"
          required />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="SaveButton">Create Event</button>

      <div class="or-divider">
        <hr>
        <span>OR</span>
        <hr>
      </div>
            <!-- Delete Draft Button -->

      <button v-if="draftExists" class="deleteDraftButton" @click.prevent="deleteDraft">Delete Draft</button>
            <!-- Save Draft Button -->

      <button v-else-if="!draftExists" class="saveDraftButton" @click.prevent="saveDraft">Create Draft</button>

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
      fields: [
        'name',
        'description',
        'location',
        'startRegistration',
        'closeRegistration',
        'max_attendees'
      ],
      name: "",
      description: "",
      location: "",
      startRegistration: "",
      closeRegistration: "",
      max_attendees: "",
      error: "",
      draftId: 0,
      accessedDraftId: 0,
      draftExists: false,
    };
  },
  // When the page loads
  mounted() {

    //Get the draft Datausing the draft ID from the query 

    this.accessedDraftId = this.$route.query.eventDraftId || "";
    let draftData = localStorage.getItem("eventDraft " + this.accessedDraftId);
    console.log(draftData);

    // In case Draft exists
    if (draftData) {
      this.draftExists = true;
      const parsedDraft = JSON.parse(draftData);

      // Loop through to get the data from the draft 
      this.fields.forEach((field) => {
        if (field === 'startRegistration') {
          this[field] = new Date(parsedDraft.start_date * 1000).toISOString().slice(0, 16);
        }
        else if (field === 'closeRegistration') {
          this[field] = new Date(parsedDraft.close_registration * 1000).toISOString().slice(0, 16);
        }
        else {
          this[field] = parsedDraft[field];
        }
      });
    } else {
      //In case draft does not exist
      this.draftExists = false;
      this.$router.replace({ query: {} });
      this.resetForm();
    }
  },
  methods: {
    saveDraft() {
      const { name, description, location, startRegistration, closeRegistration, max_attendees } = this;

      // Validate all fields making sure they are not empty
      if (!(name.trim() && description.trim() && location.trim() && startRegistration.trim() && closeRegistration.trim() && max_attendees)) {
        this.error = "All fields are required and cannot be empty or just spaces.";
        return;
      }
      // Convert to Unix timestamp (seconds)
      const start = Math.floor(new Date(this.startRegistration).getTime() / 1000); 
      const close_registration = Math.floor(new Date(this.closeRegistration).getTime() / 1000); 

      // Validate timestamp fields
      const currentTimestamp = Math.floor(Date.now() / 1000); 
      if (start <= currentTimestamp) {
        this.error = "Start time must be in the future.";
        return;
      }

      // Validate Close Registration
      if (close_registration >= start) {
        this.error = "Close registration must be before the start date.";
        return;
      }

      // Validate max attendees
      if (max_attendees <= 0) {
        this.error = "Maximum attendees must be a positive number.";
        return;
      }

      // Increment draft ID
      this.draftId += 1;

      // Prepare the data to save as a draft
      const eventDraftData = {
        name,
        description,
        location,
        start_date: start,
        close_registration,
        max_attendees,
        eventDraftId: this.draftId
      };

      // Store the draft in localStorage with the unique key
      localStorage.setItem("eventDraft " + this.draftId, JSON.stringify(eventDraftData));

      alert("Event draft saved successfully!");
      this.resetForm();
      return;
    },
    handleSubmit() {
      const { name, description, location, startRegistration, closeRegistration, max_attendees } = this;

      // Validate all fields making sure they are not empty
      if (!(name.trim() && description.trim() && location.trim() && startRegistration.trim() && closeRegistration.trim() && max_attendees)) {
        this.error = "All fields are required and cannot be empty or just spaces.";
        return;
      }
      // Convert to Unix timestamp 
      const start = new Date(this.startRegistration).getTime().toString();
      const close_registration = new Date(this.closeRegistration).getTime().toString();

      // Validate timestamp fields
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (start <= currentTimestamp) {
        this.error = "Start date must be after the event is closed for registration.";
        return;
      }

  // Validate Close Registration
      if (close_registration >= start) {
        this.error = "Close registration must be before the event start date.";
        return;
      }

      // Validate max attendees 
      if (max_attendees <= 0) {
        this.error = "Maximum attendees must be a positive number.";
        return;
      }

      // Event data to send to the API
      const eventData = { name, description, location, start, close_registration, max_attendees };

      // Get the session token for authentication
      const token = authService.getSessionToken();
      eventService
        .create_new_event(eventData, token)
        .then(() => {
          alert("Event created successfully!");
          
          
      if (this.accessedDraftId) {
        localStorage.removeItem("eventDraft " + this.accessedDraftId);
      }

           this.resetForm();
        })
        .catch((error) => {
          console.error("Error creating event:", error);
          this.error = error.message || "Error creating the event.";
        });
    },
    // Reset the event form after each submission
    resetForm() {
      this.fields.forEach((field) => {
        this[field] = "";
      });
      this.error = '';
    },
    // Delete Draft
    deleteDraft() {
      if (!this.accessedDraftId) {
        this.error = "No draft to delete.";
        return;
      }
      // Remove the draft from localStorage
      localStorage.removeItem("eventDraft " + this.accessedDraftId);

      // Remove query parameters from the URL
      this.$router.replace({ query: {} });
      this.draftExists = false;

      alert("Draft deleted successfully!");

      // Reset form and error
      this.resetForm();
      return;
    },
  },
};
</script>

<style scoped>
/* Style for event form */
.formBox {
  background-color: #121212;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem auto;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.formBox:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
  transform: translateY(-5px);
}

.formLabel {
  display: block;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

/* Style for form input */
.formInput {

  background-color: #1e1e1e;
  color: #ffffff;
  border: 1px solid #555;
  width: 94%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}

.formInput:focus {
  border-color: #007bff;
  outline: none;
}

/* Style for the creating Draft button  */
.SaveButton {
  background-color: #007bff;
  color: #ffffff;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.SaveButton:hover {
  background-color: #0056b3;
}

/*Style for saving Draft button */
.saveDraftButton {
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;

}

.saveDraftButton:hover {
  background-color: #218838;
}
/*Style for delete draft button */
.deleteDraftButton {
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  background-color: #e63946;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;

}

.deleteDraftButton:hover {
  background-color: #d32f2f;
}

/*Style for or divider */
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

/* Error message */
.errorMessage {
  color: #e63946;
  padding-top: 0.4rem;
  font-size: 0.9rem;
  text-align: center;
}
/*Responsive design for smaller screens*/
@media (max-width: 1024px) {
  .formBox {
    padding: 1rem;
    width: 95%; 
  }

  .formLabel {
    font-size: 0.9rem;
  }
  .SaveButton,
  .saveDraftButton,
  .deleteDraftButton {
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
