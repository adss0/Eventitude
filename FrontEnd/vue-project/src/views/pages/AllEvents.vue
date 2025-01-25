<template>
  <div>
    <h1>Viewing All Events</h1>

    <div>
      <!-- Event Details -->
      <div class="events-container">
        <div v-for="event in events" :key="event.event_id" class="event-box" @click="goToSingleEventDetails(event)">
          <p><strong>Title:</strong> {{ event.name }}</p>
          <p><strong>Location:</strong> {{ event.location }}</p>
          <p><strong>Description:</strong> {{ event.description }}</p>
          <p><strong>Start Date:</strong> {{ formatDate(event.start_date) }}</p>
          <p><strong>Close Registration:</strong> {{ formatDate(event.close_registration) }}</p>
          <p><strong>Max Attendees:</strong> {{ event.max_attendees }}</p>
        </div>
      </div>
    </div>
    <!-- To display an error -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="showLoadMore">
      <!-- Pagination -->
      <button class="load-more" @click="loadMore">LOAD MORE<span class="arrow">&#x25BC;</span> </button>
    </div>
  </div>
</template>

<script>
import { eventService } from "../../services/event.service";
import { authService } from "@/services/auth.service";

export default {
  data() {
    return {
      events: [],
      loading: false,
      error: "",
      limit: 20,
      offset: 0,
      showLoadMore: false,
    };
  },

  mounted() {
    // Handle events on mount
    this.handleRouteChange();
  },
  beforeRouteUpdate(to, from, next) {
    this.handleRouteChange();
    next();
  },

  methods: {
    handleRouteChange() {
      this.resetPagination();
      this.displayAllEvents();
    },

    resetPagination() {
      //Reset to default limt
      this.limit = 20;
      // Reset to default offset
      this.offset = 0;
      // Clear the events array
      this.events = [];
      this.showLoadMore = false;
    },
    //Change a date from unix Time stamp to local Date
    formatDate(date_value) {
      if (!date_value) return "Invalid Date";
      try {
        const date = new Date(date_value).toLocaleDateString();
        return date;
      } catch (error) {
        return "Error Formatting Date";
      }
    },

    // To increase the number of events and implement pagination
    loadMore() {
      this.offset += this.limit;
      this.displayAllEvents();
    },

    // Gets all the events
    displayAllEvents() {
      this.loading = true;
      this.error = "";
      const token = authService.getSessionToken();

      //Status set to OPEN to retrieve events availabel events for registration
      const status = 'OPEN';


      eventService
        .search_event("", status, this.limit, this.offset, token)
        .then((events) => {
          // In case no more events are retrieved
          if (events.length === 0) {
            // Set the error message
            this.error = "No more events to load.";
            this.loading = false;
            //Hide the load more button
            this.showLoadMore = false;
            return;
          }

          if (this.offset === 0) {
            this.events = events;
          } else {
            // Append to Load More
            this.events = this.events.concat(events);
          }
          this.showLoadMore = events.length > 0;
          this.loading = false;
        })
        .catch((error) => {
          this.error = error.message || "Error fetching events";
          this.loading = false;
        });
    },
    // Navigate to a different page
    goToSingleEventDetails(event) {
      this.$router.push({ path: `/event/${event.event_id}` });
    },
  },
};
</script>

<style scoped>
em {
  display: block;
  text-align: center;
  font-size: 1.2rem;
  color: #b3b3b3;
}

/*Style for event container */
.events-container {
  display: grid;
  /* Two equal columns */
  grid-template-columns: repeat(2, 1fr);
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
  padding: 1rem;
}

.event-box {
  background-color: #1e1e1e;
  border: 1px solid #333333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.event-box:hover {
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
  transform: translateY(-10px);
}

/*Style for paragraph */
.event-box p {
  font-size: 1.1rem;
  color: #D3D3D3;
  margin-bottom: 0.5rem;
}

.event-box strong {
  font-weight: bold;
  color: #D3D3D3;
}

/* Style for Load More */
.load-more {
  background-color: transparent;
  display: block;
  width: 100%;
  text-align: center;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.load-more:hover {
  background-color: #ffffff;
  color: #1e1e1e;
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.3);
}

.load-more:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/**Style for error messages */
.error-message {
  color: #ffffff;
  font-size: 1.2rem;
  text-align: center;
  margin: 1rem 0;
}

/*Responsice design */
@media (max-width: 1024px) {
  .events-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .event-box {
    padding: 1rem;
  }

  .event-box p {
    font-size: 1rem;
  }

  .load-more {
    font-size: 1rem;
    padding: 0.8rem;
  }
}
</style>