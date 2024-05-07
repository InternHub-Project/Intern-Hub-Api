# Role Name

## AI Ansible Playbook Role: Nginx Dynamic IP Updater

# Overview

The API Ansible playbook role serves as a critical component in managing the dynamic nature of Docker container instances hosting API services, ensuring seamless integration with Nginx configurations. It automates the process of updating Nginx configuration files to reflect changes in container IP addresses, enabling effortless scalability and reliability of API services within containerized environments.

# Key Features

- **Dynamic IP Management:** Automatically retrieves the IP addresses of Docker containers hosting API services.
- **Nginx Configuration Update:** Updates Nginx configuration files to route traffic to the corresponding container instances based on their IP addresses.
- **Scalability and Flexibility:** Enables easy scaling of API services without manual intervention, ensuring smooth operations as container instances are added or removed.

# Requirements

- Ansible installed on the control machine.
- Docker installed on target hosts.
- Nginx configured to proxy traffic to API services.

# Example Playbook

    - hosts: servers
      roles:
         - { role name }

# License

BSD

# Author Information

**Name:** Shady Osama

**GitHub:** [shadyosama9](https://github.com/shadyosama9)

**LinkedIn:** [shadyosama9](https://www.linkedin.com/in/shadyosama9/)
