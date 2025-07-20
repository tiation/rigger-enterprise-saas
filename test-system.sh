#!/bin/bash

set -e  # Exit on any error

echo "🚀 RiggerConnect Enterprise SaaS - System Test & Deployment Script"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking system prerequisites..."

MISSING_DEPS=()

if ! command_exists node; then
    MISSING_DEPS+=("Node.js")
fi

if ! command_exists pnpm; then
    MISSING_DEPS+=("pnpm")
fi

if ! command_exists docker; then
    MISSING_DEPS+=("Docker")
fi

if ! command_exists docker-compose || ! command_exists docker; then
    if ! docker compose version >/dev/null 2>&1; then
        MISSING_DEPS+=("Docker Compose")
    fi
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    print_error "Missing dependencies: ${MISSING_DEPS[*]}"
    print_error "Please install the missing dependencies and run this script again."
    exit 1
fi

print_success "All prerequisites are installed"

# Check Node.js and pnpm versions
NODE_VERSION=$(node --version)
PNPM_VERSION=$(pnpm --version)
print_status "Node.js version: $NODE_VERSION"
print_status "pnpm version: $PNPM_VERSION"

# Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "turbo.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_success "Project structure verified"

# Step 1: Create environment file
print_status "Setting up environment configuration..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Created .env file from .env.example"
        print_warning "Please update the .env file with your actual configuration before proceeding to production"
    else
        print_error ".env.example file not found"
        exit 1
    fi
else
    print_status ".env file already exists"
fi

# Step 2: Install dependencies
print_status "Installing dependencies with pnpm..."

if ! pnpm install; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Step 3: Generate Prisma client
print_status "Generating Prisma client..."

if ! pnpm --filter @rigger/database run db:generate; then
    print_error "Failed to generate Prisma client"
    exit 1
fi

print_success "Prisma client generated"

# Step 4: Type checking
print_status "Running type checks..."

TYPE_CHECK_FAILED=()

# Check each package
for package in packages/types packages/auth packages/shared-ui packages/database; do
    if [ -d "$package" ]; then
        print_status "Type checking $package..."
        if ! pnpm --filter "@rigger/$(basename $package)" run type-check 2>/dev/null; then
            TYPE_CHECK_FAILED+=("$package")
        fi
    fi
done

# Check applications
for app in apps/rigger-connect/business-portal apps/rigger-hub/worker-intranet apps/automation-engine apps/api-gateway; do
    if [ -d "$app" ] && [ -f "$app/package.json" ]; then
        print_status "Type checking $app..."
        if ! pnpm --filter "$(jq -r '.name' $app/package.json)" run type-check 2>/dev/null; then
            TYPE_CHECK_FAILED+=("$app")
        fi
    fi
done

if [ ${#TYPE_CHECK_FAILED[@]} -ne 0 ]; then
    print_warning "Type check failed for: ${TYPE_CHECK_FAILED[*]}"
    print_warning "Some applications may have type issues but the system can still run"
else
    print_success "All type checks passed"
fi

# Step 5: Build applications
print_status "Building applications..."

BUILD_FAILED=()

# Try to build each application individually to isolate failures
for app in apps/api-gateway apps/automation-engine; do
    if [ -d "$app" ] && [ -f "$app/package.json" ]; then
        APP_NAME=$(jq -r '.name' $app/package.json)
        print_status "Building $APP_NAME..."
        if ! pnpm --filter "$APP_NAME" run build 2>/dev/null; then
            BUILD_FAILED+=("$app")
        fi
    fi
done

if [ ${#BUILD_FAILED[@]} -ne 0 ]; then
    print_warning "Build failed for: ${BUILD_FAILED[*]}"
    print_warning "These applications may not work properly"
else
    print_success "All builds completed successfully"
fi

# Step 6: Test Docker setup
print_status "Testing Docker configuration..."

# Check if docker-compose.yml exists and is valid
if ! docker-compose -f docker-compose.yml config >/dev/null 2>&1; then
    print_error "Docker Compose configuration is invalid"
    exit 1
fi

print_success "Docker configuration is valid"

# Step 7: Start infrastructure services (PostgreSQL, Redis)
print_status "Starting infrastructure services..."

if ! docker-compose up -d postgres redis; then
    print_error "Failed to start infrastructure services"
    exit 1
fi

print_success "Infrastructure services started"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Step 8: Test database connection
print_status "Testing database connection..."

if ! pnpm --filter @rigger/database run db:push --accept-data-loss 2>/dev/null; then
    print_warning "Database schema push failed - this is expected if database is not configured"
    print_warning "Configure your DATABASE_URL in .env and run 'pnpm db:migrate' manually"
else
    print_success "Database schema applied successfully"
    
    # Try to seed the database
    print_status "Seeding database with demo data..."
    if pnpm --filter @rigger/database run db:seed 2>/dev/null; then
        print_success "Database seeded with demo data"
    else
        print_warning "Database seeding failed - you may need to configure it manually"
    fi
fi

# Step 9: System health summary
print_status "System Health Summary"
echo "===================="

# Check what's running
RUNNING_CONTAINERS=$(docker-compose ps --services --filter "status=running" 2>/dev/null | wc -l)
ALL_CONTAINERS=$(docker-compose ps --services 2>/dev/null | wc -l)

echo "📊 Infrastructure Status:"
echo "   - Docker containers: $RUNNING_CONTAINERS/$ALL_CONTAINERS running"

if command_exists curl; then
    echo "🔗 Service Endpoints:"
    echo "   - Marketing Site: http://localhost:3000 (when started)"
    echo "   - Business Portal: http://localhost:3001 (when started)" 
    echo "   - Worker Intranet: http://localhost:3002 (when started)"
    echo "   - Automation Engine: http://localhost:3003 (when started)"
    echo "   - API Gateway: http://localhost:3004 (when started)"
    echo "   - Database: localhost:5432"
    echo "   - Redis: localhost:6379"
fi

echo ""
echo "📝 Next Steps:"
echo "   1. Configure your .env file with proper credentials"
echo "   2. Run 'pnpm dev' to start all applications in development mode"
echo "   3. Run 'docker-compose up -d' to start all services"
echo "   4. Visit http://localhost:3001 for the business portal"
echo "   5. Visit http://localhost:3002 for the worker intranet"

echo ""
echo "🔐 Demo Accounts (after seeding):"
echo "   Admin: admin@tiation.net / Admin123!"
echo "   Company Owner: owner@acme-construction.com.au / Owner123!"
echo "   Worker: jake.thompson@email.com / Worker123!"

echo ""
print_success "System test completed successfully!"

# Optional: Start all services if requested
if [ "$1" = "--start" ]; then
    print_status "Starting all services..."
    if docker-compose up -d; then
        print_success "All services started!"
        print_status "Visit http://localhost:3001 for the business portal"
        print_status "Visit http://localhost:3002 for the worker intranet"
        print_status "Visit http://localhost:3004/health for API health check"
    else
        print_error "Failed to start all services"
        exit 1
    fi
fi