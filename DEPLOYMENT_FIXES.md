# Deployment Fixes for SolarGroup Investment Platform

## Issues Fixed

### 1. Express Slow Down Warning
**Problem**: Warning about `delayMs` option behavior change in express-slow-down v2
**Solution**: Updated configuration to use function syntax and disabled validation warning

```javascript
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 500, // Changed to function
  maxDelayMs: 20000,
  validate: {
    delayMs: false // Disabled warning
  }
});
```

### 2. Bcrypt Architecture Compatibility
**Problem**: `bcrypt` module compiled for different architecture causing "invalid ELF header" error
**Solution**: Replaced `bcrypt` with `bcryptjs` (pure JavaScript implementation)

**Changes made:**
- Updated `package.json`: `"bcrypt": "^5.1.0"` → `"bcryptjs": "^2.4.3"`
- Updated import: `const bcrypt = require('bcrypt')` → `const bcrypt = require('bcryptjs')`
- No API changes needed - bcryptjs has identical interface

### 3. Node.js Version Consistency
**Problem**: Potential version mismatches between development and production
**Solution**: Added `.nvmrc` file and updated Dockerfile

**Files updated:**
- `.nvmrc`: Specifies Node.js 20.18.0
- `Dockerfile`: Updated to use specific Node.js version
- `render.yaml`: Updated build command to use `npm ci --production`

### 4. Build Optimization
**Problem**: Inefficient Docker builds and deployment
**Solution**: Added `.dockerignore` and optimized build process

**Files added:**
- `.dockerignore`: Excludes unnecessary files from Docker build
- `scripts/check-compatibility.js`: Pre-deployment compatibility check

## Deployment Instructions

### For Render.com

1. **Push changes to repository**
   ```bash
   git add .
   git commit -m "fix: resolve deployment issues with bcrypt and express-slow-down"
   git push origin main
   ```

2. **Render will automatically redeploy** with the fixes

### For Docker

1. **Build new image**
   ```bash
   docker build -t solar-group:latest .
   ```

2. **Run container**
   ```bash
   docker run -d -p 3000:3000 --name solar-group solar-group:latest
   ```

### For Kubernetes

1. **Apply updated manifests**
   ```bash
   kubectl apply -f k8s/
   ```

2. **Check deployment status**
   ```bash
   kubectl get pods -n solar-group
   kubectl logs -f deployment/solar-group-app -n solar-group
   ```

## Verification

### Check Compatibility
```bash
cd server
npm run check
```

### Test Locally
```bash
# Install dependencies
cd server
npm install

# Run compatibility check
npm run check

# Start server
npm start
```

### Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Environment Variables

Ensure these environment variables are set in production:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
DATABASE_PATH=/app/database.sqlite
FRONTEND_URL=https://your-domain.com
```

## Troubleshooting

### If bcrypt error persists
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version:
   ```bash
   node --version
   # Should be 20.18.0 or compatible
   ```

### If express-slow-down warning appears
The warning is now disabled, but if it appears:
1. Check that `validate: { delayMs: false }` is set
2. Ensure `delayMs` is a function: `delayMs: () => 500`

### If deployment fails
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Run compatibility check locally
4. Check database file permissions

## Performance Impact

### Bcryptjs vs Bcrypt
- **bcryptjs**: Pure JavaScript, slower but more compatible
- **bcrypt**: Native C++, faster but architecture-dependent
- **Impact**: Minimal for typical usage, bcryptjs is sufficient for most applications

### Express Slow Down
- No performance impact from the fix
- Warning suppression improves log readability
- Function syntax is more flexible for future enhancements

## Security Considerations

### Bcryptjs Security
- Same security level as bcrypt
- Uses same bcrypt algorithm
- Slightly slower, which can actually improve security against brute force attacks

### Rate Limiting
- All rate limiting functionality preserved
- Configuration is now more explicit and maintainable
- No security impact from the changes

## Monitoring

After deployment, monitor:
1. **Application logs** for any new errors
2. **Performance metrics** to ensure no degradation
3. **Authentication success rate** to verify bcryptjs is working
4. **Rate limiting effectiveness** to ensure slow-down is working

## Rollback Plan

If issues occur:
1. **Revert to previous commit** with working bcrypt
2. **Update package.json** to use bcrypt instead of bcryptjs
3. **Redeploy** with previous configuration

However, the current fixes should resolve all deployment issues without requiring rollback.
