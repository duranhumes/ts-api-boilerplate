FROM node:11.9.0-alpine

# Declare variables
ENV DIR /usr/src/app
ENV HOME /home/$USER
ENV USER node

# Install deps
RUN apk update && apk --no-cache add \
    --virtual native-deps g++ gcc libgcc tzdata \
    libstdc++ linux-headers make python build-base \
    && npm install --global --quiet node-gyp \
    npm@latest yarn@latest typescript@latest

# Create the app dir and copy all local files to that location
RUN mkdir -p $DIR
WORKDIR $DIR
COPY . $DIR

# Use node user and take ownership of pertinent dirs
RUN chown -R $USER:$USER /usr/src
RUN chown -R $USER:$USER $HOME

# Set the current user
# USER $USER

# Install app deps
RUN yarn

EXPOSE 8000

# Wait for other services in docker-compose
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

CMD /wait && yarn start
