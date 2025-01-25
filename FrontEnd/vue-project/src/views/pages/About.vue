<template>
    <div class="about-container">
      <h1>Welcome to Eventitude</h1>
        <div class="about-content">
          <p>
           Your go-to platform for discovering and posting exciting events in your neighborhood. Whether you’re looking to attend a concert, workshop or a social gathering, we have it all!
          </p>
          <h2>Join Us!</h2>
          <p>
            Sign up today to start advertising your events or discovering the finest ones occurring near you!
          </p>
          <button class="get-started-btn" @click="goToLoginPage">Get Started</button>
        </div>
    </div>
  </template>
  
  <script>
  import { authService } from '@/services/auth.service';
  
  export default {
    data(){

    },
    methods : {
      // Got to login Page if not loggged in, else go to home page
        goToLoginPage(){
            const token = authService.getSessionToken();
            if(token){
                this.$router.push({path: '/Home'});
            }else{
                this.$router.push({path: '/Login'});
            }
        }

    }
  };
  </script>
  
  <style scoped>  

  .about-container {
    color: #ffffff;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  /* colour for the h2 header */
  h2{
    color: #007bff;
  }
  .about-content {
    padding: 1.5rem;
  }

  /* style the paragrpah content */
  p {
    font-size: 1rem;
    color: #ffffff;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }
  .get-started-btn {
  padding: 1rem;
  font-size: 1.2rem;
  align-self: center;
  font-weight: bold;
  color: #ffffff; 
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
/* Drak blue colour on hover */
.get-started-btn:hover {
  background-color: #0056b3;
}

/* Responsive design */
@media (max-width: 1024px) {
  .about-container {
    padding: 1rem;
  }

  .get-started-btn {
    width: 100%; 
    padding: 1rem;
  }
}
  </style>
  