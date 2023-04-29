# Barbershop Full Stack Application

This project is a full-stack application for a barber shop that provides users with the ability to book appointments and log in using authentication.

![alt tag](https://i.ibb.co/2gMbyLQ/app-screenshot.png)

**Link to project:**

## How It's Made:

**Tech used:** HTML, CSS, JavaScript, React, Material UI

For the full-stack application for the barber shop, I used a combination of backend and frontend technologies to create a seamless experience for users.

On the backend, I used Node.js and the Express framework to handle HTTP requests and responses. Express is a lightweight framework that makes it easy to create web applications quickly. Additionally, I used MongoDB as the database to store user information and appointment data. MongoDB is a NoSQL database that is great for storing unstructured data such as JSON.

For the frontend, I used React, a popular JavaScript library for building user interfaces. React allows you to create reusable components that make it easy to build complex UIs. Additionally, I used Material UI, a React UI framework that provides pre-built components that follow Google's Material Design guidelines. Material UI helped me to create a consistent and intuitive user interface for the application.

To handle authentication, I used the JSON Web Token (JWT) standard. JWT is a secure way to transmit information between parties as a JSON object. I created an API endpoint that generates a JWT token for a user when they log in. The token is then used to authenticate the user for subsequent requests.

For the booking system, I created an API endpoint that allows users to create appointments. When a user creates an appointment, the data is stored in the MongoDB database. Users can view their appointments by logging in and navigating to the appointments page.

Overall, the combination of these technologies allowed me to create a robust and scalable application that provides users with an intuitive booking experience.

## Lessons Learned:

One of the most important lessons I learned was how to use the principles of refreshing JWT tokens to keep users authenticated. I implemented an approach that involved sending a new token to the user before the old token expired, which ensured that the user was always authenticated. This allowed for a smooth user experience without having to manually refresh the token.

I also used Redux Toolkit Query for data fetching, which provided a clean and concise way to fetch data from the backend API. Redux Toolkit Query is a library that provides a set of utilities for fetching and caching data in Redux. One of the key benefits of using this library was the ease of handling expired tokens. With Redux Toolkit Query, I was able to set up automatic token refreshing without having to write complex code.

Another benefit of using Redux Toolkit Query was the ability to cache API responses. Caching allowed me to optimize performance by reducing the number of network requests made to the server. Additionally, it provided a way to display data to the user instantly without waiting for the server to respond.

The use of modern tools and technologies like Redux Toolkit Query made the development process more enjoyable and allowed me to deliver a high-quality product. I am constantly learning new things as an engineer and I look forward to applying these lessons in future projects.
