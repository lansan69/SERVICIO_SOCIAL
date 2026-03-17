#!/bin/bash

VERSION=$1
ACTION=$2

# Check for valid version argument
if [ "$VERSION" == "5.6" ]; then
    LAMPP_DIR="/opt/lampp_5.6"
elif [ "$VERSION" == "latest" ]; then
    LAMPP_DIR="/opt/lampp_latest"
else
    echo "Usage: $0 [5.6|latest] [start|stop|restart]"
    exit 1
fi

# Check for valid action argument
if [[ ! "$ACTION" =~ ^(start|stop|restart)$ ]]; then
    echo "Usage: $0 [5.6|latest] [start|stop|restart]"
    exit 1
fi

# Verify the executable exists
if [ ! -f "$LAMPP_DIR/lampp" ]; then
    echo "Error: lampp executable not found at $LAMPP_DIR/lampp"
    exit 1
fi

# Execute the command
sudo $LAMPP_DIR/lampp $ACTION