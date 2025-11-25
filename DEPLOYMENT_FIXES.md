# NewsBuddy Deployment Fixes

## Critical Issues Fixed

### 1. Database Configuration Mismatch
**Problem**: Backend uses SQLite/Sequelize but Docker Compose expects MongoDB
**Fix**: 
- Updated `backend/package.json` to use `mongoose` instead of `sequelize`
- Created MongoDB-compatible User model
- Fixed database connection in `config/database.js`

### 2. ALB Health Check Issues
**Problem**: Target groups pointing to wrong ports and health endpoints
**Fix**:
- Frontend target group: Port 3000 with `/health` endpoint
- Backend target group: Port 5000 with `/health` endpoint
- Added health endpoint to frontend

### 3. Security Group Configuration
**Problem**: Missing port 3000 for frontend access
**Fix**: Added port 3000 to security group rules

### 4. Missing Dependencies
**Problem**: Backend missing MongoDB driver
**Fix**: Added `mongoose` to package.json, removed SQLite dependencies

## Files to Replace

1. **Replace** `aws/deploy_aws.py` with `aws/deploy_aws_fixed.py`
2. **Replace** `backend/package.json` with `backend/package_fixed.json`
3. **Replace** `backend/models/User.js` with `backend/models/User_fixed.js`
4. **Replace** `docker-compose.yml` with `docker-compose_fixed.yml`

## Step-by-Step Deployment

### 1. Update Files
```bash
# Replace the files with fixed versions
cp aws/deploy_aws_fixed.py aws/deploy_aws.py
cp backend/package_fixed.json backend/package.json
cp backend/models/User_fixed.js backend/models/User.js
cp docker-compose_fixed.yml docker-compose.yml
```

### 2. Update Backend Database Config
```bash
cat > backend/config/database.js << 'EOF'
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
EOF
```

### 3. Add Frontend Health Endpoint
```bash
mkdir -p frontend/public
echo '{"status":"OK","service":"frontend"}' > frontend/public/health
```

### 4. Install Backend Dependencies
```bash
cd backend
npm install mongoose
npm uninstall sequelize sqlite3
cd ..
```

### 5. Deploy to AWS
```bash
cd aws
python3 deploy_aws_fixed.py
```

## Debugging Commands

### SSH into EC2 Instance
```bash
ssh -i newsbuddy-key.pem ec2-user@<PUBLIC_IP>
```

### Check Docker Services
```bash
cd NewsBuddy
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Check Service Health
```bash
# Backend health
curl http://localhost:5000/health

# Frontend health  
curl http://localhost:3000/health

# MongoDB connection
docker exec -it newsbuddy-mongodb mongosh --eval "db.adminCommand('ping')"
```

### ALB Target Group Health
```bash
# Check target group health in AWS Console
# Or use AWS CLI:
aws elbv2 describe-target-health --target-group-arn <TARGET_GROUP_ARN>
```

## Common Issues & Solutions

### 1. 503 Service Unavailable from ALB
- **Cause**: Target groups unhealthy
- **Fix**: Check health check endpoints and service status
- **Debug**: `docker-compose logs` and `curl http://localhost:5000/health`

### 2. Backend Authentication Not Working
- **Cause**: Database connection issues
- **Fix**: Verify MongoDB is running and connection string is correct
- **Debug**: `docker-compose logs mongodb` and check MONGODB_URI

### 3. Frontend Not Loading
- **Cause**: Build issues or wrong API URL
- **Fix**: Check environment variables and build process
- **Debug**: `docker-compose logs frontend`

### 4. EC2 Instance Not Accessible
- **Cause**: Security group or userdata script issues
- **Fix**: Check security group rules and userdata execution
- **Debug**: SSH into instance and check `/var/log/cloud-init-output.log`

## Environment Variables Checklist

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/newsbuddy?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=<generated-secret>
NEWS_API_KEY=79571b9c95fa40fd81389f6f6e79ea6d
NEWSDATA_API_KEY=pub_bc7c0eb9ffb14c9badbce36ba8439fba
AWS_REGION=us-east-1
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

## Monitoring & Logs

### Application Logs
- Backend: `docker-compose logs backend`
- Frontend: `docker-compose logs frontend`
- MongoDB: `docker-compose logs mongodb`

### AWS Resources
- EC2 Instance: Check CloudWatch logs
- ALB: Monitor target group health
- Security Groups: Verify port access

## Performance Optimizations

1. **Instance Type**: Upgraded to t3.medium for better performance
2. **Storage**: Increased EBS volume to 30GB with gp3
3. **Health Checks**: Optimized intervals and timeouts
4. **Docker**: Added proper health checks and dependencies