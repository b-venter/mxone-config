# MXONE Config Generator
A graphical interface to aid generation of initial MXONE deployment files and later server additions. It reduces typing mistakes by allowing a enter-once choose-repeatedly design. Sanity checks are also included - ensuring data entry is according to the requirements (e.g. length, allowed characters, etc). Further, IP values are verified (network value is matched to the subnet, host value is verified against subnet and network).  
  
This is a Single Page Application - all data is processed in the local browser. Live version: https://config.mxone.workshop86.com  

### Own deployment
This is an Angular application.
> git clone
> cd
> npm i && npm build
1. Copy the built data to a webserver
2. Configure the web server (see https://v17.angular.io/guide/deployment#fallback-configuration-examples)
