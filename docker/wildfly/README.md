# Sybase jConnect JDBC Driver Module for WildFly
# This module provides the Sybase ASE JDBC driver (jconn4)

Place jconn4.jar in this directory and the module.xml will be created
during the Docker build process. The driver class is:
  com.sybase.jdbc4.jdbc.SybDriver

XA datasource class:
  com.sybase.jdbc4.jdbc.SybXADataSource

Connection URL pattern:
  jdbc:sybase:Tds:<host>:<port>/<database>