const Joi = require("joi");
const questions = require("../models/question.server.models");
const events =require("../models/event.server.models")
const filter = require('leo-profanity');

// Ask a question for an event.
const ask_question = (req, res) => {

    // Get the event Id from the params
    const event_id = req.params.event_id;
    const user_id = req.user_id;     
    
    // Check if the user is registered for the event
    events.checkIfRegistered(event_id, user_id, (err, isRegistered) => {
        if (err) {
            return res.sendStatus(500);
        }
        // If user is not registered, send a 403(Unauthorized error)
        if (!isRegistered) {
            return res.status(403).send({ error_message: "User is not registered for this event" });
        }

        //validate the entered question details 
        const schema = Joi.object({
            question: Joi.string().required(),
        });
        req.body.question = filter.clean(req.body.question);

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error_message: error.details[0].message });

        // Insert the question into the database
        questions.insertQuestion(req.body,event_id, user_id, (err, question_id) => {
            if (err) {
                console.error("Error inserting question:", err);
                return res.sendStatus(500); 
            }
            //Send back the new generated question Id
            return res.status(201).send({ question_id: question_id });
        });
    });
};

// Delete a Question from an event. 
const delete_question = (req, res) => {
    // Get the user Id and question Id from the params
    const user_id = req.user_id;
    const question_id = req.params.question_id; 
    
    // Check if the question even exists 
    questions.getQuestionEventDetails(question_id, (err, result) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        // If question does not exist send 404(Unauthorized)
        if (!result) {
            return res.sendStatus(404);
        }
        
        // If the user is not the author of the question, return a 403
        if ( user_id !== result.asked_by &&  user_id !== result.creator_id) {
            return res.sendStatus(403);
        }

        // Delete the question 
        questions.deleteQuestion(question_id, (err) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            console.log("Successfully deleted the question");
            //Send a 200 status
            return res.sendStatus(200);
        });
    });
};

// Upvote a question
const upvote_question = (req, res) => {
    
    // Get the user Id and question Id from the params
    const user_id = req.user_id;  
    const question_id = req.params.question_id;

    // Check if the question exists
    questions.getQuestionEventDetails(question_id, (err, result) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500); 
        }
        // If the question doesnot exist, send 404(Unauthorized)
        if (!result) {
            return res.sendStatus(404); 
        }

        // Upvote a question
        questions.upVote(question_id, user_id, (err, vote) => {
            console.log(vote);
            if (err) return res.sendStatus(500); 

            // If user has already voted 
            if (vote.alreadyVoted) {
                console.log("User already voted:", user_id, "for question:", question_id);
                return res.sendStatus(403);
            }
            // Return 200(OK) status if successfull
             return res.sendStatus(200);
        });
    });
};


// Down vote a question 
const downvote_question = (req,res)=>{

    // Get the user Id and question Id from the params
    const user_id = req.user_id;
    const question_id = req.params.question_id; 

    // Check if the question exists 
    questions.getQuestionEventDetails(question_id, (err, result) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500); 
        }
        // If the question doesnot exist, send 404(Unauthorized)
        if (!result) {
            return res.sendStatus(404); 
        }
    // Downvote the question 
    questions.downVote(question_id,user_id, (err,vote)=>{
        if(err) return res.sendStatus(500);

        // If user has already down voted 
        if(vote.alreadyDeleted ){
            return res.sendStatus(403);
        }
        // Return 200(OK) status if successfull
        return res.sendStatus(200);

    });

    });
};




module.exports = {
    ask_question: ask_question,
    delete_question:delete_question,
    upvote_question:upvote_question,
    downvote_question:downvote_question
}
    