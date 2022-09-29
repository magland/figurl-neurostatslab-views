#!/bin/bash

set -ex

TARGET=gs://figurl/neurostatslab-views-1dev5

yarn build
gsutil -m cp -R ./build/* $TARGET/