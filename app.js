import('./dist/server-core.js').catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
