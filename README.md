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

### Features  
 - required information is enforced
 - Set IPv6 for the entire system: will ensure an IPv6 address is required for each server, and for Cassandra where enabled.
 - selection lists for QoS markers, Market Data, license and server platform
 - Regex enforcing requirements/limitations for Domain, Data center, Rack and Hostname
 - Network automatically calculated from subnet. Gateway confirmed/rejected as a valid value in the network.
 - Server addition tying protection protection:
  + select DC/Rack from menu list
  + matching server IP address value with network address ensures valid IP addresses selected. (IPv4 and IPv6)
  + enabling Cassandra checks whether IPv6 is used. If used, requires IPv6 address that matches IPv6 network. Else verifies IPv4 address matches.
 - generates config file (mxoneInstallData.txt and/or mxoneAddServerData.txt) for easy copying, verification and deployment

### TODO
1. Uniqueness tests on hostname, IP addresses and LIM values.
2. Option to add a backend server for storing/retrieving data per site.
3. Add icon to "scroll to bottom" to indicate page extends beyond current screen.
4. Add footer with version and source link.
