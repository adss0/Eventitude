const events = require("../controllers/event.server.controllers")
const auth= require("../lib/authentication")

module.exports = function(app){
    app.route("/events")
    .post(auth.isAuthenticated, events.create_new_event);
    
    app.route("/event/:event_id")
    .get(events.single_event_details)
    .patch(auth.isAuthenticated, events.update_event)
    .post(auth.isAuthenticated,events.register_for_event)
    .delete(auth.isAuthenticated, events.delete_event);

    app.route("/search")
    .get(events.search_event);

}