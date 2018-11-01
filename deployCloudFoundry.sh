#!/usr/bin/env bash

###########################################################################
#
#
#
# NAME:         deployCloudFoundry.sh
#               Requires Environment Variables set on Travis:
#                - CF_USER <inside travis settings>
#                - CF_PW <inside travis settings>
#                - CF_SPACE <inside travis settings>
#                - CF_ORG <inside travis settings>
#                - CF_TARGET <inside travis settings>
#                - NUMBER_INSTANCES <inside travis.yml>
#                - MEMORY_SIZE <inside travis.yml>
#                - APP_NAME <inside travis.yml>
#                - APP_VERSION <inside travis.yml>
#                - CLOUDANT_USER <inside travis settings>
#                - CLOUDANT_PW <inside travis settings>
#
# AUTHOR:
#               mentoring-projects
#
# DATE:         November 2018 , Version 1.0
#
#
# ABOUT:        Used to deploy the application on IBM Cloud 
#                - Cloud Foundry Node.js runtime
#
# SETUP:        chmod +x deployCloudFoundry.sh
#               ./deployCloudFoundry.sh
#               
#
# Modifications:
#
#
############################################################################

REQUIRED=("CF_USER" "CF_PW" "CF_SPACE" "CF_ORG" "CF_TARGET" "NUMBER_INSTANCES"
"MEMORY_SIZE" "APP_NAME" "APP_VERSION" "CLOUDANT_USER" "CLOUDANT_PW")

echo "Checking environment variables..."
for name in ${REQUIRED[*]}; do
    if [ -z "${!name}" ]; then
        echo "The '${name}' environment variable is required."
        exit 1
    fi
done

echo "Checking cf cli..."
if [ -z "$(which cf)" ]; then
    { # try
        curl -sLO http://go-cli.s3-website-us-east-1.amazonaws.com/releases/v6.13.0/cf-linux-amd64.tgz
        [ -f /usr/bin/sudo ] && sudo tar -xzf cf-linux-amd64.tgz -C /usr/bin
        rm -rf cf-linux-amd64.tgz
    } || { # catch
        echo "Error occured on cf installation."
        exit 1
    }
else
    echo "Found cf command, skipping install"
fi

echo "Logging on Cloud Foundry..."
{ # try
    cf api ${CF_TARGET}
    cf login -u ${CF_USER} -p ${CF_PW} -o ${CF_ORG} -s ${CF_SPACE}
} || { # catch
    echo "Error occured on cf login."
    exit 1
}

echo "Deploying ${APP_NAME} app..."
{ # try
    cf push ${APP_NAME} --no-start -i ${NUMBER_INSTANCES} -m ${MEMORY_SIZE}
    cf set-env ${APP_NAME} CLOUDANT_USER ${CLOUDANT_USER}
    cf set-env ${APP_NAME} CLOUDANT_PW ${CLOUDANT_PW}
    cf start ${APP_NAME}
    cf logout
    exit 0
} || { # catch
    echo "Error occured on deploy."
    exit 1
}
