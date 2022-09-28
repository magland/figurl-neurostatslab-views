#!/bin/bash

set -ex

TARGET=gs://figurl/neurostatslab-views-1dev4

yarn build
gsutil -m cp -R ./build/* $TARGET/