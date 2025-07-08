#!/bin/bash

# K.E.N. Quintillion System - Hetzner Infrastructure Deployment
# Version: 2.0.0-quintillion
# Enhancement Factor: 1.73 Quintillion x
# Target Cost: €23.46/month

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
KEN_VERSION="2.0.0-quintillion"
HETZNER_SERVER_TYPE="cx31"  # 2 vCPU, 8GB RAM, 80GB SSD - €17.99/month
HETZNER_LOCATION="ash"      # Ashburn, Virginia (closest to AWS us-east-2)
HETZNER_IMAGE="ubuntu-22.04"
SERVER_NAME="ken-quintillion-system"
SSH_KEY_NAME="ken-deployment-key"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

header() {
    echo -e "${PURPLE}"
    echo "=================================================================="
    echo "$1"
    echo "=================================================================="
    echo -e "${NC}"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v hcloud &> /dev/null; then
        error "Hetzner CLI (hcloud) not found. Please install it first."
    fi
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl not found. Please install it first."
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker not found. Please install it first."
    fi
    
    success "All dependencies found"
}

# Setup Hetzner CLI
setup_hetzner_cli() {
    log "Setting up Hetzner CLI..."
    
    if [ -z "$HCLOUD_TOKEN" ]; then
        error "HCLOUD_TOKEN environment variable not set"
    fi
    
    hcloud context create ken-deployment
    hcloud context use ken-deployment
    
    success "Hetzner CLI configured"
}

# Create SSH key
create_ssh_key() {
    log "Creating SSH key for deployment..."
    
    if [ ! -f ~/.ssh/ken_deployment ]; then
        ssh-keygen -t ed25519 -f ~/.ssh/ken_deployment -N "" -C "ken-quintillion-deployment"
        success "SSH key created"
    else
        warning "SSH key already exists"
    fi
    
    # Add to Hetzner
    if ! hcloud ssh-key describe $SSH_KEY_NAME &> /dev/null; then
        hcloud ssh-key create --name $SSH_KEY_NAME --public-key-from-file ~/.ssh/ken_deployment.pub
        success "SSH key added to Hetzner"
    else
        warning "SSH key already exists in Hetzner"
    fi
}

# Create server
create_server() {
    log "Creating Hetzner server..."
    
    if hcloud server describe $SERVER_NAME &> /dev/null; then
        warning "Server $SERVER_NAME already exists"
        return
    fi
    
    hcloud server create \
        --name $SERVER_NAME \
        --type $HETZNER_SERVER_TYPE \
        --location $HETZNER_LOCATION \
        --image $HETZNER_IMAGE \
        --ssh-key $SSH_KEY_NAME \
        --user-data-from-file infrastructure/cloud-init.yml
    
    success "Server created successfully"
    
    # Wait for server to be ready
    log "Waiting for server to be ready..."
    sleep 60
    
    SERVER_IP=$(hcloud server ip $SERVER_NAME)
    log "Server IP: $SERVER_IP"
    
    # Wait for SSH to be available
    log "Waiting for SSH to be available..."
    while ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i ~/.ssh/ken_deployment root@$SERVER_IP "echo 'SSH ready'" &> /dev/null; do
        sleep 10
    done
    
    success "Server is ready and SSH is available"
}

# Install K3s Kubernetes
install_k3s() {
    log "Installing K3s Kubernetes..."
    
    SERVER_IP=$(hcloud server ip $SERVER_NAME)
    
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/ken_deployment root@$SERVER_IP << 'EOF'
        # Install K3s
        curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
        
        # Wait for K3s to be ready
        sleep 30
        
        # Verify installation
        kubectl get nodes
        
        # Install Helm
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
        
        # Create namespace for K.E.N. system
        kubectl create namespace ken-system
        
        echo "K3s installation completed"
EOF
    
    success "K3s Kubernetes installed"
}

# Deploy K.E.N. system
deploy_ken_system() {
    log "Deploying K.E.N. Quintillion System..."
    
    SERVER_IP=$(hcloud server ip $SERVER_NAME)
    
    # Copy deployment files to server
    scp -o StrictHostKeyChecking=no -i ~/.ssh/ken_deployment -r kubernetes/ root@$SERVER_IP:/root/
    scp -o StrictHostKeyChecking=no -i ~/.ssh/ken_deployment .env.production root@$SERVER_IP:/root/
    
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/ken_deployment root@$SERVER_IP << 'EOF'
        cd /root
        
        # Create ConfigMap from environment file
        kubectl create configmap ken-config --from-env-file=.env.production -n ken-system
        
        # Apply Kubernetes manifests
        kubectl apply -f kubernetes/ -n ken-system
        
        # Wait for deployment
        kubectl wait --for=condition=available --timeout=300s deployment/ken-api -n ken-system
        kubectl wait --for=condition=available --timeout=300s deployment/ken-worker -n ken-system
        kubectl wait --for=condition=available --timeout=300s deployment/ken-cache -n ken-system
        
        # Get service status
        kubectl get all -n ken-system
        
        echo "K.E.N. system deployment completed"
EOF
    
    success "K.E.N. system deployed successfully"
}

# Configure monitoring
setup_monitoring() {
    log "Setting up monitoring and alerts..."
    
    SERVER_IP=$(hcloud server ip $SERVER_NAME)
    
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/ken_deployment root@$SERVER_IP << 'EOF'
        # Install Prometheus and Grafana
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo add grafana https://grafana.github.io/helm-charts
        helm repo update
        
        # Install Prometheus
        helm install prometheus prometheus-community/kube-prometheus-stack \
            --namespace monitoring \
            --create-namespace \
            --set grafana.adminPassword=ken-quintillion-2025
        
        # Wait for monitoring to be ready
        kubectl wait --for=condition=available --timeout=300s deployment/prometheus-grafana -n monitoring
        
        echo "Monitoring setup completed"
EOF
    
    success "Monitoring configured"
}

# Configure firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Create firewall rules
    if ! hcloud firewall describe ken-firewall &> /dev/null; then
        hcloud firewall create --name ken-firewall
        
        # SSH access
        hcloud firewall add-rule ken-firewall --direction in --source-ips 0.0.0.0/0 --protocol tcp --port 22
        
        # HTTP/HTTPS
        hcloud firewall add-rule ken-firewall --direction in --source-ips 0.0.0.0/0 --protocol tcp --port 80
        hcloud firewall add-rule ken-firewall --direction in --source-ips 0.0.0.0/0 --protocol tcp --port 443
        
        # K.E.N. API
        hcloud firewall add-rule ken-firewall --direction in --source-ips 0.0.0.0/0 --protocol tcp --port 8080
        
        # Monitoring
        hcloud firewall add-rule ken-firewall --direction in --source-ips 0.0.0.0/0 --protocol tcp --port 3000
        
        success "Firewall rules created"
    else
        warning "Firewall already exists"
    fi
    
    # Apply firewall to server
    hcloud firewall apply-to-resource ken-firewall --type server --server $SERVER_NAME
    success "Firewall applied to server"
}

# Get deployment info
get_deployment_info() {
    log "Getting deployment information..."
    
    SERVER_IP=$(hcloud server ip $SERVER_NAME)
    
    header "🚀 K.E.N. QUINTILLION SYSTEM DEPLOYMENT COMPLETE"
    
    echo -e "${CYAN}📊 Deployment Details:${NC}"
    echo "• Server Name: $SERVER_NAME"
    echo "• Server Type: $HETZNER_SERVER_TYPE (2 vCPU, 8GB RAM, 80GB SSD)"
    echo "• Location: $HETZNER_LOCATION (Ashburn, Virginia)"
    echo "• IP Address: $SERVER_IP"
    echo "• Monthly Cost: €17.99 (within €23.46 budget)"
    echo ""
    
    echo -e "${CYAN}🔗 Access URLs:${NC}"
    echo "• K.E.N. API: http://$SERVER_IP:8080"
    echo "• Grafana Monitoring: http://$SERVER_IP:3000 (admin/ken-quintillion-2025)"
    echo "• SSH Access: ssh -i ~/.ssh/ken_deployment root@$SERVER_IP"
    echo ""
    
    echo -e "${CYAN}⚡ System Specifications:${NC}"
    echo "• Version: $KEN_VERSION"
    echo "• Enhancement Factor: 1.73 QUINTILLION x"
    echo "• Algorithm Count: 49 algorithms"
    echo "• Database: Neon PostgreSQL (AWS us-east-2)"
    echo "• Kubernetes: K3s"
    echo "• Monitoring: Prometheus + Grafana"
    echo ""
    
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo "1. Initialize database: python3 database/init_database.py"
    echo "2. Test API endpoints: curl http://$SERVER_IP:8080/health"
    echo "3. Access monitoring: http://$SERVER_IP:3000"
    echo "4. Configure domain (optional): Point DNS to $SERVER_IP"
    echo ""
    
    success "Deployment information displayed"
}

# Main deployment function
main() {
    header "🚀 K.E.N. QUINTILLION SYSTEM - HETZNER DEPLOYMENT"
    
    log "Starting deployment of K.E.N. Quintillion System"
    log "Target: €23.46/month | Enhancement: 1.73 QUINTILLION x"
    
    check_dependencies
    setup_hetzner_cli
    create_ssh_key
    create_server
    install_k3s
    deploy_ken_system
    setup_monitoring
    setup_firewall
    get_deployment_info
    
    header "🎉 DEPLOYMENT SUCCESSFUL!"
    success "K.E.N. Quintillion System is now running on Hetzner Cloud"
}

# Run main function
main "$@"

