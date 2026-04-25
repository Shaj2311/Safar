## To make changes and re-deploy:

1. Make code changes

2. Create a new docker (following commands in AdminPanel directory)
```
cd frontend/AdminPanel
docker build -t us-central1-docker.pkg.dev/project-b054c456-52e8-4026-af3/my-repo/frontend-admin:latest .
```

3. Push to the artifact registry
`docker push us-central1-docker.pkg.dev/project-b054c456-52e8-4026-af3/my-repo/frontend-admin:latest`

4. Restart deployment
`kubectl rollout restart deployment safar-admin-frontend-deployment`
