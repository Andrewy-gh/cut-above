Current getting this issue when I building from root `Dockerfile`
```bash
 => ERROR [client-build 4/6] RUN pnpm install --frozen-lockfile --include-dev                                                        1.4s
------
 > [client-build 4/6] RUN pnpm install --frozen-lockfile --include-dev:
1.272  ERROR  Unknown option: 'include-dev'
1.272 Did you mean 'include-workspace-root'? Use "--config.unknown=value" to force an unknown option.
1.274 For help, run: pnpm help install
------
Dockerfile:22
--------------------
  20 |     WORKDIR /app/client
  21 |     # Install all dependencies including devDependencies for build tools like vite
  22 | >>> RUN pnpm install --frozen-lockfile --include-dev
  23 |     COPY client/ .
  24 |     RUN pnpm run build
--------------------
ERROR: failed to solve: process "/bin/sh -c pnpm install --frozen-lockfile --include-dev" did not complete successfully: exit code: 1

View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/xq7ewy0xzqjxklxgkc1qx89ze
```
