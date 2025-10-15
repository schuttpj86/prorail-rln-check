# GitHub Pages Setup - ProRail RLN Check

## ✅ Deployment Configuration Complete!

Your ProRail Cable Route Evaluator is ready to be deployed to GitHub Pages.

## 🔧 What Was Done

1. **Updated `vite.config.js`**
   - Added `base: '/prorail-rln-check/'` for correct asset paths on GitHub Pages

2. **Created GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Automatically builds and deploys on every push to `main` branch
   - Uses Node.js 20 and npm
   - Builds the Vite app in `cable-route-evaluator/dist`
   - Deploys to GitHub Pages

## 📋 Final Steps (One-Time Setup)

You need to enable GitHub Pages in your repository settings:

### Option 1: Using GitHub Web Interface
1. Go to: https://github.com/schuttpj86/prorail-rln-check/settings/pages
2. Under **"Source"**, select **"GitHub Actions"**
3. Click **"Save"**

### Option 2: I Can Do It Via GitHub API
If you want, I can enable it programmatically using the GitHub MCP tools.

## 🚀 After Enabling GitHub Pages

Once enabled, the workflow will run automatically and your app will be live at:

### 🌐 **Live URL**: https://schuttpj86.github.io/prorail-rln-check/

## 📊 Monitoring Deployment

- View workflow runs: https://github.com/schuttpj86/prorail-rln-check/actions
- First deployment takes ~2-3 minutes
- Subsequent deployments are faster

## 🔄 How It Works

Every time you push to the `main` branch:
1. GitHub Actions automatically triggers
2. Installs dependencies (`npm ci`)
3. Builds the production app (`npm run build`)
4. Deploys to GitHub Pages
5. Your live site updates within minutes!

## 🧪 Testing Locally with Production Settings

To test the production build locally:

```bash
cd cable-route-evaluator
npm run build
npm run preview
```

This will serve the built files on http://localhost:4173/prorail-rln-check/

## 📝 Important Notes

- The app uses ArcGIS Maps SDK which requires internet connection
- All routes and evaluations are stored in browser localStorage
- Data is not synced across devices
- Clear browser cache if experiencing issues after updates

## 🎯 Next Steps

1. **Enable GitHub Pages** in repository settings (see above)
2. Wait for the workflow to complete (~2-3 minutes)
3. Visit your live site at the URL above
4. Share the link with your team!

## 🔧 Troubleshooting

### If deployment fails:
- Check the Actions tab for error messages
- Ensure repository has Pages enabled
- Verify npm dependencies are up to date

### If app doesn't load:
- Check browser console for errors
- Verify ArcGIS SDK is accessible
- Clear browser cache and reload

### If assets don't load:
- Verify `base` path in `vite.config.js` matches repository name
- Check that build process completed successfully

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Status**: ✅ Configuration Complete - Waiting for Pages to be enabled
**Live URL**: https://schuttpj86.github.io/prorail-rln-check/ (after enabling)
**Repository**: https://github.com/schuttpj86/prorail-rln-check
