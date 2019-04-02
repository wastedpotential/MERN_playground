# MERN_playground
a testbed for MongoDB, Express, React, Node projects. In the current form, I'm experimenting with MongoDB and Express.

## GETTING STARTED:
To run this project, you must connect it to a MongoDB Cluster. To do this: 
* Create a file in the root directory called "db_creds.js"
* In that file, paste this code:
    ```javascript
    const dbCredentials = {
        uri: "mongodb+srv://<DB_USER>:<DB_USER_PW>@<CLUSTER_NAME>-lxein.mongodb.net/test"
    }
    exports.dbCredentials = dbCredentials;
    ```
* Fill in your credentials and save the file

## RUNNING THE PROJECT:
* In Terminal, cd into the project's root folder.
* Run ```npm install```
* Once dependencies are installed, run ```node server.js```



