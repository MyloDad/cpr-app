// Save this as setup-audio-files.js in your project root
const fs = require('fs');
const path = require('path');

// Define paths
const SOURCE_AUDIO_DIR = path.join(__dirname, 'public', 'audio');
const IOS_AUDIO_DIR = path.join(__dirname, 'ios', 'App', 'App', 'audio');
const ANDROID_AUDIO_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public', 'audio');

// Create directories if they don't exist
console.log('Creating audio directories...');
[IOS_AUDIO_DIR, ANDROID_AUDIO_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Function to copy files recursively
function copyFilesRecursively(sourceDir, iosDir, androidDir) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    return;
  }
  
  const items = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  items.forEach(item => {
    const sourcePath = path.join(sourceDir, item.name);
    const iosPath = path.join(iosDir, item.name);
    const androidPath = path.join(androidDir, item.name);
    
    if (item.isDirectory()) {
      // Create subdirectories
      if (!fs.existsSync(iosPath)) {
        fs.mkdirSync(iosPath, { recursive: true });
      }
      if (!fs.existsSync(androidPath)) {
        fs.mkdirSync(androidPath, { recursive: true });
      }
      
      // Recursively copy subdirectories
      copyFilesRecursively(sourcePath, iosPath, androidPath);
    } else {
      // Only copy audio files
      if (['.mp3', '.wav', '.aac', '.m4a'].includes(path.extname(item.name).toLowerCase())) {
        // Copy to iOS
        fs.copyFileSync(sourcePath, iosPath);
        console.log(`Copied to iOS: ${item.name}`);
        
        // Copy to Android
        fs.copyFileSync(sourcePath, androidPath);
        console.log(`Copied to Android: ${item.name}`);
      }
    }
  });
}

// Start copying files
console.log('Copying audio files...');
copyFilesRecursively(SOURCE_AUDIO_DIR, IOS_AUDIO_DIR, ANDROID_AUDIO_DIR);

console.log('Audio file setup complete!');