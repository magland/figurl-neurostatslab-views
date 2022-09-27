#!/bin/bash

set -ex

TARGET=gs://figurl/neurostatslab-views-1dev3

yarn build
gsutil -m cp -R ./build/* $TARGET/