gitlists
========

todo list app using github issues

## Usage

This app requires your full repo access on github to create a new private repo under your account called gh-lists. This is the repo it will use to store your issues/todo items. It does not read/write/touch any of your other repos. You can read the source and see for yourself :)

## Development

If you wish to run this application yourself you must set a few environment variables

On a Mac put the following in `/etc/launchd.conf` and reboot:
```
setenv GITLISTS_CLIENT_ID xxxxx
setenv GITLISTS_CLIENT_SECRET xxxxx
```
