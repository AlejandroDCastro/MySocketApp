# MySocketApp
<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/talk.png" alt="Picture 1" width="160" align="left">

**MySocket**, a real-time safe chat app.

MySocket is an *Undergraduate Thesis Project* made by Alejandro Castro Valero from *Multimedia Engineering* degree.

To see all the specifications that do not appear in this file about the project, please check the full thesis in [RUA](http://rua.ua.es/dspace/handle/10045/126905).

***

## Purpose
The aim of this project is to learn and improve aspects about the software development, design patterns, some technologies used in the market currently and cripthography techniques to protect the information, with application of all of them in a real chat app. These involve a previous research about the history of the most well-known chats and the common communication and security architectures used for chat apps including advantajes and disavantages for each one. When the chat functionalities were defined, the software architectures were specified too with reference to the investigation in order to develop the latter.

***

## Description
MySocket is an open-source web chat app that allows the communication between users throghout messages in different ways. The backend holds a RESTful API to accomplish user session functionalities and the Websocket technology to exchange chat rooms and messages, getting instant messaging.

MySocket implements a mixed crypto system so as to protect the data. The algorithms used to achieve this level have been:
* AES (256 bits)
* RSA (2048 bits)
* SHA-3 (512 bits)

***

## Tecnologies
* MERN stack:
  * [MongoDB](https://www.mongodb.com/)
  * [ExpressJS](http://expressjs.com/)
  * [ReactJS](https://reactjs.org/)
  * [Node.js](https://nodejs.org/en/)
* [Socket.IO](https://socket.io/)

The necessary modules are installed from NodeJS using the `npm` command.

***

## Features
Features at user level.
* Sign up, sign in and log out functionalities
* Maintain session opened if user want to
* Real-time chat functionality
* Create individual chat rooms
* Create group chat rooms
* List individual chat rooms
* List group chat rooms
* Show chat name and last message with its date for each chat room
* Send plane text messages
* Send picture messages
* Send audio messages
* Record and send messages in real-time
* Sending files messages
* Download unknown format files
* Load earlier messages from chats

***

## Installation
MySocket does not have hosting yet. Moreover, if you want to setup this project locally using `localhost`, please execute the following instructions.
### Instructions
#### 1. Install Node.js:
* Manually clicking [here](https://nodejs.org/en/download/)
* Using console commands (Ubuntu):
  * `sudo apt update` update your local package index
  * `sudo apt install nodejs` install Node.js
  * `sudo apt install npm` install Node.js package manager
#### 2. Clone MySocket repository
* `git clone https://github.com/AlejandroDCastro/MySocketApp.git`
#### 3. Open client and server on terminal
* `cd MySocket/client/` in a terminal
* `cd MySocket/server/` in other one
#### 4. Install dependencies
* `npm install` for both
#### 5. Run application
* `npm start` client side
* `nodemon index` server side

***

## Screenshots

<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/pic1.png" alt="Picture 1">
<br>
<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/pic2.png" alt="Picture 2">
<br>
<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/pic3.png" alt="Picture 3">
<br>
<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/pic4.png" alt="Picture 4">
<br>
<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/pic5.png" alt="Picture 5">
<br>
<img src="https://github.com/AlejandroDCastro/MySocketApp/blob/main/pics/pic6.png" alt="Picture 6">
