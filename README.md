# Anonymous chat web-application built with Node.js
This is a self-hosted gallery application.

## How to host it on your server
To install express-gallery you need node and npm on your server, then just do the following:
```
git clone https://github.com/Baka9k/express-gallery.git
cd express-gallery
npm install
mkdir uploads
mkdir thumbnails
node app.js &
```
The app uses MongoDB as storage engine.
Note that you need a working MongoDB instance on your machine.

To change the number of thumbnails per page update the `config.json` file:  
`{"thumbsOnPage": "25"}`

Users database stored in `users.json` file, and has default user `qwerty` with password `123` 


## Screenshots:
### Desktop:
![Screenshot 1](
https://github.com/baka9k/express-gallery/raw/master/screenshots/1.png)
![Screenshot 2](
https://github.com/baka9k/express-gallery/raw/master/screenshots/2.png)
![Screenshot 3](
https://github.com/baka9k/express-gallery/raw/master/screenshots/3.png)
![Screenshot 4](
https://github.com/baka9k/express-gallery/raw/master/screenshots/4.png)
### Mobile:
![Screenshot 5](
https://github.com/baka9k/express-gallery/raw/master/screenshots/5.png)
![Screenshot 6](
https://github.com/baka9k/express-gallery/raw/master/screenshots/6.png)
![Screenshot 7](
https://github.com/baka9k/express-gallery/raw/master/screenshots/7.png)
