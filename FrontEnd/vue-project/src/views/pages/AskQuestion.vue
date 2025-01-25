<template>
    <div>
        <h1>Ask a Question</h1>
        <!-- Question form -->
        <form @submit.prevent="handleSubmit" class="formBox">
            <div>
                <div v-if="accessedDraftId">
                    <label for="question" class="formLabel">Your Question Draft:</label>
                </div>
                <div v-else-if="!accessedDraftId">
                    <label for="question" class="formLabel">Your Question:</label>
                </div>
                <input id="question" name="question" v-model="question" class="formInput" required />
            </div>

            <button class="SaveButton">Publish</button>
            <div class="or-divider">
                <hr>
                <span>OR</span>
                <hr>
            </div>
            <!-- Delete Button -->
            <button v-if="draftExists" class="deleteDraftButton" @click.prevent="deleteDraft">Delete
                Draft</button>
            <!-- Save Button -->
            <button v-else-if="!draftExists" class="saveDraftButton" @click.prevent="saveDraft">Save
                Draft</button>
            <!-- Error Message -->

            <div class="SaveErrorMessage" v-if="error">{{ error }}</div>
        </form>
    </div>
</template>

<script>
import { questionService } from '@/services/question.service';
import { authService } from '@/services/auth.service';
export default {
    data() {
        return {
            question: "",
            submitted: false,
            error: "",
            draftId: 0,
            draftInformation: "",
            accessedDraftId: 0,
            draftExists: false,
        };
    },
    mounted() {

        this.accessedDraftId = this.$route.query.draftId || "";
        let draftData = localStorage.getItem(this.accessedDraftId);

        // Check if there is any data retrieved
        if (draftData) {
            this.draftExists = true;
            // Parse the data into an object
            let parsedData = JSON.parse(draftData);
            // Get the question part
            this.question = parsedData.question || "";
        } else {
            // Replace the query
            this.$router.replace({ query: {} });
            // In case where no data was found
            this.draftExists = false;
            this.question = "";
        }
    },

    methods: {
        saveDraft() {
            this.submitted = false;

            const eventId = this.$route.params.event_id;

            const questionData = {
                // The question text entered by the user
                question: this.question,
                eventId
            };
            // In case the Question is empty
            if (questionData.question.trim() === "") {
                this.error = "The field cannot be empty or just spaces.";
                return;
            }

            this.draftId = this.draftId + 1;

            // Store the draft in localStorage
            localStorage.setItem("questionDraft " + this.draftId, JSON.stringify(questionData));

            this.question = "";
            alert("Question draft saved successfully!");
            return;
        },
        deleteDraft() {
            this.submitted = false;
            this.draftExists = false;

            // Remove the item from local Storage
            localStorage.removeItem(this.accessedDraftId);

            // Replace the query
            this.$router.replace({ query: {} });
            this.question = "",
                this.accessedDraftId = "",
                alert("Question draft deleted successfully!");
            return;
        },
        async handleSubmit() {
            this.submitted = true;
            // Get the event ID from the route
            const eventId = this.$route.params.event_id;
            // Get the authentication token
            const token = authService.getSessionToken();

            const questionData = {
                // The question text entered by the user
                question: this.question,
            };
            // In case the Question is empty

            if (questionData.question.trim() === "") {
                this.error = "The field cannot be empty or just spaces.";
                return;
            }

            try {
                const response = await questionService.ask_question(eventId, questionData, token);
                console.log("Question created:", response);
                alert("Question submitted successfully!");

                if (this.accessedDraftId) {
                    localStorage.removeItem(this.accessedDraftId);
                };

                // Redirect
                this.$router.push({ path: `/event/${eventId}` });
            } catch (error) {
                console.error("Error:", error);
                this.error = error.message || "You must be registered to the event ask a question";
            }
        },

    },
};
</script>

<style scoped>
/* Style for form box */
.formBox {
    background-color: #121212;
    padding: 1.5rem;
    margin: 1rem auto;
    max-width: 600px;
    border: 1px solid #333;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.formBox:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
    transform: translateY(-5px);
}

.formLabel {
    display: block;
    color: #ffffff;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
}

.formInput {
    color: #ffffff;
    border-radius: 4px;
    margin-bottom: 1rem;
    width: 94%;
    padding: 1rem;
    font-size: 1rem;
    border: 1px solid #555;
    background-color: #1e1e1e;
    transition: border-color 0.3s;
}

.formInput:focus {
    border-color: #007bff;
    outline: none;
}

/* Style for Save button */
.SaveButton {
    color: #ffffff;
    background-color: #007bff;
    border: none;
    padding: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
}

.SaveButton:hover {
    background-color: #0056b3;
}

/* Style for Save Draft button */
.saveDraftButton {
    color: #ffffff;
    background-color: #28a745;
    border: none;
    padding: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;

}

.saveDraftButton:hover {
    background-color: #218838;
}

/* Style for Delete Draft Button */
.deleteDraftButton {
    padding: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffffff;
    background-color: #e63946;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;

}

.deleteDraftButton:hover {
    background-color: #d32f2f;
}

/** Style for the or divider */
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

/* Style for the Error message */
.SaveErrorMessage {
    color: #e63946;
    /* Red for error messages */
    padding-top: 0.4rem;
    font-size: 0.9rem;
    text-align: center;
}

/* Responsive design */
@media (max-width: 1024px) {
    .formBox {
        padding: 1rem;
        width: 95%;
    }

    .formLabel {
        font-size: 0.9rem;
    }

    .formInput {
        padding: 0.8rem;
        font-size: 0.9rem;
    }

    .saveDraftButton,
    .SaveButton,
    .deleteDraftButton {
        font-size: 1rem;
        padding: 0.8rem;
    }

    .or-divider span {
        font-size: 12px;
    }
}
</style>