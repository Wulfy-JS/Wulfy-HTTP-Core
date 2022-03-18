# Wulfy Http-Core
 
# Usage

```ts
import HttpCore from "wulfy-http-core";

class MyCore extends HttpCore {
	protected configure() {
		return {
			// ...
		}
	}
}

new MyCore().start()
```

Add the following environment variables in .env file
```
# Port for HTTP server. Default = 80
PORT=80

##### SEC #####
# Path to public key for HTTPS server. 
## If omitted, the HTTPS server will not be created.
## If the specified file is not found, the server will not be created.
SEC_KEY="path/to/public.key" 

# Path to certificate for HTTPS server.
## If omitted, the HTTPS server will not be created.
## If the specified file is not found, the server will not be created.
SEC_CERT="path/to/public.cert" 


# Port for HTTPS server. Default = 443
SEC_PORT=443 

# Set true, if you want redirect to HTTPS
SEC_REDIERCT=true
# HTTP-Code for redirect to HTTPS. Default - 308 
SEC_REDIERCT_CODE=308
# Set domain for redirect, if user not send host in headers
HOST="localhost"
```
