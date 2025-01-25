<template>
    <div>
        <div v-if="selectedFilter === 'MY_EVENTS'">
            <h1>MY EVENTS</h1>
        </div>
        <div v-else-if="selectedFilter === 'ATTENDING'">
            <h1>EVENTS ATTENDING</h1>
        </div>
        <div v-else-if="selectedFilter === 'EVENT_DRAFTS'">
            <h1>SAVED EVENT DRAFTS</h1>
        </div>
        <div v-else-if="selectedFilter === 'QUESTION_DRAFTS'">
            <h1>SAVED QUESTION DRAFTS</h1>
        </div>

        <!-- Filter Container  -->
        <div class="filter-container">
            <button @click="toggleFilterMenu" class="filterButton">
                Filter
            </button>

            <!-- Filter Dropdown Menu -->
            <div v-if="isFilterMenuVisible" class="filterDropdown">
                <ul>
                    <li>
                        <input type="radio" id="eventDrafts" v-model="selectedFilter" value="EVENT_DRAFTS"
                            @change="applyFilter" />
                        <label for="myEvents">My Event Drafts</label>
                    </li>

                    <li>
                        <input type="radio" id="myEvents" v-model="selectedFilter" value="MY_EVENTS"
                            @change="applyFilter" />
                        <label for="myEvents">My Events</label>
                    </li>
                    <li>
                        <input type="radio" id="attending" v-model="selectedFilter" value="ATTENDING"
                            @change="applyFilter" />
                        <label for="attending">Attending</label>
                    </li>

                    <li>
                        <input type="radio" id="questionDrafts" v-model="selectedFilter" value="QUESTION_DRAFTS"
                            @change="applyFilter" />
                        <label for="questionDrafts">My Question Drafts</label>
                    </li>


                    <li>
                        <button @click="clearFilter" class="clearFilterButton">Clear Filter</button>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Loading message -->
        <em v-if="loading">Loading events...</em>

        <!-- Error State -->
        <div v-if="error">{{ error }}</div>

        <!-- Event Display -->
        <div v-else>
            <div class="events-container">
                <div v-for="event in events" :key="event.event_id || event.eventDraftId || event.eventID"
                    class="event-box">
                    <!-- Display for event and event drafts -->
                    <div v-if="event.event_id || event.eventDraftId" @click="goToSingleEventDetails(event)">
                        <p><strong>Title:</strong> {{ event.name }}</p>
                        <p><strong>Location:</strong> {{ event.location }}</p>
                        <p><strong>Description:</strong> {{ event.description }}</p>
                        <p><strong>Start Date:</strong> {{ formatDate(event.start_date) }}</p>
                        <p><strong>Close Registration:</strong>{{ formatDate(event.close_registration) }}</p>
                        <p><strong>Max Attendees:</strong> {{ event.max_attendees }}</p>

                    </div>
                    <!-- Question drafts -->
                    <p v-else-if="!event.name && !event.location && !event.event_id && event.eventId"
                        @click="gotToAskQuestion(event)">
                        <span><strong>Question:</strong> {{ event.question || "No Question Available" }}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Load More Button -->
        <div v-if="showLoadMore">
            <button class="load-more" @click="loadMore">Load More<span class="arrow">&#x25BC;</span> </button>
        </div>
    </div>
</template>


<script>
import { eventService } from "../../services/event.service";
import { authService } from "@/services/auth.service";

export default {
    data() {
        return {
            search: "", // Query from the route
            events: [],
            loading: false,
            error: "",
            isFilterMenuVisible: false, // Track visibility of the filter menu
            selectedFilter: "MY_EVENTS",
            myEvents: "MY_EVENTS", // Value for "My Events" filter
            attending: "ATTENDING", // Value for "Attending" filter
            eventDrafts: "EVENT_DRAFTS",
            questiionDrafts: "QUESTIONDRAFTS",
            eventDraft: false,
            limit: 20, // Limit for event display
            offset: 0, // Offset for pagination
            showLoadMore: false,
        };
    },

    mounted() {
        this.applyFilter();
        this.resetPagination();
    },

    methods: {
        resetPagination() {
            // Reset to default limit
            this.limit = 20;
            // Reset to default offset
            this.offset = 0;
            // Clear the events arrat
            this.events = [];
        },

        toggleFilterMenu() {
            this.isFilterMenuVisible = !this.isFilterMenuVisible;
        },
        //Apply the selected filters
        applyFilter() {
            this.resetPagination();
            this.searchEvents(this.selectedFilter);
        },

        // Clear the selected filter and load My events as default
        clearFilter() {
            this.selectedFilter = "MY_EVENTS";
            this.resetPagination();
            this.searchEvents();
        },

        // Format to change the timestamp to local date
        formatDate(date_value) {
            if (!date_value) return "Invalid Date";
            try {
                const date = new Date(date_value).toLocaleDateString();
                return date;
            } catch (error) {
                return "Error Formatting Date";
            }
        },

        // Search events specified by the conditions
        searchEvents(status) {
            this.loading = true;
            this.error = "";
            // In case the filter is event drafts
            if (status === 'EVENT_DRAFTS') {
                const eventDrafts = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const draftKey = `eventDraft ${i}`;
                    const draftData = localStorage.getItem(draftKey);

                    if (draftData) {
                        try {
                            const parsedDraft = JSON.parse(draftData);
                            eventDrafts.push({ ...parsedDraft, draftKey });

                        } catch (error) {
                            console.error(`Failed to parse draft: ${draftKey}`, error);
                        }
                    }
                }

                this.events = eventDrafts;
                this.showLoadMore = false;
                this.loading = false;

                if (eventDrafts.length === 0) {
                    this.error = "No Event Drafts Found.";
                }
                return;
            }
            // In case the filter is question drafts
            else if (status === 'QUESTION_DRAFTS') {
                const questionDrafts = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const draftKey = `questionDraft ${i}`;
                    const draftData = localStorage.getItem(draftKey);

                    if (draftData) {
                        try {
                            const parsedDraft = JSON.parse(draftData);
                            questionDrafts.push({ ...parsedDraft, draftKey });
                        } catch (error) {
                            console.error(`Failed to parse draft: ${draftKey}`, error);
                        }
                    }
                }

                this.events = questionDrafts;
                this.showLoadMore = false;
                this.loading = false;

                if (questionDrafts.length === 0) {
                    this.error = "No Question Drafts Found.";
                }
                return;
            }

            // Fetch events baed on conditons 
            const token = authService.getSessionToken();
            eventService
                .search_event(this.search, status, this.limit, this.offset, token)
                .then((response) => {
                    if (response.length === 0) {
                        this.error = "No Events Found.";
                    } else {
                        if (this.offset === 0) {
                            this.events = response;
                        } else {
                            this.events = this.events.concat(response);
                        }
                        this.error = "";
                    }

                    this.showLoadMore = response.length === this.limit;
                    this.loading = false;
                })
                .catch((error) => {
                    this.error = error.message || "Error searching events";
                    this.loading = false;
                });
        },

        goToSingleEventDetails(event) {
            if (event.event_id) {
                this.$router.push({ path: `/event/${event.event_id}` });
            } else if (event.eventDraftId) {
                // Pass the query for event draft Id 
                this.$router.push({ path: `/events`, query: { eventDraftId: event.eventDraftId } });
            } else {
                console.warn("Error navigating.");
            }
        },
        gotToAskQuestion(questionDetails) {
            console.log(questionDetails);
            if (questionDetails.eventId) {
                // Pass the query for question draft Id
                this.$router.push({
                    path: `/event/${questionDetails.eventId}/question`,
                    query: {
                        draftId: questionDetails.draftKey
                    }
                });
            } else {
                console.warn("Cannot navigate to details for question drafts without an event Id");
            };

        },

        loadMore() {
            this.offset += this.limit;
            this.searchEvents(this.selectedFilter);
        }
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

/* Styling for Event Box */
.event-box {
    background-color: #1e1e1e;
    border: 1px solid #333333;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    padding: 1.5rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.events-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    /* Two columns */
    gap: 2rem;
    margin: 0 auto;
    max-width: 1200px;
}



.event-box:hover {
    box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
    transform: translateY(-5px);
}

/* Styling for event box */
.event-box p {
    font-size: 1.1rem;
    color: #D3D3D3;
    margin-bottom: 0.5rem;
}

.event-box strong {
    font-weight: bold;
    color: #D3D3D3;
}

/* Filter Container */
.filter-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
    margin-left: 90%;
}

/* Filter Button */
.filterButton {
    background-color: #007bff;
    color: white;
    border: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.filterButton:hover {
    background-color: #0056b3;
}

/* Styling for filter Dropdown Menu */
.filterDropdown {
    position: absolute;
    background-color: #1e1e1e;
    border: 1px solid #333333;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    padding: 0.5rem;
    width: 150px;
    z-index: 10;
}

.filterDropdown ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.filterDropdown li {
    margin-bottom: 0.5rem;
}

.filterDropdown li:last-child {
    margin-bottom: 0;
}

.filterDropdown label {
    margin-left: 0.5rem;
    font-size: 0.9rem;
    color: #e0e0e0;
}

/* Clear Filter Button */
.clearFilterButton {
    background-color: #ff4d4f;
    color: white;
    border: none;
    width: 100%;
    font-size: 0.9rem;
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.3s;
}

.clearFilterButton:hover {
    background-color: #d9363e;
}

/* Style for Load More button */
.load-more {
    display: block;
    color: #ffffff;
    background-color: black;
    width: 100%;
    padding: 1rem;
    margin: 1.5rem 0;
    text-align: center;
    border: none;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
}

.load-more:hover {
    color: #1e1e1e;
    background-color: #ffffff;
    box-shadow: 0 6px 12px rgba(255, 255, 255, 0.3);
}

.load-more:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* Styling for error message */
div[v-if="error"] {
    color: #e57373;
    font-size: 1.2rem;
    text-align: center;
    margin-top: 1rem;
}

/*Responsive style for smaller screens */
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

    .filter-container {
        margin-left: 75%;
    }

}
</style>