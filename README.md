# Readme

## Installation Guide

### Running Server Locally
1. Clone this repo
1. `cd` into the cloned repo
1. Run `npm i`
1. Run `npm run start`

And now the Hitch API Server is running locally at your decided port and IPv4 address

### Hosting Server on DigitalOcean App Platform
1. Copy repo under your github account
1. Create DigitalOcean account and create a new project
1. Under app platform, select the copied repo and release branch
1. Scale infrastrucutre as needed
1. *Optionally: Link your domain to the hosted application*

And now the Hitch API Server is running on DigitalOceans servers at the url provided by them or at the domain linked. Each time your release branch has a push made, the App Platform will automatically update the hosted server version
## User Guide

1. Host the Hitch API either locally or on DigitalOcean
1. Point the frontend towards either the IPv4 Address or the supplied DigitalOcean URL
1. Run fortend and interact. All requests will be directed towards the hosted server