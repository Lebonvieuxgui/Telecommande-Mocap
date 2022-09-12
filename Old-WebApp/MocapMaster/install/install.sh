# Install and setup database
sudo adduser --ingroup nogroup --shell /etc/false --disabled-password --gecos "" --no-create-home mongodb
sudo chown root:root ./mongo/binaries/mongo*
sudo strip mongo/binaries/mongo*
sudo cp -r mongo/binaries/mongo* /usr/bin
sudo chmod 755 /usr/bin/mongo*
sudo mkdir /var/log/mongodb
sudo chown mongodb:nogroup /var/log/mongodb
sudo mkdir /var/lib/mongodb
sudo chown mongodb:root /var/lib/mongodb
sudo chmod 775 /var/lib/mongodb
sudo cp services/mongodb.service /lib/systemd/system/
sudo cp mongo/mongodb.conf /etc/
sudo systemctl daemon-reload
sudo service mongodb restart
sudo systemctl enable mongodb

# Install third party tools and set up server
(cd ../ && exec npm install)
sudo apt-get install arp-scan -y
sudo apt-get install ffmpeg -y
sudo npm install -g nodemon
cp -r element-custom-theme ../node_modules/element-ui/lib
mv ../node_modules/element-ui/lib/element-custom-theme ../node_modules/element-ui/lib/custom-theme
(cd ../ && exec npm run-script build)

# Finish setting up database
mongo < mongo/setup.js
sudo bash -c "echo 'security:' >> /etc/mongodb.conf"
sudo bash -c "echo '  authorization: enabled' >> /etc/mongodb.conf"
sudo service mongodb restart

# Adds services
sudo cp services/master-server.service /lib/systemd/system
sudo service master-server start
sudo systemctl enable master-server

echo "DONE"
