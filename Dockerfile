FROM instructure/node-passenger:6

USER root
COPY package.json /usr/src/app/package.json
RUN chown -R docker:docker /usr/src/app
USER docker
RUN npm install

USER root
COPY . /usr/src/app
RUN chown -R docker:docker /usr/src/app
USER docker

RUN ./node_modules/.bin/webpack
