#!/bin/bash
# Custom entrypoint: run original Sybase init, then load our schema

# Run the original entrypoint in background
/entrypoint.sh &
ENTRY_PID=$!

# Wait for Sybase to be ready
echo "Waiting for Sybase ASE to start..."
sleep 5

# Check if isql is available
export SYBASE=/opt/sybase
source /opt/sybase/SYBASE.sh 2>/dev/null

RETRIES=30
while [ $RETRIES -gt 0 ]; do
    STATUS=$(grep "server name is 'MYSYBASE'" /opt/sybase/ASE-16_0/install/MYSYBASE.log 2>/dev/null | wc -c)
    if [ "$STATUS" -gt 0 ]; then
        echo "Sybase is running, waiting for init to complete..."
        sleep 15  # Give the entrypoint time to create DB and user
        break
    fi
    sleep 2
    RETRIES=$((RETRIES - 1))
done

# Run our schema init using the warehouse_user
echo "Loading warehouse schema..."
/opt/sybase/OCS-16_0/bin/isql -Uwarehouse_user -Pwarehouse_pass -SMYSYBASE -i/opt/sybase/init.sql 2>&1 || \
/opt/sybase/OCS-16_0/bin/isql -Usa -PmyPassword -SMYSYBASE -i/opt/sybase/init.sql 2>&1

echo "Schema loaded."

# Wait for the original entrypoint
wait $ENTRY_PID