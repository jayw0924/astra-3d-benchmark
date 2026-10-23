import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
// Same repository test semantics; redirect every persistent test cache into this authorized package.
export default defineConfig({root:process.cwd(),cacheDir:new URL('./test-cache/',import.meta.url).pathname,plugins:[react()],test:{include:['src/**/*.test.{ts,tsx}'],environment:'jsdom',setupFiles:['./src/test/setup.ts'],css:true,cache:false,fsModuleCache:false}});
