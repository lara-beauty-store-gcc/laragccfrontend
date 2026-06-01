# laragccfrontend

Frontend dyal Lara Beauty Store GCC — deploy 3la [EasyPanel](https://easypanel.io).

## 3lach EasyPanel kaygoul "branch not found"?

Had l-repo **private** f GitHub (`lara-beauty-store-gcc/laragccfrontend`). Ila ma connectitich GitHub f EasyPanel b token li 3ndo access l had repo, EasyPanel **ma kay9drch y9ra les branches** — w kayban lik `branch not found` même ila `main` kayna.

### Fix (darouri)

1. **GitHub → Settings → Developer settings → Personal access tokens**
   - Classic: scope `repo` (w `admin:repo_hook` ila bghiti auto-deploy)
   - Fine-grained: zid repo `lara-beauty-store-gcc/laragccfrontend` f **Select repositories** + permission **Contents: Read-only**
2. **EasyPanel → Settings → GitHub** — paste token, verify "Github connected"
3. **Create App → Source: GitHub**
   - Repository: `lara-beauty-store-gcc/laragccfrontend`
   - Branch: `main` (b **minuscules**, bla espaces)
   - Build: Dockerfile (kayna f root)

### Repo URL (ila custom git)

```
https://github.com/lara-beauty-store-gcc/laragccfrontend.git
```

Branch: `main`

## Database f EasyPanel

1. Create service **MySQL** (wla PostgreSQL) f nfs l-project
2. F l-App → **Environment**, copy mn `.env.example`:
   - `DB_HOST` = **service name** dyal MySQL f EasyPanel (ex: `mysql`, `laragcc_mysql`)
   - `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` = values li 3tatek EasyPanel f MySQL service
3. Redeploy l-app

## Push code

```bash
git add .
git commit -m "your message"
git push origin main
```

## Structure

| File | Role |
|------|------|
| `Dockerfile` | Build image f EasyPanel |
| `public/` | Static files (placeholder daba) |
| `.env.example` | Variables DB / app |

Zid Laravel, Vue, wla React f had repo w push — EasyPanel ghadi yrebuild automatiquement ila auto-deploy enabled.
