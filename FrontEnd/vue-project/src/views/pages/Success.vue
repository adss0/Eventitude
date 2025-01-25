<template>
    <div>
      <h1>Operation Successful</h1>
      <p>Redirecting...</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      redirectTo: {
        type: String,
        default: "/Home", // Default redirection page
      },
    },
    mounted() {
      const isSignup = this.$route.query.isSignup === "true";
      const isLoggedIn = this.$route.query.isLoggedIn === "true"
      const isLoggedOut = this.$route.query.isLoggedOut === "true"

      setTimeout(() => {
        // If the variable is true, redirect to login
        if (isSignup) {
          this.$router.push("/Login");
        } else if(isLoggedIn){
            this.$router.push("/Home");
        } else if(isLoggedOut){
          this.$router.push("/Home");
        }
        else {
          this.$router.push(this.redirectTo); // Otherwise, redirect to the Home page
        }
      }, 1000); // Delay for 2 seconds
    },
  };
  </script>
  