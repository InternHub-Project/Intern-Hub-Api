### Role Name

# API Ansible Playbook Role: Nginx Dynamic IP Updater

## Overview

The AI Ansible playbook role is designed to manage the dynamic IP addresses of Docker containers hosting AI (Python) services and ensure smooth integration with Nginx configurations. This role automates the process of updating Nginx configuration files to reflect changes in container IP addresses, facilitating seamless scalability and reliability of AI services within containerized environments.

### Key Features

- **Dynamic IP Management:** Automatically retrieves the IP addresses of Docker containers hosting AI services.
- **Nginx Configuration Update:** Updates Nginx configuration files to route traffic to the corresponding container instances based on their IP addresses.
- **Scalability and Flexibility:** Enables easy scaling of AI services without manual intervention, ensuring smooth operations as container instances are added or removed.

### Requirements

- Ansible installed on the control machine.
- Docker installed on target hosts.
- Nginx configured to proxy traffic to AI services.

### Example Playbook

- hosts: servers
  roles:
  - { role name }

### License

BSD

### Author Information

**Name:** Shady Osama

**GitHub:** [shadyosama9](https://github.com/shadyosama9)

**LinkedIn:** [shadyosama9](https://www.linkedin.com/in/shadyosama9/)
