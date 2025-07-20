## Steps for the single server

1.env file-frontend backend
```
VITE_BACKEND_URL=https://slowly-hip-badger.ngrok-free.app
paste this
```

2. server.js cors-> origin:https://slowly-hip-badger.ngrok-free.app 

3. npm run build
frontend

4.dist folder to move to view 

//for devlopment 
npm run dev


//for production
pm2 start server.js
//for stop
pm2 stop server.js

