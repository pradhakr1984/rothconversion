#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('\n' + '='.repeat(60));
console.log('\x1b[36m\x1b[1m🚀 Roth Conversion Optimizer\x1b[0m');
console.log('\x1b[90mStarting development server...\x1b[0m');
console.log('='.repeat(60) + '\n');

const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'pipe',
  shell: true
});

let portFound = false;

nextDev.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Clean up Next.js output and format it nicely
  if (output.includes('Port') && output.includes('is in use')) {
    console.log('\x1b[33m⚠️  Port busy, trying next available...\x1b[0m');
  } else if (output.includes('Local:')) {
    const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
    if (portMatch) {
      const port = portMatch[1];
      console.log('\x1b[32m\x1b[1m✅ Server Ready!\x1b[0m');
      console.log('\x1b[36m📍 Local: http://localhost:' + port + '\x1b[0m');
      console.log('\x1b[90m⏱️  Ready in ' + (output.match(/Ready in (\d+)ms/)?.[1] || 'unknown') + 'ms\x1b[0m');
      portFound = true;
    }
  } else if (output.includes('Ready')) {
    if (!portFound) {
      console.log('\x1b[32m\x1b[1m✅ Server Ready!\x1b[0m');
    }
  } else if (output.includes('▲ Next.js')) {
    // Skip the Next.js version line
  } else if (output.trim()) {
    console.log('\x1b[90m' + output.trim() + '\x1b[0m');
  }
});

nextDev.stderr.on('data', (data) => {
  console.log('\x1b[31m❌ Error:\x1b[0m', data.toString());
});

nextDev.on('close', (code) => {
  console.log('\x1b[33m\n🛑 Server stopped (code: ' + code + ')\x1b[0m');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\x1b[33m\n🛑 Shutting down server...\x1b[0m');
  nextDev.kill('SIGINT');
  process.exit(0);
}); 