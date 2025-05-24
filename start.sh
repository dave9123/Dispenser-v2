#!/bin/bash

DENO_LOGDIR="logs"
DENO_COMMAND="./deno run --allow-all src/app.ts"

# Function to check if a process is running
is_running() {
  pgrep -f "$1" > /dev/null 2>&1
}

# Function to start the Deno process and log its output
start_deno_process() {
  if is_running "$DENO_COMMAND"; then
    echo "Deno process is already running. Exiting."
    exit 1
  fi

  # Create log directory if it doesn't exist
  mkdir -p "$DENO_LOGDIR"

  while true; do
    LOGFILE="$DENO_LOGDIR/$(date '+%d%m%Y-%H%M%S').log"
    $DENO_COMMAND 2>&1 | tee -a "$LOGFILE" &

    DENO_PID=$!
    wait $DENO_PID
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
      echo "Deno process exited normally with code $EXIT_CODE. Exiting..." | tee -a "$LOGFILE"
      #exit 0
    else
      echo "Deno process exited with code $EXIT_CODE. Restarting..." | tee -a "$LOGFILE"
    fi
  done
}

start_deno_process