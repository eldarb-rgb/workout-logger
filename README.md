# Workout Logger

An AI-powered workout tracking app built with Next.js, Claude API, and Vercel.

## Features

- 📱 Mobile-optimized interface
- 🏋️ 5x5 strength training tracking
- 🏃 Zone 2 cardio logging with photo upload
- 🤖 AI coaching feedback (Inigo San Millán for cardio, Mike Rippetoe for strength)
- 📊 Week-to-week progression tracking
- 📥 CSV export to Google Drive

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with your Anthropic API key:
   ```
   NEXT_PUBLIC_ANTHROPIC_API_KEY=your-api-key-here
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Push to GitHub (instructions below)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variable:
   - Name: `NEXT_PUBLIC_ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
6. Click Deploy

Your app will be live at: `your-username-workout-log.vercel.app`

## Pushing to GitHub

1. Initialize git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repo on GitHub.com (name it "workout-logger")

3. Push to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/workout-logger.git
   git push -u origin main
   ```

## Built With

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Claude API](https://anthropic.com/)
- [Lucide React Icons](https://lucide.dev/)

## License

MIT
