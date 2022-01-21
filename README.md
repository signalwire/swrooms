# SWROOMS

Host video conferences in your own space using SignalWire’s Video APIs. You’ll be able to create rooms, invite people, and administer rooms from the admin page. Your rooms will be accessible on `<your-signalwire-username>.swrooms.com`

## Introduction

This codebase contains both the frontend and the backend for the [swrooms.com](http://swrooms.com) website. The frontend code written in React is inside the `video` folder. It uses the SignalWire Video JS library to create video calls. It also uses custom libraries

## Running swrooms locally

1. Clone the repo with `git clone https://github.com/signalwire/swrooms.git` and cd into it `cd swrooms`
2. Install the npm packages for both the backend and frontend: `yarn install && cd video && yarn install && cd ..`
3. Set up the environment variables `.env` and `video/.env`. You can use the `.env.sample` files as reference.  
   For backend the `.env.sample` is right at the root of the repo. Only one variable is essential for you to set: `JWT_SECRET`. Make it a strong, random, unique password. Then you can `mv env.sample .env` to situate the file.  
   For the frontend, the `.env.sample` file is in `video` folder. You don’t necessarily need to change anything here, just `mv env.sample .env`. If you ever have to host the backend on a separate URL, keep that URL at `REACT_APP_API_URL`.

4. Finally, if you’d like to just give it a whirl, cd into the root of the repo and go `yarn prod`. It’ll build the frontend and serve it via the backend. It will be available at `[localhost:5000](http://localhost:5000)` or whatever port you’ve set.  
   To develop, run `yarn dev`. It will be available at `[localhost:3000](http://localhost:3000)` by default.

Swrooms uses subdomains to separate spaces. So you'll need to make sure that your development environment supports subdomains on localhost.
Google Chrome seems to automatically make `subdomain.localhost:5000` type of URLs work. Otherwise, you'll need to (add new entries
to your hosts file)[https://stackoverflow.com/questions/19016553/add-subdomain-to-localhost-url].

## Logging in

The login process for swrooms is slightly unique in that you need to use an API token generated from your SignalWire dashboard to access the admin page (to be able to create, monitor and administer rooms). Simply [sign up for a space](https://developer.signalwire.com/apis/docs/signing-up-for-a-space) and get a new API token (learn more about the process [here](https://developer.signalwire.com/apis/docs/getting-started-with-the-signalwire-video-api-1)).

After that, log in with your Project ID and API token at `<your-signalwire-username>.localhost:5000/admin`.
