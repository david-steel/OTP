import { uploadFile, getFile, deleteFile, storageAvailable } from '../src/config/storage.js';

async function main() {
  console.log('R2 configured:', storageAvailable());
  console.log('Uploading test file...');
  await uploadFile('test/connection-test.json', JSON.stringify({ test: true, timestamp: new Date().toISOString() }));
  console.log('Upload OK. Reading back...');
  const content = await getFile('test/connection-test.json');
  console.log('Read OK:', content);
  await deleteFile('test/connection-test.json');
  console.log('Cleanup OK. R2 is working!');
}

main().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
