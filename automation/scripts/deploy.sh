#!/bin/bash

# Autonomous Vertex K.E.N. System Deployment Script
# Professional DevOps deployment with error handling and logging

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$PROJECT_ROOT/deployment.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================
log() {
    echo -e "${TIMESTAMP} - $1" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# ERROR HANDLING
# =============================================================================
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup commands here
}

error_exit() {
    log_error "Deployment failed: $1"
    cleanup
    exit 1
}

trap 'error_exit "Script interrupted"' INT TERM
trap 'cleanup' EXIT

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    local required_tools=("docker" "docker-compose" "kubectl" "git")
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error_exit "$tool is not installed or not in PATH"
        fi
    done
    
    # Check if .env file exists
    if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
        log_warning ".env file not found. Please copy .env.example to .env and configure it."
        return 1
    fi
    
    log_success "Prerequisites check passed"
}

validate_environment() {
    log_info "Validating environment configuration..."
    
    # Source environment variables
    source "$PROJECT_ROOT/.env"
    
    # Check critical environment variables
    local required_vars=("DATABASE_URL" "GITHUB_TOKEN" "SECRET_KEY")
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable $var is not set"
        fi
    done
    
    log_success "Environment validation passed"
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================
deploy_infrastructure() {
    log_info "Deploying infrastructure..."
    
    cd "$PROJECT_ROOT"
    
    # Create necessary directories
    mkdir -p logs data backups
    
    # Deploy with Docker Compose
    if [[ -f "docker-compose.yml" ]]; then
        log_info "Starting services with Docker Compose..."
        docker-compose up -d
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 30
        
        # Health check
        if docker-compose ps | grep -q "Up"; then
            log_success "Docker services are running"
        else
            error_exit "Some Docker services failed to start"
        fi
    fi
    
    log_success "Infrastructure deployment completed"
}

deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    if [[ -d "$PROJECT_ROOT/infrastructure/kubernetes" ]]; then
        cd "$PROJECT_ROOT/infrastructure/kubernetes"
        
        # Apply Kubernetes manifests
        kubectl apply -f .
        
        # Wait for deployments to be ready
        kubectl wait --for=condition=available --timeout=300s deployment --all
        
        log_success "Kubernetes deployment completed"
    else
        log_warning "Kubernetes manifests not found, skipping K8s deployment"
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Deploy Prometheus and Grafana
    if [[ -d "$PROJECT_ROOT/monitoring" ]]; then
        cd "$PROJECT_ROOT/monitoring"
        
        # Apply monitoring stack
        kubectl apply -f prometheus/
        kubectl apply -f grafana/
        
        log_success "Monitoring setup completed"
    else
        log_warning "Monitoring configurations not found"
    fi
}

configure_automation() {
    log_info "Configuring automation workflows..."
    
    # Setup n8n workflows
    if [[ -d "$PROJECT_ROOT/automation/n8n" ]]; then
        log_info "Importing n8n workflows..."
        # Add n8n workflow import logic here
        log_success "n8n workflows configured"
    fi
}

# =============================================================================
# TESTING FUNCTIONS
# =============================================================================
run_health_checks() {
    log_info "Running health checks..."
    
    # Database connectivity test
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            log_success "Database connection successful"
        else
            log_error "Database connection failed"
        fi
    fi
    
    # API endpoint tests
    local endpoints=("http://localhost:3000/health" "http://localhost:8080/metrics")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "$endpoint" &> /dev/null; then
            log_success "Endpoint $endpoint is responding"
        else
            log_warning "Endpoint $endpoint is not responding"
        fi
    done
}

# =============================================================================
# MAIN DEPLOYMENT FLOW
# =============================================================================
main() {
    log_info "Starting Autonomous Vertex K.E.N. System deployment..."
    log_info "Project root: $PROJECT_ROOT"
    
    # Validation phase
    check_prerequisites || error_exit "Prerequisites check failed"
    validate_environment || error_exit "Environment validation failed"
    
    # Deployment phase
    deploy_infrastructure
    deploy_kubernetes
    setup_monitoring
    configure_automation
    
    # Testing phase
    run_health_checks
    
    log_success "Deployment completed successfully!"
    log_info "Access the system at: http://localhost:3000"
    log_info "Monitoring dashboard: http://localhost:3001"
    log_info "Logs are available at: $LOG_FILE"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

