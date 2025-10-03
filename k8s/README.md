# Kubernetes Manifests

This directory contains Kubernetes manifests for deploying the SolarGroup Investment Platform.

## Files Overview

### Core Application
- `namespace.yaml` - Creates the `solar-group` namespace
- `configmap.yaml` - Non-sensitive configuration data
- `secret.yaml` - Sensitive configuration data (passwords, keys)
- `deployment.yaml` - Application deployment configuration
- `service.yaml` - Service definition for internal communication

### Scaling & Availability
- `hpa.yaml` - Horizontal Pod Autoscaler for automatic scaling
- `pdb.yaml` - Pod Disruption Budget for high availability

### Networking & Security
- `ingress.yaml` - Ingress configuration for external access
- `network-policy.yaml` - Network policies for security

### Monitoring
- `servicemonitor.yaml` - Prometheus ServiceMonitor for metrics collection

## Quick Start

### Prerequisites

1. **kubectl** configured to access your Kubernetes cluster
2. **Docker image** built and pushed to a registry
3. **Environment variables** configured in `secret.yaml`

### Deploy Application

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n solar-group

# View logs
kubectl logs -f deployment/solar-group-app -n solar-group
```

### Access Application

```bash
# Port forward to local machine
kubectl port-forward svc/solar-group-service 3000:80 -n solar-group

# Access via browser
open http://localhost:3000
```

## Configuration

### Environment Variables

Update `secret.yaml` with your production values:

```yaml
data:
  JWT_SECRET: <base64-encoded-secret>
  BCRYPT_ROUNDS: <base64-encoded-number>
  DB_PASSWORD: <base64-encoded-password>
```

### Image Configuration

Update `deployment.yaml` with your image registry:

```yaml
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-registry/solar-group:latest
```

### Resource Limits

Adjust resource requests and limits in `deployment.yaml`:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Scaling

### Manual Scaling

```bash
# Scale to 3 replicas
kubectl scale deployment solar-group-app --replicas=3 -n solar-group
```

### Automatic Scaling

The HPA (Horizontal Pod Autoscaler) automatically scales based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)

### Scaling Configuration

Update `hpa.yaml` to modify scaling behavior:

```yaml
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
```

## Monitoring

### Health Checks

The application includes health check endpoints:
- `/api/health` - Basic health check
- `/api/monitoring/health` - Detailed health status

### Metrics

Prometheus metrics are available at:
- `/api/monitoring/metrics` - Application metrics
- Port 9090 - Prometheus scraping endpoint

### Logs

View application logs:

```bash
# All logs
kubectl logs -f deployment/solar-group-app -n solar-group

# Previous container logs
kubectl logs -f deployment/solar-group-app -n solar-group --previous
```

## Security

### Network Policies

The `network-policy.yaml` restricts network traffic:
- Ingress: Only from ingress-nginx and monitoring namespaces
- Egress: DNS, HTTPS, and monitoring traffic only

### Secrets Management

- Use Kubernetes secrets for sensitive data
- Consider external secret management (e.g., HashiCorp Vault)
- Rotate secrets regularly

### RBAC

For production, consider adding RBAC:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: solar-group
  name: solar-group-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
```

## Troubleshooting

### Common Issues

1. **Pod not starting**
   ```bash
   kubectl describe pod <pod-name> -n solar-group
   kubectl logs <pod-name> -n solar-group
   ```

2. **Service not accessible**
   ```bash
   kubectl get svc -n solar-group
   kubectl get endpoints -n solar-group
   ```

3. **Ingress not working**
   ```bash
   kubectl get ingress -n solar-group
   kubectl describe ingress solar-group-ingress -n solar-group
   ```

### Debug Commands

```bash
# Check all resources
kubectl get all -n solar-group

# Check events
kubectl get events -n solar-group --sort-by='.lastTimestamp'

# Execute into pod
kubectl exec -it deployment/solar-group-app -n solar-group -- /bin/bash

# Check resource usage
kubectl top pods -n solar-group
```

## Production Considerations

### High Availability

- Deploy across multiple availability zones
- Use anti-affinity rules for pod distribution
- Configure proper resource requests and limits

### Performance

- Enable horizontal pod autoscaling
- Use CDN for static assets
- Configure proper caching strategies

### Security

- Use network policies
- Implement RBAC
- Regular security updates
- Monitor for vulnerabilities

### Backup & Recovery

- Regular database backups
- Test disaster recovery procedures
- Document recovery processes

## Maintenance

### Updates

```bash
# Update image
kubectl set image deployment/solar-group-app app=your-registry/solar-group:v2.0.0 -n solar-group

# Check rollout status
kubectl rollout status deployment/solar-group-app -n solar-group

# Rollback if needed
kubectl rollout undo deployment/solar-group-app -n solar-group
```

### Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Delete namespace
kubectl delete namespace solar-group
```

## Support

For issues or questions:
- Check the main project README
- Review the deployment documentation
- Contact the development team
