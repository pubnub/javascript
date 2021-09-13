#!/usr/bin/env bash
set -e

# Check whether previous builds already generated artifacts or not.
if ! [[ -d "$(pwd)/upload" ]]; then
  npm ci
  gulp compile
fi