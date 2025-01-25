<template>
  <!-- When searching -->

  <div v-if="isSearchActive">
    <h1>Showing Results for "{{ this.search }}"</h1>
    <div>
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
    <div v-if="error" class="error-message">{{ error }}</div> <!-- Show error here -->

    <div v-if="showLoadMore">
      <!-- Pagination -->
      <button class="load-more" @click="loadMore">Load More<span class="arrow">&#x25BC;</span> </button>
    </div>
  </div>
  <!-- If there is no search  -->

  <div v-if="!isSearchActive">
    <h1>Explore Events</h1>

    <!-- Most Popular Events  -->
    <section>
      <div class="section-header">
        <h2>Most Popular Events</h2>
        <router-link to="/ViewAll" class="view-all-button">View All</router-link>
      </div>
      <div class="events-container">
        <div v-for="event in mostPopularEvents" :key="event.event_id" class="event-box"
          @click="goToSingleEventDetails(event)">
          <p><strong>Title:</strong> {{ event.name }}</p>
          <p><strong>Location:</strong> {{ event.location }}</p>
          <p><strong>Description:</strong> {{ event.description }}</p>
          <p><strong>Start Date:</strong> {{ formatDate(event.start_date) }}</p>
          <p><strong>Close Registration:</strong> {{ formatDate(event.close_registration) }}</p>
          <p><strong>Max Attendees:</strong> {{ event.max_attendees }}</p>
        </div>
      </div>
    </section>

    <!-- Recently Added Events  -->
    <section>
      <div class="section-header">
        <h2>Recently Added Events</h2>
        <router-link to="/ViewAll" class="view-all-button">View All</router-link>
      </div>
      <div class="events-container">
        <div v-for="event in recentlyAddedEvents" :key="event.event_id" class="event-box"
          @click="goToSingleEventDetails(event)">
          <p><strong>Title:</strong> {{ event.name }}</p>
          <p><strong>Location:</strong> {{ event.location }}</p>
          <p><strong>Description:</strong> {{ event.description }}</p>
          <p><strong>Start Date:</strong> {{ formatDate(event.start_date) }}</p>
          <p><strong>Close Registration:</strong> {{ formatDate(event.close_registration) }}</p>
          <p><strong>Max Attendees:</strong> {{ event.max_attendees }}</p>
        </div>
      </div>
    </section>

    <!-- Error Message -->
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { eventService } from "../../services/event.service";

export default {
  data() {
    return {
      search: this.$route.query.search || '',
      mostPopularEvents: [],
      recentlyAddedEvents: [],
      events: [],
      loading: false,
      error: "",
      limit: 20,
      offset: 0,
      searchEventLength: 0,
      isSearchActive: false,
      showLoadMore: false,
    };
  },

  watch: {
    "$route.query.search": function (newSearchString) {
      this.search = newSearchString;
      this.handleRouteChange();
    },
  },

  mounted() {
    // Reset pagination values upon loading
    this.resetPagination();

    this.handleRouteChange();
  },
  beforeRouteUpdate(to, from, next) {
    this.search = to.query.search;
    this.handleRouteChange();
    next();
  },

  methods: {
    resetPagination() {
      // Reset to default limit
      this.limit = 20;
      // Reset to default offset
      this.offset = 0;
      // clear the events array
      this.events = [];
      this.showLoadMore = false;
    },
    // Change timestamp to local date
    formatDate(date_value) {
      if (!date_value) return "Invalid Date";
      try {
        return new Date(date_value).toLocaleDateString();
      } catch (error) {
        return "Error Formatting Date";
      }
    },

    handleRouteChange() {
      // Reset pagination every time route changes
      this.resetPagination();

      //In case search is active
      if (this.search) {
        this.isSearchActive = true;
        this.displaySearchEvents();
      } else {
        this.isSearchActive = false;
        this.getHomePageEvents();
      }
    },

    loadMore() {
      if (this.events.length >= this.totalNumberOfEvents || this.isSearchActive && this.events.length >= this.searchEventLength) {
        this.error = "No more events to load!";
        return;
      }
      this.offset += this.limit;
      this.displayAllEvents();
    },

    // Get default events for home page
    getHomePageEvents() {
      eventService
        .allEvents()
        .then((events) => {
          this.mostPopularEvents = events
            // Get top 6 events by their popularity
            .sort((a, b) => b.number_attending - a.number_attending)
            .slice(0, 6);

          this.recentlyAddedEvents = events
            // Get 6 recently added events using their event Id
            .sort((a, b) => b.event_id - a.event_id)
            .slice(0, 6);
        })
        .catch((error) => {
          this.error = error.message || "Error fetching events.";
        });
    },

    // Gets all events that are open for registration
    displaySearchEvents() {
      this.loading = true;
      this.error = "";
      this.status = 'OPEN'

      eventService
        .search_event(this.search, this.status, this.limit, this.offset)
        .then((events) => {
          console.log(events.length);
          this.searchEventLength = events.length;
          // Replace the existing events with new ones if offest is 0
          if (this.offset === 0) {
            this.events = events;
          } else {
            // Append for Load More
            this.events = this.events.concat(events);
          }

          // For pagination
          if (this.isSearchActive && this.events.length < this.searchEventLength) {
            this.showLoadMore = true;
          } else if (!this.isSearchActive && this.events.length < this.totalNumberOfEvents) {
            this.showLoadMore = false;
          }
          this.loading = false;
        })
        .catch((error) => {
          this.error = error.message || "Error fetching events";
          this.loading = false;
        });
    },

    goToSingleEventDetails(event) {
      this.$router.push({ path: `/event/${event.event_id}` });
    },
  },
};
</script>



<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2rem 0 1rem;
}

.section-header h2 {
  padding-right: 1rem;
  margin-left: 20px;
}

.view-all-button {
  color: #ffffff;
  background-color: #1e1e1e;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.view-all-button:hover {
  background-color: #ffffff;
  color: #1e1e1e;
}

/* Styling for event box container */
.events-container {
  display: grid;
  /* Makes Three equal columns */
  grid-template-columns: repeat(3, 1fr);
  padding: 1rem;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.event-box {
  border: 1px solid #333333;
  border-radius: 8px;
  background-color: #1e1e1e;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.event-box:hover {
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
  transform: translateY(-10px);
}

.event-box p {
  font-size: 1.1rem;
  color: #D3D3D3;
  margin-bottom: 0.5rem;
}

.event-box strong {
  font-weight: bold;
  color: #D3D3D3;
}

/* Styling for "Load More" button */
.load-more {
  display: block;
  background-color: transparent;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  width: 100%;
  margin: 1.5rem 0;
  padding: 1rem;
  text-align: center;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  text-transform: uppercase;
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

/* Error message styling */
.error-message {
  color: #ffffff;
  font-size: 1.2rem;
  text-align: center;
  margin: 1rem 0;
}

/* Responsive design for smaller screens */
@media (max-width: 1024px) {
  .events-container {
    gap: 1.5rem;
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .event-box {
    padding: 1rem;
  }

  .event-box p {
    font-size: 1rem;
  }
}
</style>
