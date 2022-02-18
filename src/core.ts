import { Core, Request, Logger } from "wulfy";
import { createServer, Server } from "http";
import { Readable } from "stream";
import getNetworkAddress from "./getNetworkAddress";

declare module "http" {
	interface IncomingMessage {
		body: string;
	}
}

abstract class HTTPCore extends Core {
	private port?: number;
	private server?: Server;

	protected init() {
		this.port = 8080;
		this.server = createServer();
		this.server.on("request", (req, res) => {
			req.body = "";
			req.on("data", c => req.body += c);
			req.on("end", async () => {
				const request: Request = {
					headers: req.headers,
					method: req.method || "get",
					path: req.url || "/",
					body: req.body || ""
				};

				const response = await this.getResponse(request);

				const headers = response.getHeaders();
				for (const header in headers) {
					const value = headers[header];
					if (value)
						res.setHeader(header, value);
				}

				res.statusCode = response.getStatus();
				const content = response.getContent();
				if (content) {
					if (content instanceof Readable) {
						content.pipe(res);
					} else {
						res.write(content);
						res.end();
					}
				}
				Logger.info(`${request.method} ${request.path} HTTP/${req.httpVersion} ${res.statusCode} ${req.headers['user-agent'] || "-"}`);
			})
		})
	}

	protected __start() {
		if (!this.server) return;
		const port = this.port || 80
		this.server.listen(port, () => {
			Logger.info(`Server launch in port ${port}`);
			const ip = getNetworkAddress();
			Logger.info(`Local - http://localhost:${port}`);
			if (ip !== false)
				Logger.info(`Local - http://${ip}:${port}`);
		});
	}

	protected __stop() {
		if (!this.server) return;

		this.server.close(e => {
			e ? Logger.error(e) : Logger.info(`Server stoped`);
		});
	}
}

export default HTTPCore;
