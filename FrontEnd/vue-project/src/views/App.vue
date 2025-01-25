<template>
  <div>
    <div class="container">
      <nav class="navbar navbar-custom">
        <div class="container-fluid">
          <input type="checkbox" id="navbar-toggle" class="navbar-toggle" />
         <label for="navbar-toggle" class="hamburger-menu">
         <i class="fas fa-bars"></i>
           </label>
          <!-- Navbar Title  -->
          <router-link class="navbar-title" to="/">Eventitude</router-link>

          <!-- Navbar Container -->
          <div class="navbar-links-and-search">
            <router-link class="navbar-item" to="/Home">Home</router-link>

            <!-- Show Login button if not logged in, otherwise show Logout -->
            <router-link class="navbar-item login-btn" v-if="!isLoggedIn" to="/Login">Login</router-link>
            <router-link class= "navbar-item" v-if="isLoggedIn" to="/Profile">Profile</router-link> 
            <button v-if="isLoggedIn" class="navbar-item post-event-btn" @click="goToCreateEvent">Post Event</button>
            <button class="navbar-item login-btn" v-if="isLoggedIn" @click="goToLogout">Logout</button>

            <!-- Search Input -->
            <div class="search-box">
              <input
                id="search_string"
                type="text"
                v-model="search"
                placeholder="Search events..."
                class="search-input"
              />
              <button @click="searchEvents" class="search-btn">Search</button>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <router-view />
  </div>
</template>

<script>
import { userService } from '@/services/user.service';

export default {
  name: "App",
  data() {
    return {
      search: "",
      isLoggedIn: false,
    };
  },
  created() {
    // Initially check if the user is logged in
    this.checkIfLoggedIn();
    this.checkLoginStatusInterval = setInterval(this.checkIfLoggedIn, 1000);
  },
  beforeDestroy() {
    clearInterval(this.checkLoginStatusInterval);
  },
  methods: {
    searchEvents() {
      this.$router.push({ path: "/Home", query: { search: this.search } });
      this.search = "";
    },
    checkIfLoggedIn() {
      // Check if session_token exists in localStorage
      this.isLoggedIn = localStorage.getItem("session_token") !== null;
    },

    goToLogout() {
      userService.logout()
        .then(() => {
          // Remove the session_token from localStorage
          localStorage.removeItem("session_token");

          // Update the logged in status
          this.isLoggedIn = false;

          // Redirect to success page
          this.$router.push({ path: "/Success", query: { isLoggedOut: true } });
        })
        .catch((error) => {
          console.error("Logout failed:", error);
        });
    },
    goToCreateEvent(){
      this.$router.push({ path: "/events" });
    }
  },
};
</script>

<style >
/* Styling for navigation bar */
.navbar-custom {
    background-color: #000000;
    padding: 1rem 2rem;
    border-radius: 10px;
    }

    .container-fluid {
      justify-content: space-between;  
    display: flex;  
    align-items: center; 
    }

    .navbar-title {
    color: #FFFFFF;
    font-weight: bold;
    font-size: 1.75rem;
    text-decoration: none;
    margin-right: 2rem;
    }

    .navbar-links-and-search {
    align-items: center;
    display: flex;
    }

    .navbar-item {
    color: #ffffff;
    font-size: 1rem;
    margin: 0 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
    }

    .navbar-item:hover {
      background-color: #f8f9fa;
    color: #000000;
    }

    .search-input {
    border: 1px solid #ccc;
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 5px;
    margin-right: 0.5rem;
    }

    .search-btn {
    background-color: #000000;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    }

    .search-btn:hover {
    background-color: #333;
    }
/* Additionall changes */
    .search-box .search-input {
    border: 1px solid #ccc;
  color: #fff; 
  background-color: #2f2f2f; 
}


/* Styling for Button */
.login-btn {
  border: none;
  background-color: #e63946; 
}

.login-btn:hover {
  background-color: #d32f2f;
}


/* Stylign for post Event Button  */
.post-event-btn {
  color: #FFFFFF;
  background-color: #28a745; 
  border: none;
}

.post-event-btn:hover {
  background-color: #218838;
}
 /* Hidden by defaul used for smaller screens */
.hamburger-menu, .navbar-toggle {
  display: none; 
}
/* Responsive Design for smaller screens */
@media screen and (max-width: 1024px) {
  .container-fluid {
    flex-direction: column;
    align-items: flex-start;
  }

  .navbar-links-and-search {
    display: none; 
    flex-direction: column; 
    width: 100%;
    align-items: flex-start;
    margin-top: 1rem;
  }

  .navbar-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;

  }

  .navbar-item {
    text-align: center;
    margin: 0.5rem 0;
    width: 100%;
    font-size: 1.2rem;
  }

  /* Hamburger Menu */
  .hamburger-menu {
    color: #fff;
    display: block; 
    font-size: 2rem;
    background: none;
    position: absolute;
    cursor: pointer;
    top: 1rem;
    right: 1rem;
    border: none;
    z-index: 2;
  }

  #navbar-toggle {
    display: none;
  }
  #navbar-toggle:checked ~ .navbar-links-and-search {
    display: flex; /* This will Show links */
  }
  .search-box {
    display: flex;
    width: 100%;
    flex-direction: column;
    margin-top: 1rem;
  }

  .search-input {
    margin-bottom: 1rem;
  }

}
</style>