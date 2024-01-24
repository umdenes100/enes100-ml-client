# Run this script by calling wget -qO- https://raw.githubusercontent.com/ForrestFire0/enes100-ml-client/master/install-listener.sh | bash
# RUN IT IN THE ROOT DIRECTORY
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 16
mkdir model-listener
cd model-listener
wget --no-cache https://raw.githubusercontent.com/ForrestFire0/enes100-ml-client/master/listen.mjs
npm init
npm install firebase
npm install node-fetch
npm install pm2 -g
pm2 start listen.mjs --name "model-listener"
echo "To view logs, run the following command: pm2 logs model-listener"