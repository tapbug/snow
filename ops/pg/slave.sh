#!/bin/sh

# slacve.sh
# This script will install PostgreSQL and set it up as a streaming
# replication slave. This instance can be used for read only

slaven=1
masterip=10.0.1.20

# Change computer name
echo "127.0.0.1 pgs${slaven}" | sudo tee -a /etc/hosts
sudo hostname pgs${slaven}

sudo apt-get update
sudo apt-get upgrade -y

# Optionally, prepare drive
'''
sudo apt-get install -y xfsprogs
sudo modprobe xfs
sudo mkfs.xfs /dev/xvdf
echo "/dev/xvdf /data xfs noatime 0 0" | sudo tee -a /etc/fstab
sudo mkdir /data
sudo mount /data
'''

# Add pg ppa and update cache
echo | sudo add-apt-repository ppa:pitti/postgresql
sudo apt-get update

# Install pg
sudo apt-get -y install postgresql-9.2 postgresql-client-9.2 \
postgresql-contrib-9.2 postgresql-server-dev-9.2 libpq-dev

sudo service postgresql stop

# PostgreSQL config
sudo tee /etc/postgresql/9.2/main/postgresql.conf << EOL
data_directory = '/data/main'
listen_addresses = '*'
unix_socket_directory = '/var/run/postgresql'
password_encryption = on
hot_standby = on
EOL

# PostgreSQL ACL
sudo tee /etc/postgresql/9.2/main/pg_hba.conf << EOL
local all postgres              peer
host  all all 127.0.0.1/32      md5
host  all all 10.0.0.239/32     md5 # VPN
host  all all 10.0.1.0/16       md5
host  all all 10.0.0.184/32     md5 # API
host  all all ::1/128           md5
host  all all 10.0.1.158/32     trust # pool
EOL

# ---------------------------------------------------------------------------------
# RECOVERY
# ---------------------------------------------------------------------------------

# PostgreSQL recovery
sudo -u postgres -g postgres mkdir -m 0700 /data/main

export PGPASSWORD=postgres

# Copy data directory
sudo -u postgres -g postgres pg_basebackup -h ${masterip} -D /data/main -U postgres

# recovery.conf
sudo -g postgres -u postgres tee /data/main/recovery.conf << EOL
standby_mode = 'on'
primary_conninfo = 'host=${masterip} port=5432 user=postgres password=postgres'
EOL

sudo service postgresql start
