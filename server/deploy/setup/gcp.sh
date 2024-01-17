# Step 1: Get credentials for the cluster (Create cluster from console)
gcloud container clusters get-credentials cluster-name --zone us-east1-c

# Step 2: Create an IAM
gcloud iam service-accounts create ray-iam

# Step 3: Create a kubernetees service account
kubectl create serviceaccount ray-ksa

# Step 4: Get project id
gcloud projects list


# Step 5: Link kubernetees service account with IAM
gcloud iam service-accounts add-iam-policy-binding ray-iam@project-id.iam.gserviceaccount.com \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:project-id.svc.id.goog[default/ray-ksa]"

# Step 6: Link IAM to storage bucket (Create storage from console)
gsutil iam ch serviceAccount:ray-iam@project-id.iam.gserviceaccount.com:roles/storage.admin gs://ray-storage-bucket

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
