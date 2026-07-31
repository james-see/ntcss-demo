# Stage 1: Build the WAR with Maven
FROM maven:3.9-eclipse-temurin-11 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2: WildFly with Elytron + Postgres (Sybase-compatible)
FROM jboss/wildfly:latest

USER root

# Create module directory for Postgres JDBC driver
RUN mkdir -p /opt/jboss/wildfly/modules/org/postgresql/main

# Download Postgres JDBC driver and install as module
RUN curl -L -o /tmp/postgresql.jar https://jdbc.postgresql.org/download/postgresql-42.7.5.jar 2>/dev/null && \
    ls -la /tmp/postgresql.jar && \
    rm -rf /opt/jboss/wildfly/modules/org/postgresql && \
    cd /opt/jboss/wildfly && bin/jboss-cli.sh --command="module add --name=org.postgresql --resources=/tmp/postgresql.jar --dependencies=javax.api,javax.transaction.api"

# Verify module
RUN ls -la /opt/jboss/wildfly/modules/org/postgresql/main/

# Copy Elytron user/role properties
COPY wildfly-config/application-users.properties /opt/jboss/wildfly/standalone/configuration/
COPY wildfly-config/application-roles.properties /opt/jboss/wildfly/standalone/configuration/

# Copy pre-built WAR
COPY --from=build /build/target/warehouse-backend.war /opt/jboss/wildfly/standalone/deployments/warehouse-backend.war
RUN touch /opt/jboss/wildfly/standalone/deployments/warehouse-backend.war.dodeploy

# Create startup script that configures datasource after WildFly starts
RUN printf '#!/bin/bash\nset -e\n\n# Start WildFly in background\n/opt/jboss/wildfly/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0 &\nWFLY_PID=$!\n\n# Wait for WildFly to start\necho "Waiting for WildFly to boot..."\nsleep 20\n\n# Register Postgres JDBC driver\necho "Registering Postgres JDBC driver..."\n/opt/jboss/wildfly/bin/jboss-cli.sh --connect --command="/subsystem=datasources/jdbc-driver=postgres:add(driver-name=postgres,driver-module-name=org.postgresql,driver-class-name=org.postgresql.Driver,driver-xa-datasource-class-name=org.postgresql.xa.PGXADataSource)" 2>&1 || true\n\n# Add datasource (connects to Postgres running as our Sybase-compatible DB)\necho "Adding warehouse datasource..."\n/opt/jboss/wildfly/bin/jboss-cli.sh --connect --command="data-source add --name=warehouseDS --jndi-name=java:/jdbc/warehouseDS --driver-name=postgres --connection-url=jdbc:postgresql://sybase:5432/warehouse --user-name=warehouse_user --password=warehouse_pass --min-pool-size=5 --max-pool-size=20 --enabled=true" 2>&1 || true\n\necho "Datasource configuration complete."\n\n# Keep WildFly running\nwait $WFLY_PID\n' > /opt/jboss/wildfly/start.sh
RUN chmod +x /opt/jboss/wildfly/start.sh

# Fix permissions
RUN chown -R jboss:jboss /opt/jboss/wildfly/standalone/

USER jboss

EXPOSE 8080 9990

CMD ["/opt/jboss/wildfly/start.sh"]