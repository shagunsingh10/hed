# Step 1: Install docker
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Step 2: Install kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /bin/kind

# Install Kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Step 3: Install helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

# Step 3.0:Create kind cluster
kind create cluster --image=kindest/node:v1.23.0

# Add Helm repo
helm repo add kuberay https://ray-project.github.io/kuberay-helm/
helm repo update

# Install both CRDs and KubeRay operator v1.0.0.
helm install kuberay-operator kuberay/kuberay-operator

# Confirm that the operator is running in the namespace `default`.
kubectl get pods
# NAME                                READY   STATUS    RESTARTS   AGE
# kuberay-operator-7fbdbf8c89-pt8bk   1/1     Running   0          27s

# Download your ray cluster config yaml
# curl -LO https://raw.githubusercontent.com/ray-project/kuberay/v1.0.0/ray-operator/config/samples/ray-service.autoscaler.yaml

# Apply config
kubectl apply -f ray-service.autoscaler.yaml


# Check pods -> 2 head pods should start ray head and ray autoscaler
kubectl get pods

# Check services -> A ray serve service will start if serve application launches successfully
kubectl get services

# If not check logs 
kubectl cp "head_pod_name":/tmp/ray/session_latest/logs/ ./logs/


# Forward ports -> Dashboard and ray serve
kubectl port-forward --address 0.0.0.0 service/"head_service_name" 8265:8265
kubectl port-forward --address 0.0.0.0 service/"ray_serve_service" 8000:8000
