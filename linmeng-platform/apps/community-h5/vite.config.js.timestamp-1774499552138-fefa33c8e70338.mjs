// vite.config.js
import { defineConfig } from "file:///D:/12494/Documents/business-district-news/linmeng-platform/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/12494/Documents/business-district-news/linmeng-platform/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///D:/12494/Documents/business-district-news/linmeng-platform/node_modules/unplugin-vue-components/dist/vite.js";
import { VantResolver } from "file:///D:/12494/Documents/business-district-news/linmeng-platform/node_modules/@vant/auto-import-resolver/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwxMjQ5NFxcXFxEb2N1bWVudHNcXFxcYnVzaW5lc3MtZGlzdHJpY3QtbmV3c1xcXFxsaW5tZW5nLXBsYXRmb3JtXFxcXGFwcHNcXFxcY29tbXVuaXR5LWg1XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFwxMjQ5NFxcXFxEb2N1bWVudHNcXFxcYnVzaW5lc3MtZGlzdHJpY3QtbmV3c1xcXFxsaW5tZW5nLXBsYXRmb3JtXFxcXGFwcHNcXFxcY29tbXVuaXR5LWg1XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8xMjQ5NC9Eb2N1bWVudHMvYnVzaW5lc3MtZGlzdHJpY3QtbmV3cy9saW5tZW5nLXBsYXRmb3JtL2FwcHMvY29tbXVuaXR5LWg1L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCB7IFZhbnRSZXNvbHZlciB9IGZyb20gJ0B2YW50L2F1dG8taW1wb3J0LXJlc29sdmVyJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICByZXNvbHZlcnM6IFtWYW50UmVzb2x2ZXIoKV1cbiAgICB9KVxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTc1LFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogJy9zcmMnXG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvYSxTQUFTLG9CQUFvQjtBQUNqYyxPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osV0FBVztBQUFBLE1BQ1QsV0FBVyxDQUFDLGFBQWEsQ0FBQztBQUFBLElBQzVCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
