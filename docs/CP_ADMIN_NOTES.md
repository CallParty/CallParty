# Call Party Administrative Notes

## Deployment

Deployments are handled automatically via Travis CI when commits are pushed to the appropriate branch. To deploy to staging, push commmits to the `staging` branch. To deploy to production, push to `prod`.

## staging
```bash
git checkout -b staging origin/staging; ./backend/bash/staging_deploy.sh
```

## production
```bash
git checkout -b prod origin/prod; ./backend/bash/prod_deploy.sh
```

## secret_files
If you make changes to `backend/devops/secret_files`, make sure to run `./backend/bash/update_secret_files.sh` and check the resulting file `backend/devops/secret_files.tar.enc` into git.
