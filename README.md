gitlists
========

todo list app using github issues

## Usage

This app requires your full repo access on github to create a new private repo under your account called gh-lists. This is the repo it will use to store your issues/todo items. It does not read/write/touch any of your other repos. You can read the source and see for yourself :)

## Development

If you wish to run this application yourself you must:

1. Register a new github application using your github account at `https://github.com/settings/applications` and set URL to `http://localhost:3000` and Callback URL to  `http://localhost:3000/auth/github/callback`

2. Set a few environment variables on your machine that this server will be used. Be sure to not share these (especially the SECRET) with anyone.
On a Mac put the following in one of your bash/zsh scripts (or run these in your terminal prior to running the server):
```
export GITLISTS_CLIENT_ID=xxxxx
export GITLISTS_CLIENT_SECRET=xxxxx
```
where `xxxxx` is replaced with your client_id and client_secret for your github application.

3. Clone this repo!
4. Install node modules by executing `npm install` in the cloned repo folder.
5. Start server by executing `node app.js` in the cloned repo folder.

## Contributions

If you wish to contribute to this project, please fork and send me a pull request!
