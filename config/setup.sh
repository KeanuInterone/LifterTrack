#!/bin/bash

echo "Project Name: "  
read project_name

# normalize project name (lower case, underscores for spaces)
normalized_project_name=$(echo "$project_name" | tr '[:upper:]' '[:lower:]')
normalized_project_name=$(tr ' ' '_' <<<"$normalized_project_name")

# create jwt secret
jwt_secret=$(openssl rand -hex 20)

# variables for ssl
country=US
state=California
email=keanu.interone@gmail.com

# strings to relpace
replace_App_Name=App_Name
replace_app_name=app_name
replace_jwt_secret=jwt_secret

# config dev.env file
mv config/dev.env.sample config/dev.env
sed -i '' "s/${replace_App_Name}/${project_name}/g" config/dev.env
sed -i '' "s/${replace_app_name}/${normalized_project_name}/g" config/dev.env
sed -i '' "s/${replace_jwt_secret}/${jwt_secret}/g" config/dev.env

# config the package.json
sed -i '' "s/${replace_App_Name}/${project_name}/g" package.json
sed -i '' "s/${replace_app_name}/${normalized_project_name}/g" package.json

# config the docker-compose.yml
sed -i '' "s/${replace_app_name}/${normalized_project_name}/g" docker-compose.yml

# create self signed certs
cd config
mkdir certs
cd certs
openssl genrsa -out ca.key
openssl req -new -key ca.key -out ca.csr -subj "/C=${country}/ST=${state}/emailAddress=${email}"
openssl x509 -req -days 365 -in ca.csr -signkey ca.key -out ca.cert
rm ca.csr
cd ..
cd ..
