#!/bin/bash

# Docker helper script for BMS project
# Usage: ./docker-helper.sh [start|stop|restart|logs|shell|migrate|makemigrations|createsuperuser]

set -e

# Define colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Config
COMPOSE_FILE="docker-compose.dev.yml"
PROD_COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="web"

function show_help() {
    echo -e "${GREEN}BMS Docker Helper Script${NC}"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start          - Start development environment"
    echo "  stop           - Stop development environment"
    echo "  restart        - Restart development environment"
    echo "  prod           - Start production environment"
    echo "  logs           - View logs from backend container"
    echo "  frontend-logs  - View logs from frontend container"
    echo "  db-logs        - View logs from database container"
    echo "  shell          - Open a shell in the backend container"
    echo "  psql           - Connect to the database with psql"
    echo "  migrate        - Run Django migrations"
    echo "  makemigrations - Create new Django migrations"
    echo "  collectstatic  - Collect static files"
    echo "  createsuperuser - Create a Django superuser"
    echo "  test           - Run Django tests"
    echo "  help           - Show this help message"
    echo ""
}

# Function to check if containers are running
function is_running() {
    if [ -z "$(docker-compose -f $COMPOSE_FILE ps -q $SERVICE_NAME 2>/dev/null)" ]; then
        return 1
    else
        return 0
    fi
}

# Main logic
case "$1" in
    start)
        echo -e "${GREEN}Starting development environment...${NC}"
        docker-compose -f $COMPOSE_FILE up -d
        echo -e "${GREEN}Development environment started!${NC}"
        echo -e "${YELLOW}Backend:  ${NC}http://localhost:8000"
        echo -e "${YELLOW}Frontend: ${NC}http://localhost:3000"
        ;;
    
    stop)
        echo -e "${GREEN}Stopping development environment...${NC}"
        docker-compose -f $COMPOSE_FILE down
        echo -e "${GREEN}Development environment stopped!${NC}"
        ;;
    
    restart)
        echo -e "${GREEN}Restarting development environment...${NC}"
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $COMPOSE_FILE up -d
        echo -e "${GREEN}Development environment restarted!${NC}"
        ;;
    
    prod)
        echo -e "${GREEN}Starting production environment...${NC}"
        docker-compose -f $PROD_COMPOSE_FILE up -d
        echo -e "${GREEN}Production environment started!${NC}"
        ;;
    
    logs)
        echo -e "${GREEN}Showing logs from backend container...${NC}"
        docker-compose -f $COMPOSE_FILE logs -f $SERVICE_NAME
        ;;
    
    frontend-logs)
        echo -e "${GREEN}Showing logs from frontend container...${NC}"
        docker-compose -f $COMPOSE_FILE logs -f frontend
        ;;
    
    db-logs)
        echo -e "${GREEN}Showing logs from database container...${NC}"
        docker-compose -f $COMPOSE_FILE logs -f db
        ;;
    
    shell)
        echo -e "${GREEN}Opening shell in backend container...${NC}"
        docker-compose -f $COMPOSE_FILE exec $SERVICE_NAME bash
        ;;
    
    psql)
        echo -e "${GREEN}Connecting to PostgreSQL database...${NC}"
        docker-compose -f $COMPOSE_FILE exec db psql -U postgres
        ;;
    
    migrate)
        echo -e "${GREEN}Running migrations...${NC}"
        docker-compose -f $COMPOSE_FILE exec $SERVICE_NAME python manage.py migrate
        echo -e "${GREEN}Migrations complete!${NC}"
        ;;
    
    makemigrations)
        echo -e "${GREEN}Creating migrations...${NC}"
        docker-compose -f $COMPOSE_FILE exec $SERVICE_NAME python manage.py makemigrations
        echo -e "${GREEN}Migrations created!${NC}"
        ;;
    
    collectstatic)
        echo -e "${GREEN}Collecting static files...${NC}"
        docker-compose -f $COMPOSE_FILE exec $SERVICE_NAME python manage.py collectstatic --noinput
        echo -e "${GREEN}Static files collected!${NC}"
        ;;
    
    createsuperuser)
        echo -e "${GREEN}Creating superuser...${NC}"
        docker-compose -f $COMPOSE_FILE exec $SERVICE_NAME python manage.py createsuperuser
        ;;
    
    test)
        echo -e "${GREEN}Running tests...${NC}"
        docker-compose -f $COMPOSE_FILE exec $SERVICE_NAME python manage.py test
        ;;
    
    help|*)
        show_help
        ;;
esac
