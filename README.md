# axios-helper
axios帮助函数

## demo

```javascript
import axios from "axios";
import { cancelHelper } from "@guojiabing/axios-helper";

const instance = axios.create({
  baseURL: "https://some-domain.com/api/",
  timeout: 1000,
  headers: { "X-Custom-Header": "foobar" },
});

cancelHelper(instance); // 添加自动取消重复请求过滤器
```
