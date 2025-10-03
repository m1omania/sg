# SolarGroup Deployment Guide

## Overview

This guide covers the deployment of the SolarGroup Investment Platform using various deployment strategies including Docker, Kubernetes, and cloud platforms.

## Prerequisites

### Required Tools

- **Docker** (20.10+)
- **Docker Compose** (2.0+)
- **kubectl** (1.20+)
- **Node.js** (20+)
- **npm** (8+)

### Optional Tools

- **AWS CLI** (for S3 backups)
- **Helm** (for Kubernetes package management)
- **Terraform** (for infrastructure as code)

## Deployment Strategies

### 1. Docker Compose (Development)

Best for local development and testing.

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services included:**
- SolarGroup App (Node.js)
- Nginx (Reverse Proxy)
- Prometheus (Monitoring)

### 2. Kubernetes (Production)

Best for production environments with high availability.

#### Quick Deploy

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n solar-group

# Access application
kubectl port-forward svc/solar-group-service 3000:80 -n solar-group
```

#### Using Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh staging v1.0.0

# Deploy to production
./scripts/deploy.sh production v1.0.0

# Rollback if needed
./scripts/deploy.sh rollback
```

### 3. Cloud Platforms

#### Render

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

#### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster --name solar-group --region us-west-2

# Deploy application
kubectl apply -f k8s/

# Configure load balancer
kubectl apply -f k8s/ingress.yaml
```

#### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create solar-group --zone us-central1-a

# Deploy application
kubectl apply -f k8s/

# Configure ingress
kubectl apply -f k8s/ingress.yaml
```

## Environment Configuration

### Environment Variables

Create `.env` file for local development:

```env
# Database
DATABASE_PATH=server/database.sqlite
DB_CONNECTION_POOL_SIZE=10
DB_QUERY_TIMEOUT=30000

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Monitoring
ENABLE_MONITORING=true
METRICS_PORT=9090
ALERT_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# Backup
BACKUP_S3_BUCKET=solar-group-backups
BACKUP_RETENTION_DAYS=30
```

### Production Environment

For production, use Kubernetes secrets:

```bash
# Create secret
kubectl create secret generic solar-group-secrets \
  --from-literal=JWT_SECRET=your-production-jwt-secret \
  --from-literal=BCRYPT_ROUNDS=12 \
  --from-literal=DB_PASSWORD=your-db-password

# Create configmap
kubectl create configmap solar-group-config \
  --from-literal=NODE_ENV=production \
  --from-literal=PORT=3000 \
  --from-literal=FRONTEND_URL=https://solar-group.com
```

## Database Management

### Migrations

```bash
# Run migrations
npm run migrate

# Check migration status
npm run migrate:status

# Validate migrations
npm run migrate:validate
```

### Backups

```bash
# Create backup
./scripts/backup.sh full

# List backups
./scripts/backup.sh list

# Restore from backup
./scripts/backup.sh restore /path/to/backup.sqlite.gz
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check application health
./scripts/monitor.sh health

# Check Kubernetes resources
./scripts/monitor.sh k8s

# Generate monitoring report
./scripts/monitor.sh report
```

### Log Management

```bash
# View logs
./scripts/monitor.sh logs 100

# Cleanup old logs
./scripts/monitor.sh cleanup 7
```

### Performance Testing

```bash
# Run performance test
./scripts/monitor.sh test 60 10

# Check system resources
./scripts/monitor.sh system
```

## Security Considerations

### Production Security

1. **Use HTTPS**: Configure SSL/TLS certificates
2. **Secure Secrets**: Use Kubernetes secrets or external secret management
3. **Network Policies**: Implement network segmentation
4. **Regular Updates**: Keep dependencies updated
5. **Monitoring**: Set up security monitoring and alerting

### Security Headers

The application includes security headers via Helmet:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## Scaling

### Horizontal Scaling

```bash
# Scale application
kubectl scale deployment solar-group-app --replicas=3 -n solar-group

# Auto-scaling
kubectl apply -f k8s/hpa.yaml
```

### Vertical Scaling

```bash
# Update resource limits
kubectl patch deployment solar-group-app -n solar-group -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","resources":{"limits":{"memory":"1Gi","cpu":"500m"}}}]}}}}'
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   kubectl exec -it deployment/solar-group-app -n solar-group -- sqlite3 /app/database.sqlite ".tables"
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   kubectl top pods -n solar-group
   ```

3. **Network Issues**
   ```bash
   # Check service endpoints
   kubectl get endpoints -n solar-group
   ```

### Debugging

```bash
# Get pod logs
kubectl logs -f deployment/solar-group-app -n solar-group

# Execute into pod
kubectl exec -it deployment/solar-group-app -n solar-group -- /bin/bash

# Check events
kubectl get events -n solar-group --sort-by='.lastTimestamp'
```

## CI/CD Pipeline

### GitHub Actions

The project includes a CI/CD pipeline that:

1. Runs tests on pull requests
2. Builds Docker images
3. Deploys to staging on merge to develop
4. Deploys to production on merge to main

### Manual Deployment

```bash
# Build and push image
docker build -t solar-group:latest .
docker tag solar-group:latest your-registry/solar-group:latest
docker push your-registry/solar-group:latest

# Deploy to Kubernetes
kubectl set image deployment/solar-group-app app=your-registry/solar-group:latest -n solar-group
```

## Disaster Recovery

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Application Backups**: Weekly full backups
3. **Configuration Backups**: Version controlled in Git
4. **Monitoring Data**: Retained for 30 days

### Recovery Procedures

1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Redeploy from Git
3. **Full Recovery**: Follow disaster recovery runbook

## Performance Optimization

### Database Optimization

- Query optimization with indexes
- Connection pooling
- Query caching
- Regular VACUUM operations

### Application Optimization

- Node.js clustering
- Memory management
- Request compression
- Static asset optimization

### Infrastructure Optimization

- Load balancing
- CDN for static assets
- Caching layers
- Database read replicas

## Monitoring and Alerting

### Metrics Collected

- Application performance metrics
- Database performance metrics
- System resource metrics
- Business metrics

### Alerting Rules

- High error rates (>5%)
- High response times (>2s)
- Low memory availability (<20%)
- Database connection issues

### Dashboards

- Real-time monitoring dashboard
- Performance trends
- Alert management
- System overview

## Support and Maintenance

### Regular Maintenance

- Weekly security updates
- Monthly dependency updates
- Quarterly performance reviews
- Annual security audits

### Support Contacts

- **Development Team**: dev@solar-group.com
- **DevOps Team**: devops@solar-group.com
- **Security Team**: security@solar-group.com

## Conclusion

This deployment guide provides comprehensive instructions for deploying and maintaining the SolarGroup Investment Platform. Follow the appropriate sections based on your deployment strategy and environment requirements.

For additional support or questions, please refer to the project documentation or contact the development team.
