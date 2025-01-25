import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/pages/Login.vue";
import Home from "../views/pages/Home.vue";
import About from"@/views/pages/About.vue";
import SingleEvent from "../views/pages/SingleEventDetails.vue";
import Signup from "@/views/pages/Signup.vue";
import Success from "../views/pages/Success.vue"
import CreateNewEvent from "@/views/pages/CreateNewEvent.vue";
import UpdateEvent from "@/views/pages/UpdateEvent.vue";
import AskQuestion from "@/views/pages/AskQuestion.vue";
import Profile from "@/views/pages/Profile.vue";
import AllEvents from "@/views/pages/AllEvents.vue";
import NotFound from "@/views/pages/NotFound.vue";

const routes=[
    /* Components and paths that will be used to navigate to the different pages */
    {path : "/", component: About},
    {path : "/Home", component: Home},
    {path: "/Login", component: Login},
    {path: "/Signup", component: Signup},
    {path: "/event/:event_id", component: SingleEvent},
    {path: "/Success", component: Success},
    {path: "/events", component: CreateNewEvent},
    {path: "/update/:event_id", component: UpdateEvent},
    {path: "/event/:event_id/question", component: AskQuestion},
    {path: "/Profile", component: Profile},
    {path:"/ViewAll", component: AllEvents},
    {path: "/:pathMatch(.*)*", component: NotFound}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;