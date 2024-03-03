## Overview
This web app still uses flask as the backend server.
The index, login, and register pages are still rendered by html.
The dashboard and deadlines pages are rendered by React.
You'll need to install Node.js from https://nodejs.org/en

## To Start
The react project is inside /client
All js and css code are inside /client/src
App.js is React's central route 

To install dependencies:
`npm install`

If you have made any changes to files in /client, to rebuild the project and deploy the web app locally,
run the following commands:
`cd client`
`npm run build` -- this will build the app to the `build` folder
`cd ..`
`flask run`

## File Location Changes
index.html is now inside /static. Please don't move it.
deadlines.html and dashboard.html inside /templates are no longer used. 
They are just kept for reference in case React breaks.

Some files inside /client/src are not used/changed, but please don't remove them for now. 

## Important
React router is configured to enfoce a base path of /app.
Every route starting with /app is rendered with React.




