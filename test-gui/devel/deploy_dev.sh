#!/bin/bash

set -ex

TARGET=gs://figurl/neurostatslab-views-1dev2

yarn build
gsutil -m cp -R ./build/* $TARGET/