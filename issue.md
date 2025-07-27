[dotenv@17.2.1] injecting env (8) from .env -- tip: 📡 version env with Radar: https://dotenvx.com/radar
伺服器啟動於 http://localhost:3000
✅ MSSQL 資料庫連線成功
❌ 查詢工時紀錄失敗： ReferenceError: poolPromise is not defined
    at C:\WorkReport\routes\worklogs.js:116:18
    at Layer.handleRequest (C:\WorkReport\node_modules\router\lib\layer.js:152:17)
    at next (C:\WorkReport\node_modules\router\lib\route.js:157:13)
    at Route.dispatch (C:\WorkReport\node_modules\router\lib\route.js:117:3)
    at handle (C:\WorkReport\node_modules\router\index.js:435:11)
    at Layer.handleRequest (C:\WorkReport\node_modules\router\lib\layer.js:152:17)
    at C:\WorkReport\node_modules\router\index.js:295:15
    at param (C:\WorkReport\node_modules\router\index.js:600:14)
    at param (C:\WorkReport\node_modules\router\index.js:610:14)
    at param (C:\WorkReport\node_modules\router\index.js:610:14)
❌ 儲存工時錯誤： TypeError: db.request is not a function
    at C:\WorkReport\routes\worklogs.js:16:32
    at Layer.handleRequest (C:\WorkReport\node_modules\router\lib\layer.js:152:17)
    at next (C:\WorkReport\node_modules\router\lib\route.js:157:13)
    at Route.dispatch (C:\WorkReport\node_modules\router\lib\route.js:117:3)
    at handle (C:\WorkReport\node_modules\router\index.js:435:11)
    at Layer.handleRequest (C:\WorkReport\node_modules\router\lib\layer.js:152:17)
    at C:\WorkReport\node_modules\router\index.js:295:15
    at processParams (C:\WorkReport\node_modules\router\index.js:582:12)
    at next (C:\WorkReport\node_modules\router\index.js:291:5)
    at Function.handle (C:\WorkReport\node_modules\router\index.js:186:3)
❌ 儲存工時錯誤： TypeError: db.request is not a function
    at C:\WorkReport\routes\worklogs.js:16:32
    at Layer.handleRequest (C:\WorkReport\node_modules\router\lib\layer.js:152:17)
    at next (C:\WorkReport\node_modules\router\lib\route.js:157:13)
    at Route.dispatch (C:\WorkReport\node_modules\router\lib\route.js:117:3)
    at handle (C:\WorkReport\node_modules\router\index.js:435:11)
    at Layer.handleRequest (C:\WorkReport\node_modules\router\lib\layer.js:152:17)
    at C:\WorkReport\node_modules\router\index.js:295:15
    at processParams (C:\WorkReport\node_modules\router\index.js:582:12)
    at next (C:\WorkReport\node_modules\router\index.js:291:5)
    at Function.handle (C:\WorkReport\node_modules\router\index.js:186:3)
寫入週報時發生錯誤： RequestError: Cannot insert the value NULL into column 'UserId', table 'prject4.dbo.WeeklyReports'; column does not allow nulls. INSERT fails.
    at handleError (C:\WorkReport\node_modules\mssql\lib\tedious\request.js:384:15)
    at Connection.emit (node:events:518:28)
    at Connection.emit (C:\WorkReport\node_modules\tedious\lib\connection.js:970:18)
    at RequestTokenHandler.onErrorMessage (C:\WorkReport\node_modules\tedious\lib\token\handler.js:284:21)
    at Readable.<anonymous> (C:\WorkReport\node_modules\tedious\lib\token\token-stream-parser.js:19:33)
    at Readable.emit (node:events:518:28)
    at addChunk (node:internal/streams/readable:561:12)
    at readableAddChunkPushObjectMode (node:internal/streams/readable:538:3)
    at Readable.push (node:internal/streams/readable:393:5)
    at nextAsync (node:internal/streams/from:194:22) {
  code: 'EREQUEST',
  originalError: Error: Cannot insert the value NULL into column 'UserId', table 'prject4.dbo.WeeklyReports'; column does not allow nulls. INSERT fails.
      at handleError (C:\WorkReport\node_modules\mssql\lib\tedious\request.js:382:19)
      at Connection.emit (node:events:518:28)
      at Connection.emit (C:\WorkReport\node_modules\tedious\lib\connection.js:970:18)
      at RequestTokenHandler.onErrorMessage (C:\WorkReport\node_modules\tedious\lib\token\handler.js:284:21)
      at Readable.<anonymous> (C:\WorkReport\node_modules\tedious\lib\token\token-stream-parser.js:19:33)
      at Readable.emit (node:events:518:28)
      at addChunk (node:internal/streams/readable:561:12)
      at readableAddChunkPushObjectMode (node:internal/streams/readable:538:3)
      at Readable.push (node:internal/streams/readable:393:5)
      at nextAsync (node:internal/streams/from:194:22) {
    info: ErrorMessageToken {
      name: 'ERROR',
      handlerName: 'onErrorMessage',
      number: 515,
      state: 2,
      class: 16,
      message: "Cannot insert the value NULL into column 'UserId', table 'prject4.dbo.WeeklyReports'; column does not allow nulls. INSERT fails.",
      serverName: 'Tedliu\\SQLEXPRESS',
      procName: '',
      lineNumber: 2
    }
  },
  number: 515,
  lineNumber: 2,
  state: 2,
  class: 16,
  serverName: 'Tedliu\\SQLEXPRESS',
  procName: '',
  precedingErrors: []
}
